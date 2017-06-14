var knex = require("../db");

module.exports = {
  validate
};

function validate(req, res) {
  res.status(200).send("Valid user!");
}
