const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getTopRatedProducts,
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
} = require("../controllers/productController");
const { protect, admin } = require("../middleware/authMiddleware");

// /api/products
router.get("/product/:id", getProductById);
router.post("/create-category", createCategory);
router.delete("/category", deleteCategory);
router.get("/category", getCategories);
router.get("/latest", getLatestProducts);
router.put("/delivery", createShippingPrice);
router.put("/discount", updateDiscounts);
router.get("/discount", getDiscountStatus);
router.get("/delivery", getDeliveryStatus);
router.post("/update-stock", updateStock);
router.get("/category/:category", getProductsByCategory);
router.route("/").get(getProducts).post(protect, admin, createProduct);
router.get("/top", getTopRatedProducts);
router
  .route("/:id")
  .get(getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

router.route("/:id/reviews").post(protect, createProductReview);

module.exports = router;
