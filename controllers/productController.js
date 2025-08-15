const asyncHandler = require("../middleware/asyncHandler");
const Product = require("../models/productModel");
const Delivery = require("../models/deliveryModel");
const Discount = require("../models/discountModel");
const Category = require("../models/categoryModel");
const fs = require("fs");
const path = require("path");
const cloudinary = require("cloudinary").v2;
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

const getProductsPagination = asyncHandler(async (req, res) => {
  const pageSize = 8; // how many per page
  const page = Number(req.query.pageNumber) || 1;

  // Search filter
  const keyword = req.query.keyword ? { name: { $regex: req.query.keyword, $options: "i" } } : {};

  // Count total products matching search
  const count = await Product.countDocuments({ ...keyword });

  // Paginate + sort newest first
  const products = await Product.find({ ...keyword })
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    products,
    page,
    pages: Math.ceil(count / pageSize), // total pages
    total: count, // total products
  });
});

const getLatestProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).sort({ createdAt: -1 }).limit(5);

  if (!products || products.length === 0) {
    res.status(404);
    throw new Error("No products found");
  }
  res.status(200).json(products);
});

// @desc    Get one product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.status(200).json(product);
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/admin
const createProduct = asyncHandler(async (req, res) => {
  const { name, price, image, imagePublicId, brand, category, countInStock, description } =
    req.body;

  if (!name || !price || !image || !description || !countInStock) {
    res.status(400);
    throw new Error("Please fill all the fields");
  }

  const product = {
    name,
    price,
    user: req.user._id,
    image,
    imagePublicId, // save Cloudinary public_id
    brand: brand || "",
    category: category || "",
    countInStock,
    description,
  };

  const createdProduct = await Product.create(product);
  res.status(201).json(createdProduct);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/admin
const updateProduct = asyncHandler(async (req, res) => {
  const { name, price, description, image, imagePublicId, brand, category, countInStock } =
    req.body;

  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Delete old image if a new one is uploaded
  if (image && product.imagePublicId && product.imagePublicId !== imagePublicId) {
    try {
      const result = await cloudinary.uploader.destroy(product.imagePublicId);
      if (result.result !== "ok" && result.result !== "not found") {
        console.warn("Failed to delete old image:", result);
      }
    } catch (err) {
      console.error("Cloudinary deletion error:", err.message);
    }
  }

  // Update fields
  product.name = name ?? product.name;
  product.price = price ?? product.price;
  product.description = description ?? product.description;
  product.image = image ?? product.image;
  product.imagePublicId = imagePublicId ?? product.imagePublicId; // save new publicId
  product.brand = brand ?? product.brand;
  product.category = category ?? product.category;
  product.countInStock = countInStock ?? product.countInStock;

  const updatedProduct = await product.save();

  res.status(200).json(updatedProduct);
});

const getProductsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;

  // Find the main category document by name
  const categoryDoc = await Category.findOne({ name: category });

  if (!categoryDoc) {
    res.status(404);
    throw new Error("Category not found");
  }

  // Recursive function to get all child category IDs
  const getAllCategoryIds = async (catId) => {
    const ids = [catId];
    const children = await Category.find({ parent: catId });
    for (const child of children) {
      ids.push(...(await getAllCategoryIds(child._id)));
    }
    return ids;
  };

  const categoryIds = await getAllCategoryIds(categoryDoc._id);

  // Now find products in any of these categories
  const products = await Product.find({ category: { $in: categoryIds } });

  res.status(200).json(products);
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    // Remove image from Cloudinary if it exists
    if (product.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(product.imagePublicId);
      } catch (err) {
        console.error("Failed to delete image from Cloudinary:", err);
      }
    }

    await product.deleteOne();
    res.json({ message: "Product removed" });
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
  /*   const product = await Product.findById(req.params.id);

  if (product) {
    // Remove image file if it exists
    if (product.image) {
      const imagePath = path.join(__dirname, "../uploads", path.basename(product.image));
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error("Failed to delete image:", err);
        }
      });
    }

    await product.deleteOne();
    res.json({ message: "Product removed" });
  } else {
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

  const discount = await Discount.create({ discountBy, category });

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
  const { id } = req.body;
  const deleteDiscount = await Discount.findOneAndDelete(id);
  res.json(deleteDiscount);
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

const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({});
  res.status(200).json(categories);
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
};
