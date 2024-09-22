const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const {
  authUser,
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
} = require("../controllers/userController");

// /api/users
router.route("/address/:userId").get(protect, getAddress);
router.route("/address").post(protect, createAddress).put(protect, updateAddress);
router.route("/").post(registerUser).get(protect, admin, getUsers);
router.post("/logout", logoutUser);
router.post("/auth", authUser);
router.route("/profile").get(protect, getUserProfile).put(protect, updateUserProfile);
router.put("/:id", protect, admin, updateUser);
router.route("/:id").delete(protect, admin, deleteUser).get(protect, admin, getUserById);

module.exports = router;
