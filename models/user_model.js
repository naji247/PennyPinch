var db = require("../db");
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
  return db("challenges_users")
    .select("*")
    .where({ fbid: fbid })
    .then(challenges_users => {
      challenge_ids = challenges_users.map(
        challenge_user => challenge_user.challenge_id
      );
      var allChallenges = db("challenges")
        .select("*")
        .whereIn("challenge_id", challenge_ids);
      if (active !== undefined && active == "1") {
        return allChallenges
          .andWhereRaw("start_date < now()")
          .andWhereRaw("end_date >= now()");
      } else if (active !== undefined && active == "0") {
        return allChallenges.andWhereRaw("end_date <= now()");
      } else {
        return allChallenges;
      }
    })
    .catch(err => {
      throw UserCreationError(err);
    });
};

module.exports = {
  loginUser,
  createUser,
  getUser,
  getChallenges
};
