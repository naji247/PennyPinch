exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table("challenges", table => {
      table.float("goal");
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table("challenges", table => {
      table.dropColumn("goal");
    })
  ]);
};
