var express = require("express"),
  router = express.Router({ mergeParams: true }),
  Transaction = require("../models/transaction_model");
User = require("../models/user_model");
const { UserIDMismatchError } = require("../errors/user_errors");

router.get("/", function(req, res, next) {
  const start = req.query.start;
  const end = req.query.end;
  const fbid = req.params.fbid;
  Transaction.getTransactionsForUser(fbid, start, end)
    .then(transactions => {
      res.json(transactions);
    })
    .catch(err => {
      next(err);
    });
});

router.post("/", function(req, res, next) {
  const fbid = req.params.fbid;
  const { amount, date, description } = req.body;
  const headersFbid = req.headers.fbid;

  if (fbid != headersFbid) {
    // path param fbid must match header fbid
    next(UserIDMismatchError());
  } else {
    Transaction.create(fbid, amount, date, description)
      .then(transaction => {
        res.json(transaction[0]);
      })
      .catch(err => {
        next(err);
      });
  }
});

module.exports = router;
