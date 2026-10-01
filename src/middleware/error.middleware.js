const ApiResponse = require('../utils/apiResponse');

const notFound = (req, res, next) => {
  return ApiResponse.error(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
};

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return ApiResponse.error(res, 'Validation failed', 422, errors);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    return ApiResponse.error(res, `${field} already exists`, 409);
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return ApiResponse.error(res, `Invalid ${err.path}: ${err.value}`, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return ApiResponse.error(res, 'Invalid token', 401);
  }
  if (err.name === 'TokenExpiredError') {
    return ApiResponse.error(res, 'Token expired', 401);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  return ApiResponse.error(res, message, statusCode);
};

module.exports = { notFound, errorHandler };
