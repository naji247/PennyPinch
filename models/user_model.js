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
  return db("users").returning("*").insert(user).catch(err => {
    throw UserCreationError(err);
  });
};

const getUser = fbid => {
  if (!fbid) {
    throw InvalidRequestError();
  }

  return db("users").first("*").where({ fbid: fbid }).then(user => {
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
  var selectedChallenges = db("challenges_users")
    .select(
      "challenges_users.challenge_id",
      "challenges.name",
      "challenges.start_date",
      "challenges.end_date",
      "challenges.challenge_type",
      "challenges.goal",
      "cu2.fbid",
      "users.first_name",
      "users.last_name"
    )
    .leftJoin(
      "challenges",
      "challenges_users.challenge_id",
      "challenges.challenge_id"
    )
    .leftJoin(
      "challenges_users AS cu2",
      "challenges.challenge_id",
      "cu2.challenge_id"
    )
    .leftJoin("users", "cu2.fbid", "users.fbid")
    .where("challenges_users.fbid", fbid);

  if (active !== undefined && active == "1") {
    selectedChallenges = selectedChallenges
      .andWhereRaw("start_date < now()")
      .andWhereRaw("end_date >= now()");
  } else if (active !== undefined && active == "0") {
    selectedChallenges = selectedChallenges.andWhereRaw("end_date <= now()");
  }
  return selectedChallenges
    .orderBy("end_date", "ASC")
    .then(selectedChallenges => {
      var challengeObj = _.groupBy(selectedChallenges, "challenge_id");
      return _.map(challengeObj, rows => {
        currChallenge = _.omit(rows[0], ["fbid", "first_name", "last_name"]);
        currChallenge.users = _.map(rows, elem =>
          _.pick(elem, ["fbid", "first_name", "last_name"])
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
