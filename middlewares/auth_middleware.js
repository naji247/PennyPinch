var Promise = require("bluebird");
var graph = require("fbgraph");
Promise.promisifyAll(graph);
const { InvalidRequestError } = require("../errors/common_errors");
const { UserUnauthorizedError } = require("../errors/user_errors");

module.exports = app => {
  app.use(function(req, res, next) {
    const token = req.headers.fbtoken;
    const fbid = req.headers.fbid;
    if (!token || !fbid) {
      throw InvalidRequestError();
    }
    graph.setAccessToken(token);
    graph
      .getAsync("debug_token", { input_token: token })
      .then(tokenInfo => {
        //TODO: Add check for current app matches token
        if (!tokenInfo.data.is_valid || tokenInfo.data.user_id != fbid) {
          throw UserUnauthorizedError();
        }
        next();
      })
      .catch(err => {
        next(UserUnauthorizedError());
      });
  });
};
