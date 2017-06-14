var express = require("express");
var app = express();
var graph = require("fbgraph");
var db = require("./db");
const router = require("express").Router();

const auth = require("./auth/routes");
const users = require("./user/routes");

var port = 4000;

require("./config/middlewares")(app);

app.listen(port);
console.log("Listening on port", port);

app.use("/auth", auth);
app.use("/users", require("./user/routes"));
