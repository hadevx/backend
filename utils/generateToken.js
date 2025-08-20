/* const jwt = require("jsonwebtoken");

const generateToken = (res, userId, user) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1d" });

  const cookieName = user.isAdmin ? "admin_jwt" : "user_jwt";

  //set JWT as HTTP-Only cookie
  res.cookie(cookieName, token, {
    httpOnly: true, //The cookie cannot be accessed by JavaScript running in the browser
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict",
    maxAge: 1 * 24 * 60 * 60 * 1000,
  });
};

module.exports = generateToken;
 */
const jwt = require("jsonwebtoken");

const generateToken = (res, user) => {
  // Add role info into payload
  const token = jwt.sign(
    { userId: user._id, role: user.isAdmin ? "admin" : "user" },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  // Always one cookie name
  res.cookie("jwt", token, {
    httpOnly: true, // The cookie cannot be accessed by JavaScript running in the browser
    secure: process.env.NODE_ENV !== "development", // secure in production
    // sameSite: "strict",
    sameSite: "lax", //on localhost
    maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
  });
};

module.exports = generateToken;
