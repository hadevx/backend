const express = require("express");
const router = express.Router();
const { protectUser, protectAdmin } = require("../middleware/authMiddleware");
const {
  addOrderItems,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDeliverd,
  getOrders,
  getUserOrders,
  updateOrderToCanceled,
} = require("../controllers/orderControllers");

// /api/orders
router.get("/user-orders/:id", getUserOrders);

router.route("/").post(protectUser, addOrderItems).get(protectUser, protectAdmin, getOrders);

router.route("/mine").get(protectUser, getMyOrders);
router.get("/:id", protectUser, getOrderById);
router.route("/:id/pay").put(protectUser, updateOrderToPaid);
router.route("/:id/deliver").put(protectUser, protectAdmin, updateOrderToDeliverd);
router.route("/:id/cancel").put(protectUser, protectAdmin, updateOrderToCanceled);

module.exports = router;
