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

exports.create = (token, fbid, first_name, last_name, email) => {
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

exports.get = fbid => {
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

exports.getLongToken = shortToken => {
  if (!shortToken) {
    throw InvalidRequestError();
  }
  graph.setAccessToken(shortToken);
  var params = {
    grant_type: "fb_exchange_token",
    client_id: fb_config.client_id,
    client_secret: fb_config.client_secret,
    fb_exchange_token: shortToken
  };

  return graph.getAsync("/oauth/access_token", params).catch(err => {
    throw InvalidRequestError();
  });
};
