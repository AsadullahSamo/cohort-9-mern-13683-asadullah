const logger = require("../logger")

function errorHandler(err, req, res, next) {
  logger.error({ err, path: req.path, method: req.method }, "Unhandled Error");

  const status = err.status || 500;
  const message = process.env.NODE_ENV === "development" ? err.message : "Something went wrong.";
  res.status(status).json({ error: message });
}

module.exports = errorHandler;