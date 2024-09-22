const asyncHandler = require("../middleware/asyncHandler");
const Product = require("../models/productModel");
const Delivery = require("../models/deliveryModel");
const Discount = require("../models/discountModel");
const Category = require("../models/categoryModel");

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = 8;
  const page = Number(req.query.pageNumber) || 1;
  const keyword = req.query.keyword ? { name: { $regex: req.query.keyword, $options: "i" } } : {};
  const count = await Product.countDocuments({ ...keyword });

  const products = await Product.find({}).sort({ createdAt: -1 });

  res.json(products);
});

const getLatestProducts = asyncHandler(async (req, res) => {
  const latest = 5;

  const products = await Product.find({}).sort({ createdAt: -1 }).limit(latest);
  if (products) {
    return res.status(200).json(products);
  } else {
    res.status(404);
    throw new Error("Products not found");
  }
});

// @desc    Fetch a product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    return res.status(200).json(product);
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/admin
const createProduct = asyncHandler(async (req, res) => {
  const { name, price, image, brand, category, countInStock, description } = req.body;

  const product = {
    name,
    price,
    user: req.user._id,
    image,
    brand,
    category,
    countInStock,
    numReviews: 0,
    description,
  };
  const createdProduct = await Product.create(product);
  res.status(201).json(createdProduct);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/admin
const updateProduct = asyncHandler(async (req, res) => {
  const { name, price, description, image, brand, category, countInStock } = req.body;
  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name || product.name;
    product.price = price || product.price;
    product.description = description || product.description;
    product.image = image || product.image;
    product.brand = brand || product.brand;
    product.category = category || product.category;
    product.countInStock = countInStock || product.countInStock;

    const updatedProduct = await product.save();

    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});
const getProductsByCategory = asyncHandler(async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.find({ category });
    res.status(200).json(products);
  } catch (error) {
    res.status(404);
    throw new Error("Category not found");
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await Product.deleteOne({ _id: product._id });
    res.status(200).json({ message: "Product deleted" });
  } else {
    res.status(404);
    throw new Error("Resource not found");
  }
  /*  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    res.status(200).json(product);
  } catch (error) {
    res.status(404);
    throw new Error("Product not found");
  } */
});
// @desc    Create a new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (review) => review.user.toString() === req.user._id.toString()
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
    // Loop through each product in the order
    for (const item of orderItems) {
      const product = await Product.findById(item._id);

      if (product) {
        // Update stock quantity
        product.countInStock -= item.qty;
        if (product.countInStock < 0) {
          product.countInStock = 0; // Prevent negative stock
        }
        await product.save();
      } else {
        return res.status(404).json({ message: `Product with ID ${item._id} not found` });
      }
    }

    res.status(200).json({ message: "Stock updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating stock", error: error.message });
  }
});
const createShippingPrice = asyncHandler(async (req, res) => {
  const { timeToDeliver, shippingFee } = req.body;

  const delivery = await Delivery.findById("66d4d0ca3a5785489f6fc255");

  if (delivery) {
    delivery.timeToDeliver = timeToDeliver || delivery.timeToDeliver;
    delivery.shippingFee = shippingFee || delivery.shippingFee;

    const updatedDelivery = await delivery.save();

    res.json(updatedDelivery);
  }
});
const getDeliveryStatus = asyncHandler(async (req, res) => {
  const delivery = await Delivery.findById("66d4d0ca3a5785489f6fc255");

  res.json(delivery);
});

const updateDiscounts = asyncHandler(async (req, res) => {
  const { discountBy, category } = req.body;
  const discount = await Discount.findById("66d4e088b6f8fec8940ed64c");
  if (discount) {
    discount.discountBy = discountBy || discount.discountBy;
    discount.category = category || discount.category;

    const updatedDiscount = await discount.save();

    res.json(updatedDiscount);
  }
});
const getDiscountStatus = asyncHandler(async (req, res) => {
  const discount = await Discount.findById("66d4e088b6f8fec8940ed64c");

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

const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({});
  res.status(200).json(categories);
});

const deleteCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;

  const deleteCategory = await Category.findOneAndDelete({ name: name });
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
  createCategory,
  getCategories,
  deleteCategory,
};
