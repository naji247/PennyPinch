var express = require("express"),
  app = express();

var db = require("./db");

require("./middlewares/parser")(app);
app.use(require("./controllers"));

var server = app.listen(4000);

require("./middlewares/error_handler")(app);

module.exports = server;
