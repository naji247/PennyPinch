const Router = require('express').Router();
const verifyUser = require('./auth').verifyUser;
const getLongToken = require('./auth').getLongToken;

const controller = require('./controller');

Router.get('/', verifyUser());
Router.route('/long_token').get( getLongToken );

module.exports = Router;
