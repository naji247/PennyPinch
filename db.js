var config = require("./knexfile.js");
var env = process.env.NODE_ENV;
var knex = require("knex")(config[env]);

module.exports = knex;

if (process.env.NODE_ENV == "development") {
  knex.migrate.latest([config]);
}
