var db = require("../db");
var _ = require("underscore");
const { InvalidRequestError } = require("../errors/common_errors");
const { ChallengeCreationError } = require("../errors/challenge_errors");

exports.get = challenge_id => {
  if (!challenge_id) {
    throw InvalidRequestError();
  }
  return db
    .with("participating_users", qb => {
      qb
        .select(
          "challenges.challenge_id",
          "challenges.name",
          "challenges.start_date",
          "challenges.end_date",
          "challenges.challenge_type",
          "challenges.goal",
          "users.first_name",
          "users.last_name",
          "users.fbid"
        )
        .from("challenges")
        .leftJoin(
          "challenges_users",
          "challenges.challenge_id",
          "challenges_users.challenge_id"
        )
        .leftJoin("users", "challenges_users.fbid", "users.fbid")
        .where("challenges.challenge_id", challenge_id);
    })
    .select(
      "participating_users.*",
      db.raw("COALESCE(SUM(-all_transactions.amount),0) AS spent")
    )
    .from(function() {
      this.select("participating_users.*", "transactions.amount")
        .from("participating_users")
        .leftJoin(
          "transactions",
          "participating_users.fbid",
          "transactions.fbid"
        )
        .where("transactions.amount", "<", 0)
        .andWhereRaw(
          "transactions.date BETWEEN participating_users.start_date AND participating_users.end_date"
        )
        .as("all_transactions");
    })
    .rightJoin(
      "participating_users",
      "participating_users.fbid",
      "all_transactions.fbid"
    )
    .groupBy(
      "participating_users.challenge_id",
      "participating_users.name",
      "participating_users.start_date",
      "participating_users.end_date",
      "participating_users.challenge_type",
      "participating_users.goal",
      "participating_users.fbid",
      "participating_users.first_name",
      "participating_users.last_name"
    )
    .orderByRaw("spent ASC")
    .then(queryResults => {
      var challengeDetails = _.omit(queryResults[0], [
        "fbid",
        "first_name",
        "last_name",
        "spent"
      ]);
      challengeDetails.participants = _.map(queryResults, user =>
        _.pick(user, ["fbid", "first_name", "last_name", "spent"])
      );
      return challengeDetails;
    });
};

exports.create = (start_date, end_date, name, challenge_type, goal, fbids) => {
  if (!start_date || !end_date || !name || !challenge_type || !goal || !fbids) {
    throw InvalidRequestError();
  }

  const challenge = {
    start_date: start_date,
    end_date: end_date,
    name: name,
    challenge_type: challenge_type,
    goal: goal
  };

  var createdChallenge = null;
  return db("challenges")
    .returning("*")
    .insert(challenge)
    .then(challenge => {
      createdChallenge = challenge;
      const challenge_id = challenge[0].challenge_id;
      const challenges_users = fbids.map(fbid => {
        return { fbid: fbid, challenge_id: challenge_id };
      });
      return db("challenges_users").returning("*").insert(challenges_users);
    })
    .then(() => {
      return createdChallenge;
    })
    .catch(err => {
      throw ChallengeCreationError(err);
    });
};

exports.getProgress = (fbid, challengeId) => {
  return db("challenges").select();
};
