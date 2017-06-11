const Router = require('express').Router();
const verifyUser = require('./auth').verifyUser;
const controller = require('./controller');

Router.get('/', verifyUser());

module.exports = Router;
