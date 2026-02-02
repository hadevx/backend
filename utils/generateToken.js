/* const jwt = require("jsonwebtoken");

const generateToken = (res, user) => {
  const role = user.isAdmin ? "admin" : "user";
  const token = jwt.sign({ userId: user._id, role }, process.env.JWT_SECRET, { expiresIn: "1d" });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 1 * 24 * 60 * 60 * 1000,
  };

  res.cookie("jwt", token, cookieOptions);
};

module.exports = generateToken;
 */
const jwt = require("jsonwebtoken");

const generateToken = (res, user, cookieName) => {
  const role = user.isAdmin ? "admin" : "user";

  const token = jwt.sign({ userId: user._id, role }, process.env.JWT_SECRET, { expiresIn: "1d" });

  res.cookie(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000,
    // IMPORTANT: don't set domain=".webschema.online"
  });

  return token;
};

module.exports = generateToken;
