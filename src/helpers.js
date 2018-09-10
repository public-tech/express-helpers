'use strict';

const writeResponse = function(req, res, status, data, err) {
  res.statusCode = status;
  if (err) {
    res.send(JSON.stringify(err));
  } else {
    res.send(data);
  }
};

const logErrors = function(err, req, res, next) {
  console.error(`Error: ${err.message}\r\nStack: ${err.stack}`);
  next(err);
};

const sendErrorToClient = function(err, req, res, next) {
  // create new error with no details and send to the client (so we don't leak details or a stack trace)
  res.status(500).send({ error: {message: "Something went terribly wrong"} });
  next(err);
};

const sendInvalidApiCall = function(err, req, res, next) {
  //could split to use 501 for invalid routes and 400 for invalid params - discuss.
  res.status(400).send(
    {error:{message:"Invalid use of API. Please check that you have included all the required parameters in your call."} 
  });
  next(err);
};

const awaitHandlerFactory = (middleware) => {
  return async (req, res, next) => {
    await middleware(req, res, next)
      .catch(err => {
        next(err);
      }
  )}
};

module.exports.writeResponse = writeResponse;
module.exports.logErrors = logErrors;
module.exports.sendErrorToClient = sendErrorToClient;
module.exports.awaitHandlerFactory = awaitHandlerFactory;
module.exports.sendInvalidApiCall = sendInvalidApiCall;
