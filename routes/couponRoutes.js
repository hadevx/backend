// routes/couponRoutes.js
const express = require("express");
const router = express.Router();

const {
  createCoupon,
  getCoupons,
  deleteCoupon,
  toggleCouponActive,
  updateCoupon,
  validateCoupon,
} = require("../controllers/couponController");

// If you already have these middlewares in your project, import them:
const { protectUser, protectAdmin, requireAdminRole } = require("../middleware/authMiddleware");

/**
 * Admin routes
 */
router
  .route("/")
  .get(protectAdmin, requireAdminRole, getCoupons)
  .post(protectUser, protectAdmin, createCoupon);

router
  .route("/:id")
  .put(protectAdmin, requireAdminRole, updateCoupon)
  .delete(protectAdmin, requireAdminRole, deleteCoupon);

router.put("/:id/toggle", protectAdmin, requireAdminRole, toggleCouponActive);

/**
 * Validate coupon (checkout)
 * You can make this public, or protect it.
 */
router.post("/validate", validateCoupon);

module.exports = router;
