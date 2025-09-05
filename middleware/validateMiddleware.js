const { body } = require("express-validator");

const registerValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 3, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  body("email").trim().isEmail().withMessage("Invalid email").normalizeEmail(),

  body("password")
    .trim()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  body("confirmPassword")
    .trim()
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Passwords do not match"),

  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .isNumeric()
    .withMessage("Phone must contain only numbers")
    .isLength({ min: 8, max: 8 })
    .withMessage("Phone number must be exactly 8 digits"),
];

const loginValidation = [
  body("email").trim().isEmail().withMessage("Invalid email").normalizeEmail(),
  body("password").trim().notEmpty().withMessage("Password is required"),
];

module.exports = { registerValidation, loginValidation };
