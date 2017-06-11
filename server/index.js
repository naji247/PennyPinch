var express = require('express');  
var app = express();  
var db  = require('./db');
const auth = require('./auth/routes');

var port = 4000;

app.listen(port);  
console.log("Listening on port", port);  


app.use('/auth', auth);
