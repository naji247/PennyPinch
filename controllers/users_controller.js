var express = require("express"),
  router = express.Router(),
  User = require("../models/user_model");

router.get("/:fbid", function(req, res, next) {
  const token = req.headers.fbtoken;
  const fbid = req.params.fbid;

  User.get(fbid)
    .then(user => {
      res.json(user);
    })
    .catch(err => {
      next(err);
    });
});

router.post("/", function(req, res, next) {
  const { fbtoken, fbid, first_name, last_name, email } = req.body;

  User.create(fbtoken, fbid, first_name, last_name, email)
    .then(user => {
      res.json(user);
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;
