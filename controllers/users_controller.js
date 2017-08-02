var express = require("express"),
  router = express.Router(),
  User = require("../models/user_model");
const { UserIDMismatchError } = require("../errors/user_errors");

router.get("/:fbid", function(req, res, next) {
  const fbid = req.params.fbid;

  User.getUser(fbid)
    .then(user => {
      res.json(user);
    })
    .catch(err => {
      next(err);
    });
});

router.get("/:fbid/challenges", function(req, res, next) {
  const fbid = req.params.fbid;
  const active = req.query.active;

  User.getChallenges(fbid, active)
    .then(challenges => {
      res.json(challenges);
    })
    .catch(err => {
      next(err);
    });
});

router.post("/", function(req, res, next) {
  const { fbtoken, fbid, first_name, last_name, email } = req.body;
  const headerid = req.headers.fbid;

  if (fbid && fbid != headerid) {
    next(UserIDMismatchError());
  } else {
    User.createUser(fbtoken, fbid, first_name, last_name, email)
      .then(user => {
        res.json(user[0]);
      })
      .catch(err => {
        next(err);
      });
  }
});

module.exports = router;
