const express = require("express");
const router = express.Router();
const {
  createDiscount,
  updateDiscounts,
  getDiscountStatus,
  deleteDiscount,
} = require("../controllers/discountsController");
const { protectUser, protectAdmin, requireAdminRole } = require("../middleware/authMiddleware");

router.post("/", protectAdmin, requireAdminRole, createDiscount);
router.put("/", protectAdmin, requireAdminRole, updateDiscounts);
router.get("/", getDiscountStatus);
router.delete("/:id", protectAdmin, requireAdminRole, deleteDiscount);

module.exports = router;
