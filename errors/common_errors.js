const InvalidRequestError = () => {
  return {
    type: "HTTPError",
    statusCode: 422,
    message: "Invalid request input."
  };
};

module.exports = {
  InvalidRequestError
};
