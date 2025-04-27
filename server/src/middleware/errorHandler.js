const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error('Error details:', {
    message: err.message,
    stack: err.stack,
    status: err.status || 500,
    path: req.path,
    method: req.method
  });

  // Handle mongoose validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: 'Validation Error',
      details: Object.values(err.errors).map(error => ({
        field: error.path,
        message: error.message
      }))
    });
  }

  // Handle mongoose cast errors (invalid IDs)
  if (err.name === 'CastError') {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid ID format',
      details: err.message
    });
  }

  // Handle duplicate key errors
  if (err.code === 11000) {
    return res.status(409).json({
      status: 'error',
      message: 'Duplicate Entry',
      details: `${Object.keys(err.keyValue)} already exists`
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler; 