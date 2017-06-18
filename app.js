var express = require("express"),
  app = express();

var db = require("./db");
// Middleware before controllers
require("./middlewares/parser_middleware")(app);
require("./middlewares/auth_middleware")(app);

app.use(require("./routes"));

// Middleware after controllers
require("./middlewares/error_middleware")(app);
var server = app.listen(4000);

module.exports = server;
