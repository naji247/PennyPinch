exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable("challenges_users", function(table) {
      table
        .uuid("challengers_users_id")
        .defaultTo(knex.raw("uuid_generate_v4()"))
        .primary();
      table.string("fbid");
      table.uuid("challenge_id");
      table
        .foreign("fbid")
        .references("fbid")
        .inTable("users")
        .onDelete("CASCADE");
      table
        .foreign("challenge_id")
        .references("challenge_id")
        .inTable("challenges")
        .onDelete("CASCADE");
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable("challenges_users")]);
};
