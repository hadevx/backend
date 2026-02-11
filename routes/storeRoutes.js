const express = require("express");
const router = express.Router();
const { protectUser, protectAdmin, requireAdminRole } = require("../middleware/authMiddleware");

const { updateStoreStatus, getStoreStatus } = require("../controllers/storeController");

/* /api/update-store-status */
router.put("/", protectAdmin, requireAdminRole, updateStoreStatus);
router.get("/", getStoreStatus);

module.exports = router;
