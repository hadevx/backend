const asyncHandler = require("../middleware/asyncHandler");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const { sendOrderEmail } = require("../utils/emailService");

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    isPaid,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error("No order items");
  }
  const order = new Order({
    orderItems: orderItems.map((x) => ({
      ...x,
      product: x._id,
      _id: undefined,
    })),
    user: req.user._id,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    isPaid,
  });
  const createdOrder = await order.save();

  // Send email to admin after the order is created
  await sendOrderEmail(createdOrder);

  res.status(201).json(createdOrder);
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  if (orders) {
    res.status(200).json(orders);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

// @desc    Get order by id
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "name email phone");

  if (order) {
    res.status(200).json(order);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

// @desc    Update order to paid
// @route   GET /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.payer.email_address,
    };
    const updateOrder = await order.save();
    res.status(200).json(updateOrder);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

// @desc    Update order to deliverd
// @route   PUT /api/orders/:id/deliver
// @access  Private/admin
const updateOrderToDeliverd = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();

    const updateOrder = await order.save();

    res.status(200).json(updateOrder);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

const updateOrderToCanceled = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isCanceled = true;

    const updatedOrder = await order.save();

    res.status(200).json(updatedOrder);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

const checkStock = asyncHandler(async (req, res) => {
  const { orderItems } = req.body; // [{ _id, qty, name, ... }]

  if (!orderItems || !Array.isArray(orderItems)) {
    res.status(400);
    throw new Error("Invalid order items");
  }

  const outOfStockItems = [];

  for (const item of orderItems) {
    const product = await Product.findById(item._id);
    if (!product) {
      outOfStockItems.push({
        productId: item._id,
        name: item.name || "Unknown",
        reason: "Product not found",
      });
    } else if (item.qty > product.countInStock) {
      outOfStockItems.push({
        productId: item._id,
        name: product.name,
        reason: `Only ${product.countInStock} left in stock`,
      });
    }
  }

  if (outOfStockItems.length) {
    return res.status(200).json({ success: false, outOfStockItems });
  }

  return res.status(200).json({ success: true });
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/admin
/* const getOrders = asyncHandler(async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 }).populate("user", "name email"); // populate user, selecting only name and email
    res.status(200).json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
}); */
const getOrders = asyncHandler(async (req, res) => {
  const pageSize = 5; // how many orders per page
  const page = Number(req.query.pageNumber) || 1;

  try {
    // Count total orders
    const count = await Order.countDocuments();

    // Fetch paginated orders, newest first
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .skip(pageSize * (page - 1))
      .limit(pageSize)
      .populate("user", "name email");

    res.status(200).json({
      orders,
      page,
      pages: Math.ceil(count / pageSize), // total pages
      total: count, // total orders
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

const getUserOrders = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    // Fetch orders for the user by their ID
    const userOrders = await Order.find({ user: id });

    if (!userOrders) {
      // Handle case where no orders are found
      return res.status(404).json({ message: "No orders found for this user." });
    }

    // Respond with the list of orders
    res.status(200).json(userOrders);
  } catch (error) {
    // Handle unexpected errors
    res.status(500).json({ message: error.message });
  }
});
module.exports = {
  addOrderItems,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDeliverd,
  getOrders,
  getUserOrders,
  updateOrderToCanceled,
  checkStock,
};
