const InvalidRequestError = () => {
  return {
    type: "HTTPError",
    statusCode: 422,
    message: "Invalid request input."
  };
};

const DateRangeError = () => {
  return {
    type: "HTTPError",
    statusCode: 400,
    message: "Invalid date range."
  };
};

module.exports = {
  InvalidRequestError,
  DateRangeError
};
