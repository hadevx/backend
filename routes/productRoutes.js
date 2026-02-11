const express = require("express");
const router = express.Router();

const {
  getProducts,
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getLatestProducts,
  getFeaturedProducts,
  updateStock,
  fetchProductsByIds,
  getSaleProducts,
  updateProductVariants,
  deleteProductVariant,
  getRelatedProducts,
} = require("../controllers/productController");

const { protectAdmin, requireAdminRole } = require("../middleware/authMiddleware");

/**
 * BASE PATH: /api/products
 * ======================
 * STATIC ROUTES FIRST
 * PARAM ROUTES (/:id) LAST
 */

/* =======================
   PRODUCTS (STATIC)
======================= */
router.get("/latest", getLatestProducts);
router.get("/:id/related", getRelatedProducts);
router.get("/sale", getSaleProducts);
router.get("/featured", getFeaturedProducts);
router.get("/all", getAllProducts);
router.get("/", getProducts);

/* =======================
   PRODUCTS (CREATE)
======================= */
router.post("/", protectAdmin, requireAdminRole, createProduct);
router.post("/fetch-by-ids", fetchProductsByIds);

/* =======================
   PRODUCT STOCK
======================= */
router.post("/update-stock", protectAdmin, requireAdminRole, updateStock);

/* =======================
   PRODUCT VARIANTS
======================= */
router.put("/variant/:id", protectAdmin, requireAdminRole, updateProductVariants);
router.delete("/variant/:id", protectAdmin, requireAdminRole, deleteProductVariant);

/* =======================
   PRODUCTS BY CATEGORY
======================= */
router.get("/category/:id", getProductsByCategory);

/* =======================
   SINGLE PRODUCT (LAST)
======================= */
router.get("/:id", getProductById);
router.put("/:id", protectAdmin, requireAdminRole, updateProduct);
router.delete("/:id", protectAdmin, requireAdminRole, deleteProduct);

module.exports = router;
