const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const registerLimiter = require("../utils/registerLimit");
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
} = require("../controllers/userController");

/* http://localhost:4001/api/users */

// Client routes
router.post("/login", loginUser);
router.post("/register", registerLimiter, registerUser);
router.get("/address/:userId", protect, getAddress);
router.post("/address", protect, createAddress);
router.put("/address", protect, updateAddress);
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);
router.post("/logout", logoutUser);

// Admin routes
router.get("/", protect, admin, getUsers);
router.put("/:id", protect, admin, updateUser);
router.delete("/:id", protect, admin, deleteUser);
router.get("/:id", protect, admin, getUserById);
router.post("/admin", loginAdmin);

router.post("/forget-password", forgetPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
