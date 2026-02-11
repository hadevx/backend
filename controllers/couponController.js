const asyncHandler = require("../middleware/asyncHandler");
const Coupon = require("../models/couponModel"); // adjust path if needed

// helpers
const normalizeCode = (code = "") => String(code).trim().toUpperCase();

const isExpired = (expiresAt) => {
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() < Date.now();
};

const isOutOfUses = (maxUses, usedCount) => {
  if (maxUses === null || maxUses === undefined) return false;
  return Number(usedCount || 0) >= Number(maxUses);
};

/**
 * @desc    Create coupon
 * @route   POST /api/coupons
 * @access  Admin
 */
const createCoupon = asyncHandler(async (req, res) => {
  const { code, discountBy, categories, expiresAt, maxUses, isActive } = req.body;

  const normalized = normalizeCode(code);

  if (!normalized) {
    res.status(400);
    throw new Error("Coupon code is required");
  }

  const disc = Number(discountBy);
  if (!Number.isFinite(disc) || disc <= 0 || disc > 1) {
    res.status(400);
    throw new Error("discountBy must be a number between 0 and 1 (e.g. 0.1 = 10%)");
  }

  if (!Array.isArray(categories) || categories.length === 0) {
    res.status(400);
    throw new Error("At least one category is required");
  }

  const existing = await Coupon.findOne({ code: normalized });
  if (existing) {
    res.status(409);
    throw new Error("Coupon code already exists");
  }

  const coupon = await Coupon.create({
    code: normalized,
    discountBy: disc,
    categories,
    expiresAt: expiresAt ? new Date(expiresAt) : null,
    maxUses: maxUses === "" || maxUses === null || maxUses === undefined ? null : Number(maxUses),
    isActive: typeof isActive === "boolean" ? isActive : true,
  });

  res.status(201).json(coupon);
});

/**
 * @desc    Get all coupons
 * @route   GET /api/coupons
 * @access  Admin
 */
const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({}).sort({ createdAt: -1 }).populate("categories", "name");

  res.json(coupons);
});

/**
 * @desc    Delete coupon
 * @route   DELETE /api/coupons/:id
 * @access  Admin
 */
const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    res.status(404);
    throw new Error("Coupon not found");
  }

  await coupon.deleteOne();
  res.json({ message: "Coupon deleted" });
});

/**
 * @desc    Toggle coupon active status
 * @route   PUT /api/coupons/:id/toggle
 * @access  Admin
 */
const toggleCouponActive = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    res.status(404);
    throw new Error("Coupon not found");
  }

  coupon.isActive = !coupon.isActive;
  const updated = await coupon.save();
  res.json(updated);
});

/**
 * @desc    Update coupon fields
 * @route   PUT /api/coupons/:id
 * @access  Admin
 */
const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    res.status(404);
    throw new Error("Coupon not found");
  }

  const { code, discountBy, categories, expiresAt, maxUses, isActive } = req.body;

  // code update (handle unique)
  if (typeof code === "string") {
    const normalized = normalizeCode(code);
    if (!normalized) {
      res.status(400);
      throw new Error("Coupon code cannot be empty");
    }

    if (normalized !== coupon.code) {
      const exists = await Coupon.findOne({ code: normalized });
      if (exists) {
        res.status(409);
        throw new Error("Coupon code already exists");
      }
      coupon.code = normalized;
    }
  }

  // discount update
  if (discountBy !== undefined) {
    const disc = Number(discountBy);
    if (!Number.isFinite(disc) || disc <= 0 || disc > 1) {
      res.status(400);
      throw new Error("discountBy must be a number between 0 and 1");
    }
    coupon.discountBy = disc;
  }

  // categories update
  if (categories !== undefined) {
    if (!Array.isArray(categories) || categories.length === 0) {
      res.status(400);
      throw new Error("At least one category is required");
    }
    coupon.categories = categories;
  }

  // expires update
  if (expiresAt !== undefined) {
    coupon.expiresAt = expiresAt ? new Date(expiresAt) : null;
  }

  // maxUses update
  if (maxUses !== undefined) {
    if (maxUses === "" || maxUses === null) coupon.maxUses = null;
    else {
      const n = Number(maxUses);
      if (!Number.isFinite(n) || n < 0) {
        res.status(400);
        throw new Error("maxUses must be a number >= 0 or null");
      }
      coupon.maxUses = n;
    }
  }

  if (typeof isActive === "boolean") {
    coupon.isActive = isActive;
  }

  const updated = await coupon.save();
  res.json(updated);
});

/**
 * @desc    Validate coupon for checkout
 * @route   POST /api/coupons/validate
 * @access  Public (or Auth) - your choice
 *
 * body: { code: "SAVE10", categoryIds?: string[] }  // categoryIds optional
 *
 * If categoryIds is provided, we can check that coupon applies to at least one of them.
 */
const validateCoupon = asyncHandler(async (req, res) => {
  const { code, categoryIds } = req.body;

  const normalized = normalizeCode(code);
  if (!normalized) {
    res.status(400);
    throw new Error("Coupon code is required");
  }

  const coupon = await Coupon.findOne({ code: normalized });

  if (!coupon) {
    res.status(404);
    throw new Error("Invalid coupon");
  }

  if (!coupon.isActive) {
    res.status(400);
    throw new Error("Coupon is disabled");
  }

  if (isExpired(coupon.expiresAt)) {
    res.status(400);
    throw new Error("Coupon is expired");
  }

  if (isOutOfUses(coupon.maxUses, coupon.usedCount)) {
    res.status(400);
    throw new Error("Coupon usage limit reached");
  }

  // optional: check category overlap
  if (Array.isArray(categoryIds) && categoryIds.length > 0) {
    const applies = coupon.categories.some((c) => categoryIds.includes(String(c)));
    if (!applies) {
      res.status(400);
      throw new Error("Coupon does not apply to selected items");
    }
  }

  res.json({
    valid: true,
    code: coupon.code,
    discountBy: coupon.discountBy,
    categories: coupon.categories,
    expiresAt: coupon.expiresAt,
    maxUses: coupon.maxUses,
    usedCount: coupon.usedCount,
  });
});

module.exports = {
  createCoupon,
  getCoupons,
  deleteCoupon,
  toggleCouponActive,
  updateCoupon,
  validateCoupon,
};
