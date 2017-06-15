const UserNotFoundError = () => {
  return {
    type: "HTTPError",
    statusCode: 404,
    message: "User not found, try a different id."
  };
};

const UserUnauthorizedError = () => {
  return {
    type: "HTTPError",
    statusCode: 401,
    message: "Unauthorized: Token invalid."
  };
};

const UserCreationError = err => {
  var message = "Failed to create user.";
  var statusCode = 500;

  if (err && err.code == "23505") {
    statusCode = 409;
    message = "Conflict. User already exists.";
  }

  return {
    type: "HTTPError",
    statusCode: statusCode,
    message: message
  };
};

module.exports = {
  UserNotFoundError,
  UserUnauthorizedError,
  UserCreationError
};
