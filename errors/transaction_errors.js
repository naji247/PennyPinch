const TransactionNotFoundError = () => {
  return {
    type: "HTTPError",
    statusCode: 404,
    message: "Transaction not found, try a different id."
  };
};

const TransactionCreationError = err => {
  var message = "Failed to create transaction.";
  var statusCode = 500;

  if (err && err.code == "23505") {
    statusCode = 409;
    message = "Conflict. Transaction already exists.";
  }

  if (err && err.code == "23503") {
    statusCode = 404;
    message = "Conflict. User does not exist for transaction.";
  }

  return {
    type: "HTTPError",
    statusCode: statusCode,
    message: message
  };
};

module.exports = {
  TransactionCreationError
};
