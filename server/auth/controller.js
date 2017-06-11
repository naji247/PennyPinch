var knex = require('../db');

module.exports = {
  validate,
};

function validate(req, res) {
  knex('users').where({
    fbid: 'Test id',
  }).select('first_name', 'last_name').then( (users) => {
    res.status(200).send(users);
  });
}
