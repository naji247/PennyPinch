exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable("transactions", function(table) {
      table
        .uuid("transaction_id")
        .defaultTo(knex.raw("uuid_generate_v4()"))
        .primary();
      table.string("fbid");
      table
        .foreign("fbid")
        .references("fbid")
        .inTable("users")
        .onDelete("CASCADE");
      table.float("amount");
      table.date("date");
      table.string("description");
      table.timestamp("created_at").notNullable().defaultTo(knex.raw("now()"));
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable("transactions")]);
};
