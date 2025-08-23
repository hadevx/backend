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

const generateToken = (res, user, subdomain) => {
  const role = user.isAdmin ? "admin" : "user";
  const token = jwt.sign({ userId: user._id, role }, process.env.JWT_SECRET, { expiresIn: "1d" });

  // Set cookie domain based on subdomain
  let domain = undefined; // default is current domain
  if (process.env.NODE_ENV === "production") {
    if (subdomain === "storefront") domain = "storefront.webschema.online";
    if (subdomain === "admin") domain = "admin.webschema.online";
  }

  res.cookie("jwt", token, {
    httpOnly: true, // The cookie cannot be accessed by JavaScript running in the browser
    secure: process.env.NODE_ENV === "production", // secure in production
    sameSite: "none",
    // sameSite: "lax",
    domain, // scoped to subdomain
    maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
  });
};

module.exports = generateToken;
