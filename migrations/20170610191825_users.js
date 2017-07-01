exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable("users", function(table) {
      table.string("fbid").primary();
      table.string("first_name");
      table.string("last_name");
      table.string("email");
      table.string("fbtoken");
      table.timestamps();
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable("users")]);
};
