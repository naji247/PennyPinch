exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table("users", table => {
      table.dropTimestamps();
    }),
    knex.schema.table("users", table => {
      table.timestamp("created_at").notNullable().defaultTo(knex.raw("now()"));
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table("users", table => {
      table.dropColumn("created_at");
    }),
    knex.schema.table("users", table => {
      table.timestamps();
    })
  ]);
};
