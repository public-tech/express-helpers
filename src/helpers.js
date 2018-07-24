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
