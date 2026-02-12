const express = require("express");
const router = express.Router();
const { protectUser, protectAdmin, requireAdminRole } = require("../middleware/authMiddleware");
const {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDeliverd,
  getOrders,
  getUserOrders,
  updateOrderToCanceled,
  checkStock,
  getOrderStats,
  getRevenueStats,
} = require("../controllers/orderControllers");

// http:localhost:4001/api/orders
router.get("/user-orders/:id", getUserOrders);
router.post("/check-stock", checkStock);
router.get("/stats", protectAdmin, requireAdminRole, getOrderStats);
router.get("/revenu", protectAdmin, requireAdminRole, getRevenueStats);
router.post("/", protectUser, createOrder);
router.get("/", protectAdmin, requireAdminRole, getOrders);

router.get("/mine", protectUser, getMyOrders);
router.get("/:id", protectUser, getOrderById);
router.get("/admin/:id", protectAdmin, requireAdminRole, getOrderById);
router.route("/:id/pay").put(protectUser, updateOrderToPaid);
router.route("/:id/deliver").put(protectAdmin, requireAdminRole, updateOrderToDeliverd);
router.route("/:id/cancel").put(protectAdmin, requireAdminRole, updateOrderToCanceled);

module.exports = router;
