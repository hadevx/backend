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
} = require("../controllers/productController");
const { protect, admin } = require("../middleware/authMiddleware");

// /api/products
router.route("/").get(getProducts).post(protect, admin, createProduct);
router.get("/top", getTopRatedProducts);
router
  .route("/:id")
  .get(getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

router.route("/:id/reviews").post(protect, createProductReview);

module.exports = router;
