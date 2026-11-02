import { env } from "#src/config/env.js";
import logger from "#src/utils/logger.js";
import { HTTP } from "#src/utils/httpStatus.js";

// 404 — must be registered AFTER all routes.
export function notFound(_req, _res, next) {
  const err = new Error("Route not found");
  err.statusCode = HTTP.NOT_FOUND;
  next(err);
}

// Central error handler — every ApiError, Joi, Mongoose or unknown error
// ends up here as one clean JSON shape. Must be the LAST middleware.
export function errorHandler(err, _req, res, _next) {
  let status = err.statusCode ?? HTTP.SERVER_ERROR;
  let message = err.message ?? "Something went wrong";
  let errors = err.errors ?? null;

  // Mongoose: bad ObjectId etc.
  if (err.name === "CastError") {
    status = HTTP.BAD_REQUEST;
    message = `Invalid ${err.path}: ${err.value}`;
  }
  // Mongoose: duplicate key (e.g. email already taken at the DB level)
  if (err.code === 11000) {
    status = HTTP.CONFLICT;
    const field = Object.keys(err.keyValue ?? {})[0] ?? "field";
    message = `This ${field} is already in use`;
  }
  // Mongoose: schema validation
  if (err.name === "ValidationError") {
    status = HTTP.BAD_REQUEST;
    message = "Validation failed";
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }
  // JWT
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    status = HTTP.UNAUTHORIZED;
    message = "Invalid or expired token";
  }

  if (status === HTTP.SERVER_ERROR) {
    logger.error(err);
  }

  res.status(status).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
    // Stack traces only outside production — never leak internals live.
    ...(env.isProd ? {} : { stack: err.stack }),
  });
}
