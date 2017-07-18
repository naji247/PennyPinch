exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable("challenges", function(table) {
      table
        .uuid("challenge_id")
        .defaultTo(knex.raw("uuid_generate_v4()"))
        .primary();
      table.date("start_date");
      table.date("end_date");
      table.string("name");
      table.string("challenge_type");
      table.timestamp("created_at").notNullable().defaultTo(knex.raw("now()"));
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable("challenges")]);
};
