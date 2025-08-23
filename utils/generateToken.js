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

  let domain = undefined;

  if (subdomain === "storefront") {
    domain = "storefront.webschema.online";
  }
  if (subdomain === "admin") {
    domain = "admin.webschema.online";
  }

  console.log("Setting cookie with domain:", domain); // Debug log
  console.log("Subdomain:", subdomain); // Debug log
  console.log("NODE_ENV:", process.env.NODE_ENV); // Debug log

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    domain,
    maxAge: 1 * 24 * 60 * 60 * 1000,
  };

  console.log("Cookie options:", cookieOptions); // Debug log

  res.cookie("jwt", token, cookieOptions);

  // Verify cookie was set
  console.log("Response headers after setting cookie:", res.getHeaders());
};

module.exports = generateToken;
