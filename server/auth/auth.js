var knex = require('../db');

module.exports = {
  verifyUser
};

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
