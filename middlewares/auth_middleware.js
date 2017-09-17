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
      .getAsync("me", { input_token: token })
      .then(tokenInfo => {
        //TODO: Add check for current app matches token
        if (!tokenInfo.id || tokenInfo.id != fbid) {
          throw UserUnauthorizedError();
        }
        next();
        return null;
      })
      .catch(err => {
        next(UserUnauthorizedError());
      });
  });
};
