const rateLimit = require("express-rate-limit");
const logger = require("../utils/logger");

// Create rate limiter
const rateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 10 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

module.exports = rateLimitMiddleware;
module.exports.rateLimitMiddleware = rateLimitMiddleware;
