const express = require("express");
const router = express.Router();
const { protectUser, protectAdmin } = require("../middleware/authMiddleware");
const { registerLimiter, loginLimiter } = require("../utils/registerLimit");
const {
  loginUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
  createAddress,
  getAddress,
  updateAddress,
  loginAdmin,
  forgetPassword,
  resetPassword,
  getGovernorates,
} = require("../controllers/userController");
const {
  registerValidation,
  loginValidation,
  addressValidation,
} = require("../middleware/validateMiddleware");
/* /api/users */

// Client routes
router.post("/login", loginValidation, loginUser);
router.post("/register", registerLimiter, registerValidation, registerUser);
router.get("/address/:userId", protectUser, getAddress);
router.post("/address", protectUser, addressValidation, createAddress);
router.put("/address", protectUser, updateAddress);
router.get("/profile", protectUser, getUserProfile);
router.put("/profile", protectUser, updateUserProfile);
router.post("/logout", logoutUser);

// Admin routes
router.post("/admin", loginLimiter, loginValidation, loginAdmin);
router.get("/governorates", getGovernorates);
// router.get("/", protectUser, protectAdmin, getUsers);
router.get("/", protectAdmin, getUsers);
router.put("/:id", protectUser, updateUser);
// router.delete("/:id", protectUser, protectAdmin, deleteUser);
router.delete("/:id", protectAdmin, deleteUser);
// router.get("/:id", protectUser, protectAdmin, getUserById);
router.get("/:id", protectAdmin, getUserById);

router.post("/admin/logout", logoutUser);

router.post("/forget-password", forgetPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;
