const rateLimit = require("express-rate-limit");

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 registration requests per window
  message: "Too many registration attempts. Please try again later.",
});
module.exports = registerLimiter;
