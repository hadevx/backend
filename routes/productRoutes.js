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
  getAllProducts,
  fetchProductsByIds,
  featuredProducts,
  updateProductVariants,
  deleteProductVariant,
} = require("../controllers/productController");
const { protectUser, protectAdmin } = require("../middleware/authMiddleware");

// /api/products

/* PRODUCTS */
router.get("/latest", getLatestProducts);
router.get("/featured", featuredProducts);
router.put("/delivery", protectUser, protectAdmin, createShippingPrice);
router.get("/", getProducts);
router.get("/all", getAllProducts);
router.post("/", protectUser, protectAdmin, createProduct);
router.post("/fetch-by-ids", fetchProductsByIds);
/* CATEGORY */
router.post("/create-category", protectUser, protectAdmin, createCategory);
router.delete("/category", protectUser, protectAdmin, deleteCategory);
router.get("/category", getCategories);

/* DISCOUNTS */
router.post("/discount", protectUser, protectAdmin, createDiscount);
router.put("/discount", protectUser, protectAdmin, updateDiscounts);
router.get("/discount", getDiscountStatus);
router.delete("/discount/:id", protectUser, protectAdmin, deleteDiscount);

router.get("/delivery", getDeliveryStatus);
router.post("/update-stock", updateStock);
router.get("/category/:id", getProductsByCategory);

/* router.post("/delete-image", async (req, res) => {
  try {
    const { publicId } = req.body;
    if (!publicId) return res.status(400).json({ message: "Public ID required" });

    await cloudinary.uploader.destroy(publicId);
    res.json({ message: "Old image deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete image", error: err.message });
  }
}); */
router.get("/:id", getProductById);
router.put("/:id", protectUser, protectAdmin, updateProduct);
router.put("/variant/:id", protectUser, protectAdmin, updateProductVariants);
router.delete("/variant/:id", protectUser, protectAdmin, deleteProductVariant);
router.delete("/:id", protectUser, protectAdmin, deleteProduct);
router.get("/product/:id", getProductById);

module.exports = router;
