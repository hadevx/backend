// routes/deliveryRoutes.js
const express = require("express");
const router = express.Router();

const {
  getDeliveryStatus,
  updateDeliverySettings,
  disableAdvancedDelivery,
} = require("../controllers/deliveryController");

// If you want admin protection, uncomment these (adjust path to your auth middleware)
const { protectUser, protectAdmin, requireAdminRole } = require("../middleware/authMiddleware");

router.get("/", getDeliveryStatus);

// PUT update settings (admin)
router.put("/", protectAdmin, requireAdminRole, updateDeliverySettings);

// optional helper endpoint
router.patch("/disable-advanced", protectAdmin, requireAdminRole, disableAdvancedDelivery);

module.exports = router;
