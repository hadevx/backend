const express = require("express");
const router = express.Router();
const { protectUser, protectAdmin } = require("../middleware/authMiddleware");
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
router.get("/address/:userId", protectUser, getAddress);
router.post("/address", protectUser, createAddress);
router.put("/address", protectUser, updateAddress);
router.get("/profile", protectUser, getUserProfile);
router.put("/profile", protectUser, updateUserProfile);
router.post("/logout", logoutUser);

// Admin routes
router.get("/", protectAdmin, getUsers);
router.put("/:id", protectAdmin, updateUser);
router.delete("/:id", protectAdmin, deleteUser);
router.get("/:id", protectAdmin, getUserById);
router.post("/admin", loginAdmin);

router.post("/forget-password", forgetPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;
