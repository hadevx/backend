const express = require("express");
const router = express.Router();
const { protectAdmin } = require("../middleware/authMiddleware");

const { updateStoreStatus, getStoreStatus } = require("../controllers/storeController");

router.put("/", protectAdmin, updateStoreStatus);
router.get("/", getStoreStatus);

module.exports = router;
