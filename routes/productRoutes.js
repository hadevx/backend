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
const { protectUser, protectAdmin } = require("../middleware/authMiddleware");

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
router.post("/", protectUser, protectAdmin, createProduct);
router
  .route("/:id")
  .get(getProductById)
  .put(protectUser, protectAdmin, updateProduct)
  .delete(protectUser, protectAdmin, deleteProduct);

router.post("/delete-image", async (req, res) => {
  try {
    const { publicId } = req.body;
    if (!publicId) return res.status(400).json({ message: "Public ID required" });

    await cloudinary.uploader.destroy(publicId);
    res.json({ message: "Old image deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete image", error: err.message });
  }
});

module.exports = router;
