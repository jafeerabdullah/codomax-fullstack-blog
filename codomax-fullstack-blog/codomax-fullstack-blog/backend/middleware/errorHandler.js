"use strict";

function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error.type === "entity.parse.failed") return res.status(400).json({ message: "Request body contains invalid JSON." });
  if (error.type === "entity.too.large") return res.status(413).json({ message: "Request body is too large." });
  const status = error.status || 500;
  if (status >= 500) console.error("API error:", error.message);
  res.status(status).json({ message: status >= 500 ? "The server could not complete the request. Please try again." : error.message, ...(error.errors ? { errors: error.errors } : {}) });
}

module.exports = errorHandler;
