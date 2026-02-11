/* const jwt = require("jsonwebtoken");

const generateToken = (res, user) => {
  const role = user.isAdmin ? "admin" : "user";
  const token = jwt.sign({ userId: user._id, role }, process.env.JWT_SECRET, { expiresIn: "5d" });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 5 * 24 * 60 * 60 * 1000,
    domain: user.isAdmin ? "admin.webschema.online" : "storefront.webschema.online",
  };

  res.cookie("jwt", token, cookieOptions);
};

module.exports = generateToken;
 */
// utils/generateToken.js
const jwt = require("jsonwebtoken");

const generateToken = (res, user, cookieName) => {
  const token = jwt.sign(
    { userId: user._id, role: user.isAdmin ? "admin" : "user" },
    process.env.JWT_SECRET,
    { expiresIn: "2d" },
  );

  res.cookie(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 2 * 24 * 60 * 60 * 1000,
  });
};

module.exports = generateToken;
