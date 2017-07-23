var db = require("../db");
const { InvalidRequestError } = require("../errors/common_errors");
const { ChallengeCreationError } = require("../errors/challenge_errors");

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
