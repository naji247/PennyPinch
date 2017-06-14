var assert = require("assert");
var request = require("supertest");
var knex = require("../server/db");

const createUser = require("../server/user/user").createUser;
describe("User Tests", function() {
  describe("#get user", function() {
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
        "EAADWQgBxLzgBALE8ZB6uewrADX3dj2QB8bhdl9R2NMN4iZBdEuj6hVilwMvDRUAkNu1mDXI3Qp2sCO88RRFUXIANQj3aXWZAID0n7LX813rvJmUZBPESD0Eo7sjydGRNaoAQmZBFDD3oOyd0xoIZB5JBvb52ZCkhJV72NFPkPFHIqZBmCsptqXoraxSj6seuQcQZD",
      fbid: "1555981821079083",
      first_name: "Derek",
      last_name: "Lou",
      email: "derek.dlou@gmail.com"
    };

    beforeEach(function() {
      server = require("../server/index");
    });

    afterEach(function() {
      server.close();
    });

    it("should return 200 when asking for the existing user", function(done) {
      knex("users").insert();
      request(server)
        .get("/users/" + user.fbid)
        .set("fbtoken", user.fbtoken)
        .expect(200, done);
    });

    it("should return 401 when sent invalid token", function(done) {
      request(server)
        .get("/users/" + user.fbid)
        .set("fbtoken", "fake token")
        .expect(401, done);
    });

    it("should return 401 when sent fbid that doesn't match token", function(
      done
    ) {
      request(server)
        .get("/users/" + "fake fbid")
        .set("fbtoken", user.fbtoken)
        .expect(401, done);
    });
  });
});
