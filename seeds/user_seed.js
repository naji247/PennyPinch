exports.seed = (knex, Promise) => {
  var user = {
    fbtoken:
      "EAADWQgBxLzgBAENRsXF5u7ojRxuuhlEMsBGCoBZCT9RHjd8ZCobTG8u0lvRQWP5voBD02vVcPQ6PpbqwZCvNtmaZBIvE0doeCgkLp0BZAnMyXq83YcrB9pYkXtFPAZA7yHya078jYZC5sV4bfVNU85YuhWJHULhoZCQZD",
    fbid: "10213562629564298",
    first_name: "Naseem",
    last_name: "Al-Naji",
    email: "naji247@gmail.com"
  };
  return Promise.join(
    // Deletes ALL existing entries
    knex("users").del(),
    // Inserts seed entries
    knex("users").insert(user)
  );
};
