var express = require("express"),
  router = express.Router();

router.use("/users", require("./controllers/users_controller"));
router.use("/auth", require("./controllers/auth_controller"));

module.exports = router;
