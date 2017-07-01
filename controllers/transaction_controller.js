var express = require("express"),
  router = express.Router({ mergeParams: true }),
  Transaction = require("../models/transaction_model");
User = require("../models/user_model");
const { UserIDMismatchError } = require("../errors/user_errors");

// router.get("/:transactionid", function(req, res, next) {
//   const transactionid = req.params.transactionid;

//   Transaction.get(transactionid)
//     .then(transaction => {
//       res.json(transaction);
//     })
//     .catch(err => {
//       next(err);
//     });
// });

router.get("/", function(req, res, next) {
  const fbid = req.params.fbid;
  Transaction.getTransactionsForUser(fbid)
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

  if (fbid && fbid != headersFbid) {
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
