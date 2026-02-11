const express = require("express");
const router = express.Router();
const { protectUser, protectAdmin, requireAdminRole } = require("../middleware/authMiddleware");
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
  toggleBlockUser,
  toggleVIPUser,
  logoutAdmin,
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
router.get("/", protectAdmin, requireAdminRole, getUsers);
router.put("/:id", protectAdmin, requireAdminRole, updateUser);
router.delete("/:id", protectAdmin, requireAdminRole, deleteUser);
router.get("/:id", protectAdmin, requireAdminRole, getUserById);
router.put("/:id/block", protectAdmin, requireAdminRole, toggleBlockUser);
router.put("/:id/vip", protectAdmin, requireAdminRole, toggleVIPUser);

router.post("/admin/logout", logoutAdmin);

router.post("/forget-password", forgetPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;
