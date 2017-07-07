var assert = require("assert");
var request = require("supertest");
var knex = require("../db");

describe("Transaction Tests", () => {
  var server;
  var user = {
    fbtoken:
      "EAADWQgBxLzgBAENRsXF5u7ojRxuuhlEMsBGCoBZCT9RHjd8ZCobTG8u0lvRQWP5voBD02vVcPQ6PpbqwZCvNtmaZBIvE0doeCgkLp0BZAnMyXq83YcrB9pYkXtFPAZA7yHya078jYZC5sV4bfVNU85YuhWJHULhoZCQZD",
    fbid: "10213562629564298",
    first_name: "Naseem",
    last_name: "Al-Naji",
    email: "naji247@gmail.com"
  };

  var missingUser = {
    fbtoken:
      "EAADWQgBxLzgBAKH53iXLDUZCuxjMRdUGUc4cAsGiLeeorszsBZAJm9gvXl3QUc9sKtgTMvVBb4QSYaXaY5SbXNkYO3o9oz9xLMPbOLqErZA4IYqL2a22NHzOd7zzeVkz5I58fK6dB54TKi6AsuBBwOld1XwuJXgqdAc0btZCewZDZD",
    fbid: "1555981821079083",
    first_name: "Derek",
    last_name: "Lou",
    email: "derek.dlou@gmail.com"
  };

  beforeEach(done => {
    server = require("../app");
    knex.migrate
      .latest()
      .then(function() {
        return knex.seed.run();
      })
      .then(function() {
        done();
      });
  });

  afterEach(done => {
    knex.migrate.rollback().then(() => {
      server.close();
      done();
    });
  });

  it("should return 200 when creating a new transaction", done => {
    request(server)
      .post(`/users/${user.fbid}/transactions/`)
      .set("fbid", user.fbid)
      .set("fbtoken", user.fbtoken)
      .send({
        amount: -10,
        date: "2017-06-30",
        description: "pizza"
      })
      .expect(200, done);
  });
  it("should return 200 when getting a user's transactions", done => {
    request(server)
      .get(`/users/${user.fbid}/transactions/`)
      .set("fbid", user.fbid)
      .set("fbtoken", user.fbtoken)
      .expect(200, done);
  });
});
