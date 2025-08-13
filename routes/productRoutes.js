const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  updateStock,
  createShippingPrice,
  getDeliveryStatus,
  updateDiscounts,
  getDiscountStatus,
  getLatestProducts,
  createCategory,
  getCategories,
  deleteCategory,
  createDiscount,
  deleteDiscount,
} = require("../controllers/productController");
const { protect, admin } = require("../middleware/authMiddleware");

// /api/products
router.get("/product/:id", getProductById);
router.post("/create-category", createCategory);
router.delete("/category", deleteCategory);
router.get("/category", getCategories);
router.get("/latest", getLatestProducts);
router.put("/delivery", createShippingPrice);

router.post("/discount", createDiscount);
router.put("/discount", updateDiscounts);
router.get("/discount", getDiscountStatus);
router.delete("/discount", deleteDiscount);

router.get("/delivery", getDeliveryStatus);
router.post("/update-stock", updateStock);
router.get("/category/:category", getProductsByCategory);
router.get("/", getProducts);
router.post("/", protect, admin, createProduct);
router
  .route("/:id")
  .get(getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

module.exports = router;
