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
  getHomeCategorySections,
} = require("../controllers/productController");

const { protectAdmin, requireAdminRole } = require("../middleware/authMiddleware");

/**
 * BASE PATH: /api/products
 * ======================
 * STATIC ROUTES FIRST
 * PARAM ROUTES (/:id and /:id/*) LAST
 */

/* =======================
   STATIC ROUTES
======================= */
router.get("/latest", getLatestProducts);
router.get("/home-sections", getHomeCategorySections);
router.get("/sale", getSaleProducts);
router.get("/featured", getFeaturedProducts);
router.get("/all", getAllProducts);
router.get("/category/:id", getProductsByCategory); // this is ok here (more specific than /:id)
router.get("/", getProducts);

/* =======================
   CREATE / ACTIONS
======================= */
router.post("/fetch-by-ids", fetchProductsByIds);
router.post("/", protectAdmin, requireAdminRole, createProduct);

/* =======================
   STOCK
======================= */
router.post("/update-stock", protectAdmin, requireAdminRole, updateStock);

/* =======================
   VARIANTS
======================= */
router.put("/variant/:id", protectAdmin, requireAdminRole, updateProductVariants);
router.delete("/variant/:id", protectAdmin, requireAdminRole, deleteProductVariant);

/* =======================
   PARAM ROUTES (LAST)
======================= */
router.get("/:id/related", getRelatedProducts); // ✅ moved down
router.get("/:id", getProductById);
router.put("/:id", protectAdmin, requireAdminRole, updateProduct);
router.delete("/:id", protectAdmin, requireAdminRole, deleteProduct);

module.exports = router;
