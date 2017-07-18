var express = require("express"),
  router = express.Router();

router.use("/users", require("./controllers/users_controller"));
router.use("/auth", require("./controllers/auth_controller"));
router.use(
  "/users/:fbid/transactions",
  require("./controllers/transaction_controller")
);
router.use("/challenges", require("./controllers/challenges_controller"));

module.exports = router;
