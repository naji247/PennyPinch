var knex = require('../db');
var Promise = require('bluebird');
var graph = require('fbgraph');
var httpError = require('../utils/errors').httpError;

Promise.promisifyAll(graph);


module.exports = {
  findUser,
  createUser
};

function findUser(req, res) {
  const fbtoken = req.headers.fbtoken;
  const fbid = req.params.userId;

  // if no email or password then send
  if (!fbtoken || !fbid) {
    return res.status(422).send({ error: 'You need valid token and user id.' });
  }

  // look user up in the DB so we can check
  // if the tokens match
  verifyToken(fbtoken, fbid).then((tokenInfo) => {
    return knex.table('users').first('*').where({fbid: fbid});
  })
    .then( (user) => {
      if (!user) {
        throw httpError(404, 'User not found, try a different id.');
      }
      res.send(user);
    })
    .catch((err) => {
      if (err.type && err.type == 'HTTPError') {
        res.status(err.statusCode).send({ error: err.message });
      } else {
        res.status(500).send({ error: err.message });
      }
    });
}

function isShortToken(tokenInfo) {
  const expirationDate = new Date(tokenInfo.data.expires_at * 1000);
  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (expirationDate > tomorrow) {
    return false;
  } 
  return true;
}

function verifyToken(token, fbid) {
    graph.setAccessToken(token);
    return graph.getAsync('debug_token', {"input_token": token})
    .then( (tokenInfo) => {
      //TODO: Add check for current app matches token
      if (!tokenInfo.data.is_valid || tokenInfo.data.user_id != fbid) {
        throw httpError(401, 'Unauthorized: Token invalid.');
      }
      return tokenInfo;
    })
    .catch( (err) => {
      if (err.type == 'OAuthException' ) {
        throw httpError(401, err.message);
      }
      throw err;
    });
}

function createUser(req, res) {
  const fbtoken = req.body.fbtoken;
  const fbid = req.body.fbid;
  const first_name = req.body.first_name;
  const last_name = req.body.last_name;
  const email = req.body.email;

  // if no email or password then send
  if (!fbtoken || !fbid || !first_name
      || !last_name || !email) {
    return res.status(422).send({ error: 'You need valid token, user id, email, first_name, or last_name.' });
  }

  verifyToken(fbtoken, fbid)
    .then((tokenInfo) => {
      return knex('users').returning('*').insert({
        first_name: first_name,
        last_name: last_name,
        fbid: fbid,
        fbtoken: fbtoken,
        email: email
      })
    })
    .then((user) => {
      res.send(user[0]);
    })
    .catch((err) => {
      // Postgres Conflict 
      if (err.code == '23505') {
        res.status(409).send({ error: err.detail });
      } 
      // Token / Auth Error
      else if (err.type && err.type == 'HTTPError') {
        res.status(err.statusCode).send({ error: err.message });
      } 
      // Something went wrong
      else {
        res.status(500).send({ error: err.message });
      }

    });
}