exports.seed = function(knex, Promise) {
  return Promise.join(
    // Deletes ALL existing entries
    knex("transactions").del()
  );
};
