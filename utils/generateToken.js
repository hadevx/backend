const jwt = require("jsonwebtoken");

const generateToken = (res, userId, user) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

  const cookieName = user.isAdmin ? "admin_jwt" : "user_jwt";
  //set JWT as HTTP-Only cookie
  res.cookie(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

module.exports = generateToken;
