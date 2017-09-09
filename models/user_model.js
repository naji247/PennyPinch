var db = require("../db");
var _ = require("underscore");
var Promise = require("bluebird");
var graph = require("fbgraph");
var fb_config = require("../config/facebook");
Promise.promisifyAll(graph);

const { InvalidRequestError } = require("../errors/common_errors");
const {
  UserNotFoundError,
  UserUnauthorizedError,
  UserCreationError
} = require("../errors/user_errors");
const { ChallengeQueryError } = require("../errors/challenge_errors");

const createUser = (token, fbid, first_name, last_name, email) => {
  if (!token || !fbid || !first_name || !last_name || !email) {
    throw InvalidRequestError();
  }
  const user = {
    fbtoken: token,
    fbid: fbid,
    first_name: first_name,
    last_name: last_name,
    email: email
  };
  return db("users")
    .returning("*")
    .insert(user)
    .catch(err => {
      throw UserCreationError(err);
    });
};

const getUser = fbid => {
  if (!fbid) {
    throw InvalidRequestError();
  }

  return db("users")
    .first("*")
    .where({ fbid: fbid })
    .then(user => {
      if (!user) {
        throw UserNotFoundError();
      }
      return user;
    });
};

const loginUser = (token, fbid, first_name, last_name, email) => {
  if (!token || !fbid || !first_name || !last_name || !email) {
    throw InvalidRequestError();
  }

  var longTokenInfo = null;

  graph.setAccessToken(token);
  var params = {
    grant_type: "fb_exchange_token",
    client_id: fb_config.client_id,
    client_secret: fb_config.client_secret,
    fb_exchange_token: token
  };

  // Grab long token from Facebook.
  return graph
    .getAsync("/oauth/access_token", params)
    .then(response => {
      longTokenInfo = response;
      return createUser(
        longTokenInfo.access_token,
        fbid,
        first_name,
        last_name,
        email
      );
    })
    .then(user => {
      // Case 1: We successfully created a new user.
      return longTokenInfo;
    })
    .catch(err => {
      // Case 2: Something bad happened
      if (!longTokenInfo || err.statusCode != 409) {
        throw InvalidRequestError();
      }
      // Case 3: The user already existed in our database.
      return longTokenInfo;
    });
};

const getChallenges = (fbid, active) => {
  if (!fbid) {
    throw InvalidRequestError();
  }
  var challenge_ids = db("challenges_users")
    .select("challenge_id")
    .where("fbid", fbid);

  var query = db
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
        .where("challenges.challenge_id", "in", challenge_ids);
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
    .orderBy("participating_users.end_date", "ASC")
    .orderByRaw("spent ASC");

  if (active !== undefined && active == "1") {
    query = query
      .andWhereRaw("participating_users.start_date < now()")
      .andWhereRaw("participating_users.end_date >= now()");
  } else if (active !== undefined && active == "0") {
    query = query.andWhereRaw("participating_users.end_date <= now()");
  }
  return query
    .then(queryRes => {
      var challengeObj = _.groupBy(queryRes, "challenge_id");
      return _.map(challengeObj, rows => {
        currChallenge = _.omit(rows[0], [
          "fbid",
          "first_name",
          "last_name",
          "spent"
        ]);
        currChallenge.users = _.map(rows, elem =>
          _.pick(elem, ["fbid", "first_name", "last_name", "spent"])
        );
        return currChallenge;
      });
    })
    .catch(err => {
      throw ChallengeQueryError(err);
    });
};

module.exports = {
  loginUser,
  createUser,
  getUser,
  getChallenges
};
