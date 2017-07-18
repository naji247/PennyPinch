const ChallengeParticipationError = () => {
  return {
    type: "HTTPError",
    statusCode: 400,
    message: "User creating challenge must participate in it"
  };
};

const ChallengeCreationError = err => {
  var message = "Failed to create challenge.";
  var statusCode = 500;

  if (err && err.code == "23505") {
    statusCode = 409;
    message = "Conflict. Challenge already exists.";
  }

  return {
    type: "HTTPError",
    statusCode: statusCode,
    message: message
  };
};

module.exports = {
  ChallengeParticipationError,
  ChallengeCreationError
};
