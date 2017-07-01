var express = require("express"),
  router = express.Router(),
  Transaction = require("../models/transaction_model");
// User = require("../models/user_model");

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

router.post("/", function(req, res, next) {
  const { fbid, amount, date, description } = req.body;
  Transaction.create(fbid, amount, date, description)
    .then(transaction => {
      res.json(transaction[0]);
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;
