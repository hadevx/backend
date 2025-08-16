const jwt = require("jsonwebtoken");
const asyncHandler = require("./asyncHandler");
const User = require("../models/userModel");

// Protect user routes
const protectUser = asyncHandler(async (req, res, next) => {
  const token = req.cookies.user_jwt;
  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId).select("-password");
    next();
  } catch (error) {
    console.error("User JWT verification failed:", error.message);
    res.status(401);
    throw new Error("Not authorized, token failed");
  }
});

// Protect admin routes
const protectAdmin = asyncHandler(async (req, res, next) => {
  const token = req.cookies.admin_jwt;
  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");
    if (!user || !user.isAdmin) {
      res.status(403);
      throw new Error("Admin access only");
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("Admin JWT verification failed:", error.message);
    res.status(401);
    throw new Error("Not authorized, token failed");
  }
});

module.exports = { protectUser, protectAdmin };
