const httpError = (statusCode, message) => {
  return { type: "HTTPError", statusCode: statusCode, message: message };
};

module.exports = {
  httpError
};
