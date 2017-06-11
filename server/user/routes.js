const Router = require('express').Router();
const findUser = require('./user').findUser;
const createUser = require('./user').createUser;

Router.route('/:userId').get( findUser );

Router.route('/').post( createUser );

module.exports = Router;
