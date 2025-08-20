const express = require("express");
const router = express.Router();
const { protectUser, protectAdmin } = require("../middleware/authMiddleware");

const { updateStoreStatus, getStoreStatus } = require("../controllers/storeController");

router.put("/", protectUser, protectAdmin, updateStoreStatus);
router.get("/", getStoreStatus);

module.exports = router;
