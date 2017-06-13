var knex = require('../db');
var graph = require('fbgraph');
var Promise = require('bluebird');
var fb_config = require('../config/facebook');

Promise.promisifyAll(graph);


module.exports = {
  verifyUser,
  getLongToken
};

function getLongToken(req, res) {
  const shortToken = req.headers.fbtoken;

  graph.setAccessToken(shortToken);
  var params = {
    'grant_type': 'fb_exchange_token',
    'client_id': fb_config.client_id,
    'client_secret': fb_config.client_secret,
    'fb_exchange_token': shortToken
  };
  
  graph.getAsync('/oauth/access_token', params).then((tokenInfo) => {
    res.send(tokenInfo);
  }).catch( (err) => {
    res.status(401).send({error: err.message});
  });
}



// Authenticate the user
function verifyUser() {
  return (req, res, next) => {
    const fbtoken = req.headers.fbtoken;
    const fbid = req.headers.fbid;

    // if no email or password then send
    if (!fbtoken || !fbid) {
      return res.status(400).send({ error: 'You need valid token and user id.' });
    }

    // look user up in the DB so we can check
    // if the tokens match
    knex('users').where({
      fbid: fbid
    }).select('*').then( (user) => {
      if (user.length == 0) {
        res.status(404).send({error: 'User not found, try a different id.'});
      }

      if (user[0].fbtoken != fbtoken) {
        res.status(401).send({error: 'Unauthorized: Token invalid.'});
        // TODO: check if token is valid
      }

      res.status(200).send(user);
    }).catch( (err) => {
      res.status(500).send({error: 'Problem verifying user.'});
    });
  };
}
