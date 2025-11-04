/**
 * Global error handling middleware
 */
function errorHandler(err, req, res, next) {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  
  // Default error response
  const statusCode = err.statusCode || 500;
  const response = {
    ok: false,
    error: err.message || 'Internal server error'
  };
  
  // Add additional error details in development
  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
  }
  
  res.status(statusCode).json(response);
}

/**
 * Async route handler wrapper to catch errors
 * @param {Function} fn - Async route handler function
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Request timeout middleware
 * @param {number} timeout - Timeout in milliseconds (default: 30s)
 */
function requestTimeout(timeout = 30000) {
  return (req, res, next) => {
    req.setTimeout(timeout, () => {
      const err = new Error('Request timeout');
      err.statusCode = 408;
      next(err);
    });
    next();
  };
}

/**
 * Simple in-memory rate limiter
 * @param {Object} options - Rate limit options
 */
function rateLimit({ windowMs = 60000, max = 100 } = {}) {
  const requests = new Map();
  
  // Clean up old entries periodically
  setInterval(() => {
    const now = Date.now();
    for (const [key, data] of requests.entries()) {
      if (now - data.resetTime > windowMs) {
        requests.delete(key);
      }
    }
  }, windowMs);
  
  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const requestData = requests.get(key);
    
    if (!requestData || now > requestData.resetTime) {
      requests.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }
    
    if (requestData.count >= max) {
      return res.status(429).json({
        ok: false,
        error: 'Too many requests, please try again later'
      });
    }
    
    requestData.count++;
    next();
  };
}

module.exports = {
  errorHandler,
  asyncHandler,
  requestTimeout,
  rateLimit
};
