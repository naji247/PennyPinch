var express = require("express"),
  router = express.Router();
var User = require("../models/user_model");

router.get("/long_token", (req, res, next) => {
  const shortToken = req.headers.fbtoken;
  User.getLongToken(shortToken)
    .then(longToken => {
      res.json(longToken);
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;
