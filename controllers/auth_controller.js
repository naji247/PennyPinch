var express = require("express"),
  router = express.Router();
var User = require("../models/user_model");

router.post("/login", (req, res, next) => {
  const fbtoken = req.headers.fbtoken;
  const fbid = req.headers.fbid;
  const { first_name, last_name, email } = req.body;
  User.loginUser(fbtoken, fbid, first_name, last_name, email)
    .then(user => {
      res.json(user);
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;
