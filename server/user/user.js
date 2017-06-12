var knex = require('../db');
var Promise = require('bluebird');
var graph = require('fbgraph');

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
  knex('users').where({
    fbid: fbid
  }).select('*').then( (user) => {
    if (user.length == 0) {
      return res.status(404).send({error: 'User not found, try a different id.'});
    }
    verifyToken(fbtoken, res).then( () => {
      res.send(user[0]);
    })

  })
  .catch( (err) => {
    return res.status(500).send({error: 'Problem verifying user.'});
  });
}

function verifyToken(token, res) {
  return new Promise( (resolve, reject) => {
    graph.setAccessToken(token);
    graph.getAsync('debug_token', {"input_token": token})
    .then( (tokenInfo) => {
      //TODO: Add check for current app matches token
      if (!tokenInfo.data.is_valid) {
        return res.status(401).send({error: 'Unauthorized: Token invalid.'})
      }
      resolve();
    })
    .catch( (err) => {
      if (err.type == 'OAuthException' ) {
        return res.status(401).send({error: err.message});
      }
      return res.status(500).send({error: "Failed to validate token."});
    })
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

  knex('users').returning('*').insert({
    first_name: first_name,
    last_name: last_name,
    fbid: fbid,
    fbtoken: fbtoken,
    email: email
  }).then( (user) => {
      return res.send(user[0]);
  }).catch( (err) => {
    // User already exists
    if (err.code == '23505') {
      return res.status(409).send({error: err.detail});
    }
    // Couldnt create for some reason
    return res.status(400).send({error: "Could not save user."});
  });
}
