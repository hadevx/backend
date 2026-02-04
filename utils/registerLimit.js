const rateLimit = require("express-rate-limit");

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 registration requests per window
  message: "Too many registration attempts. Please try again later.",
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 tries
  message: { message: "Too many login attempts, please try again later." },
});

module.exports = { registerLimiter, loginLimiter };
