var express = require("express"),
  router = express.Router(),
  Challenge = require("../models/challenge_model");
const { UserIDMismatchError } = require("../errors/user_errors");
const { ChallengeParticipationError } = require("../errors/challenge_errors");

router.post("/", function(req, res, next) {
  const { start_date, end_date, name, challenge_type, goal, fbids } = req.body;
  const fbid = req.headers.fbid;

  if (!fbids.includes(fbid)) {
    // user creating challenge must participate in it
    next(ChallengeParticipationError());
  } else {
    Challenge.create(start_date, end_date, name, challenge_type, goal, fbids)
      .then(challenge => {
        res.json(challenge);
      })
      .catch(err => {
        next(err);
      });
  }
});

module.exports = router;
