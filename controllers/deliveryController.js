// controllers/deliveryController.js
const asyncHandler = require("../middleware/asyncHandler");
const Delivery = require("../models/deliveryModel");

/**
 * @desc    Get delivery settings (single doc)
 * @route   GET /api/delivery
 * @access  Public (or Private/Admin if you want)
 */
const getDeliveryStatus = asyncHandler(async (req, res) => {
  const delivery = await Delivery.findOne({});
  // keep old behavior (array) if your frontend expects array:
  // return res.json(delivery ? [delivery] : []);
  res.json(delivery ? [delivery] : []);
});

/**
 * @desc    Create/Update delivery settings (upsert single doc)
 * @route   PUT /api/delivery
 * @access  Private/Admin
 *
 * Notes:
 * - freeDeliveryThreshold: number (0 disables)
 * - zoneFees: array of { zone, fee } (empty disables)
 */
const updateDeliverySettings = asyncHandler(async (req, res) => {
  const { timeToDeliver, shippingFee, minDeliveryCost, freeDeliveryThreshold, zoneFees } = req.body;

  let delivery = await Delivery.findOne({});
  if (!delivery) delivery = new Delivery({});

  // ✅ Safe assignments (allow 0)
  if (typeof timeToDeliver === "string") delivery.timeToDeliver = timeToDeliver;

  // accept numeric or numeric string
  if (shippingFee !== undefined && shippingFee !== null && shippingFee !== "") {
    const n = Number(shippingFee);
    if (!Number.isNaN(n)) delivery.shippingFee = n;
  }

  if (minDeliveryCost !== undefined && minDeliveryCost !== null && minDeliveryCost !== "") {
    const n = Number(minDeliveryCost);
    if (!Number.isNaN(n)) delivery.minDeliveryCost = n;
  }

  // ✅ Free threshold (0 disables)
  if (
    freeDeliveryThreshold !== undefined &&
    freeDeliveryThreshold !== null &&
    freeDeliveryThreshold !== ""
  ) {
    const n = Number(freeDeliveryThreshold);
    if (!Number.isNaN(n) && n >= 0) delivery.freeDeliveryThreshold = n;
  }

  // ✅ Zone fees (empty disables)
  if (Array.isArray(zoneFees)) {
    delivery.zoneFees = zoneFees
      .map((z) => ({
        zone: String(z?.zone || "").trim(),
        fee: Number(z?.fee),
      }))
      .filter((z) => z.zone && Number.isFinite(z.fee) && z.fee >= 0);
  }

  const updated = await delivery.save();
  // keep old behavior (array) if frontend expects array:
  res.json(updated);
});

/**
 * @desc    Clear/disable advanced delivery options
 * @route   PATCH /api/delivery/disable-advanced
 * @access  Private/Admin
 */
const disableAdvancedDelivery = asyncHandler(async (req, res) => {
  const delivery = await Delivery.findOne({});
  if (!delivery) return res.status(404).json({ message: "Delivery settings not found" });

  delivery.freeDeliveryThreshold = 0;
  delivery.zoneFees = [];
  const updated = await delivery.save();
  res.json(updated);
});

module.exports = {
  getDeliveryStatus,
  updateDeliverySettings,
  disableAdvancedDelivery,
};
