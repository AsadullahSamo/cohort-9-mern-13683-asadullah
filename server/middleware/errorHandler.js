const logger = require("../logger")

function errorHandler(err, req, res, next) {
	logger.error({ err, path: req.path, method: req.method }, "Unhandled Error")

	const status = err.status || 500
	res.status(status).json({ 
		error: process.env.NODE_ENV	=== "production" ? "Something went wrong." : err.message
	})
}

module.exports = errorHandler