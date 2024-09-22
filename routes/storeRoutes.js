const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");

const { updateStoreStatus, getStoreStatus } = require("../controllers/storeController");

router.put("/", updateStoreStatus);
router.get("/", getStoreStatus);

module.exports = router;
