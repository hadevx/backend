const asyncHandler = require("../middleware/asyncHandler");
const Product = require("../models/productModel");
const Delivery = require("../models/deliveryModel");
const Discount = require("../models/discountModel");
const Category = require("../models/categoryModel");
const fs = require("fs");
const path = require("path");

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getAllProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({});
  res.json(products);
});

const getProducts = asyncHandler(async (req, res) => {
  const pageSize = 50;
  const page = Number(req.query.pageNumber) || 1;

  // Search filter
  const keyword = req.query.keyword ? { name: { $regex: req.query.keyword, $options: "i" } } : {};

  // Count total products matching search
  const count = await Product.countDocuments({ ...keyword });

  // Paginate + sort newest first
  const products = await Product.find({ ...keyword })
    .sort({ createdAt: -1 })
    .populate("category", "name")
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    products,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

// POST /api/products/fetch-by-ids
const fetchProductsByIds = asyncHandler(async (req, res) => {
  const { productIds } = req.body; // array of product _id
  if (!productIds || !Array.isArray(productIds)) {
    res.status(400);
    throw new Error("Invalid product IDs");
  }

  const products = await Product.find({ _id: { $in: productIds } });
  res.json(products);
});

const getLatestProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).sort({ createdAt: -1 }).limit(4);

  if (!products || products.length === 0) {
    res.status(404);
    throw new Error("No products found");
  }

  res.status(200).json(products);
});

const getProductById = asyncHandler(async (req, res) => {
  // 1. Fetch the product and populate category
  const product = await Product.findById(req.params.id).populate("category", "name parent");
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // 6. Return product + discount info
  res.status(200).json(product);
});

const createProduct = asyncHandler(async (req, res) => {
  const { name, price, image, category, countInStock, description, variants } = req.body;

  // ✅ Validation
  if (!name || !price || !image || !description || !countInStock) {
    res.status(400);
    throw new Error("Please fill all the required fields");
  }

  // ✅ Build product object
  const product = {
    user: req.user._id,
    name,
    price,
    image,
    category: category || "",
    countInStock,
    description,
    variants,
  };

  // ✅ Save to DB
  const createdProduct = await Product.create(product);
  res.status(201).json(createdProduct);
});

const updateProduct = asyncHandler(async (req, res) => {
  const {
    name,
    price,
    description,
    image,
    category,
    countInStock,
    featured,
    hasDiscount,
    discountBy,
  } = req.body;

  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Delete old images that are no longer in the new images array
  if (image && Array.isArray(image)) {
    const oldImages = product.image || [];

    for (const oldImg of oldImages) {
      const oldUrl = oldImg.url ? oldImg.url : oldImg;
      const existsInNew = image.some((img) => (img.url ? img.url : img) === oldUrl);

      if (!existsInNew && oldUrl.includes("/uploads/")) {
        const filename = oldUrl.split("/uploads/").pop();
        const filePath = path.join(__dirname, "..", "uploads", filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
    }

    product.image = image; // update product images
  }

  // Update other fields
  product.name = name ?? product.name;
  product.price = price ?? product.price;
  product.description = description ?? product.description;
  product.category = category ?? product.category;
  product.countInStock = countInStock ?? product.countInStock;
  product.featured = featured ?? product.featured;

  product.hasDiscount = hasDiscount ?? product.hasDiscount;
  product.discountBy = discountBy ?? product.discountBy;
  product.discountedPrice = hasDiscount
    ? product.price - product.price * discountBy
    : product.price;

  const updatedProduct = await product.save();
  res.status(200).json(updatedProduct);
});

// controllers/productController.js
const updateProductVariants = asyncHandler(async (req, res) => {
  const { id } = req.params; // productId
  const { variantId, color, sizes, images } = req.body;

  if (!variantId) {
    res.status(400);
    throw new Error("variantId is required");
  }

  const product = await Product.findById(id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const variantIndex = product.variants.findIndex((v) => v._id.toString() === variantId);
  if (variantIndex === -1) {
    res.status(404);
    throw new Error("Variant not found");
  }

  // Update fields
  if (color) product.variants[variantIndex].color = color;
  if (sizes && Array.isArray(sizes)) {
    product.variants[variantIndex].sizes = sizes.map((s) => ({
      size: s.size,
      stock: s.stock,
      price: s.price ?? 0,
    }));
  }
  if (images) product.variants[variantIndex].images = images;

  // Update total countInStock based on all variants
  product.countInStock = product.variants.reduce((total, v) => {
    return total + v.sizes.reduce((sum, s) => sum + (s.stock || 0), 0);
  }, 0);
  const updatedProduct = await product.save();
  res.status(200).json(updatedProduct.variants[variantIndex]);
});

// productController.js
const deleteProductVariant = asyncHandler(async (req, res) => {
  const { id } = req.params; // productId
  const { variantId } = req.body;

  if (!variantId) {
    res.status(400);
    throw new Error("variantId is required");
  }

  const product = await Product.findById(id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  product.variants = product.variants.filter((v) => v._id.toString() !== variantId);
  await product.save();

  res.status(200).json({ message: "Variant deleted successfully" });
});

const featuredProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find({ featured: true }).limit(6);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get products by category (including children)
const getProductsByCategory = asyncHandler(async (req, res) => {
  const { id } = req.params; // category id from URL

  // 1. Check if category exists
  const category = await Category.findById(id);
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  // 2. Recursive function to get all child category IDs
  const getAllCategoryIds = async (catId) => {
    const ids = [catId];
    const children = await Category.find({ parent: catId });
    for (const child of children) {
      ids.push(...(await getAllCategoryIds(child._id)));
    }
    return ids;
  };

  // 3. Collect all category IDs (parent + children)
  const categoryIds = await getAllCategoryIds(category._id);

  // 4. Find products belonging to any of those categories
  const products = await Product.find({ category: { $in: categoryIds } }).sort({ createdAt: -1 });

  console.log(products);
  res.status(200).json(products);
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    if (product.image && Array.isArray(product.image)) {
      for (const img of product.image) {
        // Delete local file if stored in /uploads/
        if (img.url && img.url.includes("/uploads/")) {
          const filename = img.url.split("/uploads/").pop();
          const filePath = path.join(__dirname, "..", "uploads", filename);
          fs.unlink(filePath, (err) => {
            if (err) console.error("Failed to delete local image:", err);
          });
        }
      }
    }

    await product.deleteOne();
    res.json({ message: "Product removed" });
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});
// @desc    Create a new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (review) => review.user.toString() === req.user._id.toString(),
    );
    if (alreadyReviewed) {
      res.status(400);
      throw new Error("Product already reviewed");
    }
    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;

    product.rating =
      product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length;

    await product.save();
    res.status(201).json({ message: "Review added" });
  } else {
    res.status(404);
    throw new Error("Resource not found");
  }
});

// @desc    Get top rated products
// @route   GET /api/products/top
// @access  Public
const getTopRatedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).sort({ rating: -1 }).limit(3);
  res.status(200).json(products);
});

const updateStock = asyncHandler(async (req, res) => {
  const { orderItems } = req.body;

  try {
    for (const item of orderItems) {
      const product = await Product.findById(item.product); // 🔹 fixed

      if (!product) {
        return res.status(404).json({ message: `Product with ID ${item.productId} not found` });
      }

      if (product.variants && product.variants.length > 0) {
        // Find the variant by ID
        const variant = product.variants.id(item.variantId);
        if (!variant) {
          return res.status(404).json({
            message: `Variant with ID ${item.variantId} not found for product ${item.productId}`,
          });
        }

        // Find size (optional)
        if (item.variantSize) {
          const sizeObj = variant.sizes.find((s) => s.size === item.variantSize);
          if (!sizeObj) {
            return res.status(404).json({
              message: `Size ${item.variantSize} not found for variant ${item.variantId}`,
            });
          }

          sizeObj.stock -= item.qty;
          if (sizeObj.stock < 0) sizeObj.stock = 0;
        } else {
          // No sizes, just decrease variant stock
          variant.stock -= item.qty;
          if (variant.stock < 0) variant.stock = 0;
        }

        // Update total product stock
        product.countInStock = product.variants.reduce(
          (acc, v) =>
            acc + (v.sizes?.length ? v.sizes.reduce((sum, s) => sum + s.stock, 0) : v.stock || 0),
          0,
        );
      } else {
        // No variants → update product stock directly
        product.countInStock -= item.qty;
        if (product.countInStock < 0) product.countInStock = 0;
      }

      await product.save();
    }

    res.status(200).json({ message: "Stock updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating stock", error: error.message });
  }
});

const createShippingPrice = asyncHandler(async (req, res) => {
  const { timeToDeliver, shippingFee, minDeliveryCost } = req.body;

  const delivery = await Delivery.findOne({});

  if (delivery) {
    delivery.timeToDeliver = timeToDeliver || delivery.timeToDeliver;
    delivery.shippingFee = shippingFee || delivery.shippingFee;
    delivery.minDeliveryCost = minDeliveryCost || delivery.minDeliveryCost;

    const updatedDelivery = await delivery.save();

    res.json(updatedDelivery);
  }
});
const getDeliveryStatus = asyncHandler(async (req, res) => {
  const delivery = await Delivery.find({});

  res.json(delivery);
});

const createDiscount = asyncHandler(async (req, res) => {
  const { discountBy, category } = req.body;

  // 1️⃣ Create the discount
  const discount = await Discount.create({ discountBy, category });

  // 2️⃣ Update all products in the discounted categories
  const products = await Product.find({ category: { $in: category } });

  for (const product of products) {
    product.hasDiscount = discountBy > 0;
    product.discountBy = discountBy;
    product.discountedPrice = product.price - product.price * discountBy;

    await product.save();
  }

  // 3️⃣ Return the created discount
  res.json(discount);
});

const updateDiscounts = asyncHandler(async (req, res) => {
  const { discountBy, category } = req.body;
  const discount = await Discount.findOne({});
  if (discount) {
    discount.discountBy = discountBy || discount.discountBy;
    discount.category = category || discount.category;

    const updatedDiscount = await discount.save();

    res.json(updatedDiscount);
  }
});

const deleteDiscount = asyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log(id);
  // 1. Delete the discount
  const discount = await Discount.findByIdAndDelete(id);
  if (!discount) {
    res.status(404);
    throw new Error("Discount not found");
  }

  // 2. Reset products linked to this discount's categories
  await Product.updateMany(
    { category: { $in: discount.category } }, // products in those categories
    {
      $set: { hasDiscount: false },
      $unset: { discountedPrice: "" }, // remove discountedPrice field
    },
  );

  res.json({ message: "Discount deleted and products updated" });
});

const getDiscountStatus = asyncHandler(async (req, res) => {
  const discount = await Discount.find({});

  res.json(discount);
});

const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;

  const checkExists = await Category.findOne({ name: name });
  if (checkExists) {
    res.status(500);
    throw new Error(`Category ${name} already exists`);
  }
  const newCategory = await Category.create({ name: name });

  res.status(201).json(newCategory);
});

/* const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({});
  res.status(200).json(categories);
}); */
const getCategories = asyncHandler(async (req, res) => {
  const pageSize = 10; // number of categories per page
  const page = Number(req.query.pageNumber) || 1;

  // Optional search by name
  const keyword = req.query.keyword ? { name: { $regex: req.query.keyword, $options: "i" } } : {};

  // Total count matching keyword
  const count = await Category.countDocuments({ ...keyword });

  // Fetch paginated categories
  const categories = await Category.find({ ...keyword })
    .sort({ name: 1 }) // optional: sort by name
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.status(200).json({
    categories,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;

  const deleteCategory = await Category.findOneAndDelete({ name: name });
  if (!deleteCategory) {
    res.status(404);
    throw new Error("Category not found");
  }
  res.json(deleteCategory);
});

module.exports = {
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
  createDiscount,
  createCategory,
  getCategories,
  deleteCategory,
  deleteDiscount,
  getAllProducts,
  fetchProductsByIds,
  featuredProducts,
  updateProductVariants,
  deleteProductVariant,
};
