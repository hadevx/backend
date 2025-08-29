const asyncHandler = require("../middleware/asyncHandler");
const Product = require("../models/productModel");
const Delivery = require("../models/deliveryModel");
const Discount = require("../models/discountModel");
const Category = require("../models/categoryModel");
const fs = require("fs");
const path = require("path");
// const cloudinary = require("cloudinary").v2;

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getAllProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({});

  res.json(products);
});

const getProducts = asyncHandler(async (req, res) => {
  const pageSize = 20; // how many per page
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
/* const createProduct = asyncHandler(async (req, res) => {
  const { name, price, image, brand, category, countInStock, description } = req.body;

  if (!name || !price || !image || !description || !countInStock) {
    res.status(400);
    throw new Error("Please fill all the fields");
  }
  // ✅ Force image to be an array of objects
  const formattedImages = Array.isArray(image) ? image : [image];

  const product = {
    name,
    price,
    user: req.user._id,
    image: formattedImages,
    brand: brand || "",
    category: category || "",
    countInStock,
    description,
  };

  const createdProduct = await Product.create(product);
  res.status(201).json(createdProduct);
}); */

const createProduct = asyncHandler(async (req, res) => {
  const { name, price, image, brand, category, countInStock, description, variants } = req.body;

  // ✅ Validation
  if (!name || !price || !image || !description || !countInStock) {
    res.status(400);
    throw new Error("Please fill all the required fields");
  }

  // ✅ Format images as array of objects
  const formattedImages = Array.isArray(image) ? image : [image];

  // ✅ Format variants if provided
  const formattedVariants = Array.isArray(variants)
    ? variants.map((v) => ({
        options: {
          color: v?.options?.color || "",
          size: v?.options?.size || "",
        },
        stock: v?.stock ?? 0,
        price: v?.price ?? 0,
        images: Array.isArray(v?.images) ? v.images : [],
      }))
    : [];

  // ✅ Build product object
  const product = {
    user: req.user._id,
    name,
    price,
    image: formattedImages,
    brand: brand || "",
    category: category || "",
    countInStock,
    description,
    variants: formattedVariants,
  };

  // ✅ Save to DB
  const createdProduct = await Product.create(product);
  res.status(201).json(createdProduct);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/admin
/* const updateProduct = asyncHandler(async (req, res) => {
  const {
    name,
    price,
    description,
    image,
    // imagePublicId,
    brand,
    category,
    countInStock,
    featured,
  } = req.body;

  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

 // Delete old local image if a new one is uploaded
  if (image && product.image && product.image !== image) {
    try {
      // Extract filename from URL
      const filename = product.image.split("/").pop();
      const filePath = path.join(__dirname, "..", "uploads", filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (err) {
      console.error("Failed to delete old image:", err.message);
    }
  } 

  // Update fields
  product.name = name ?? product.name;
  product.price = price ?? product.price;
  product.description = description ?? product.description;
  product.image = image ?? product.image;
  // product.imagePublicId = imagePublicId ?? product.imagePublicId; // save new publicId
  product.brand = brand ?? product.brand;
  product.category = category ?? product.category;
  product.countInStock = countInStock ?? product.countInStock;
  product.featured = featured ?? product.featured; //

  const updatedProduct = await product.save();

  res.status(200).json(updatedProduct);
});
 */

const updateProduct = asyncHandler(async (req, res) => {
  const {
    name,
    price,
    description,
    image, // expect an array of { url, publicId } or just URLs
    brand,
    category,
    countInStock,
    featured,
    variants,
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
  // --- ✅ Cleanup variant images ---
  if (Array.isArray(variants)) {
    const oldVariants = product.variants || [];

    for (const oldVar of oldVariants) {
      const oldImages = oldVar.images || [];

      // Find updated variant by _id
      const updatedVar = variants.find((v) => v._id?.toString() === oldVar._id?.toString());

      if (updatedVar) {
        const newImages = updatedVar.images || [];

        for (const oldImg of oldImages) {
          const oldUrl = oldImg.url ? oldImg.url : oldImg;
          const existsInNew = newImages.some((img) => (img.url ? img.url : img) === oldUrl);

          if (!existsInNew && oldUrl.includes("/uploads/variants/")) {
            const filename = oldUrl.split("/uploads/variants/").pop();
            const filePath = path.join(__dirname, "..", "uploads", "variants", filename);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          }
        }
      }
    }
    // Update variant objects
    product.variants = variants.map((v) => ({
      _id: v._id || undefined, // keep existing _id or let Mongo generate
      options: v.options || {},
      price: v.price ?? 0,
      stock: v.stock ?? 0,
      images: v.images || [],
    }));
  }
  // Update other fields
  product.name = name ?? product.name;
  product.price = price ?? product.price;
  product.description = description ?? product.description;
  product.brand = brand ?? product.brand;
  product.category = category ?? product.category;
  product.countInStock = countInStock ?? product.countInStock;
  product.featured = featured ?? product.featured;

  const updatedProduct = await product.save();
  res.status(200).json(updatedProduct);
});

const featuredProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find({ featured: true }).limit(3);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
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
    /*     if (product.image && product.image.includes("/uploads/")) {
      // Extract filename from URL
      const filename = product.image.split("/uploads/").pop();
      const filePath = path.join(__dirname, "..", "uploads", filename);

      fs.unlink(filePath, (err) => {
        if (err) console.error("Failed to delete local image:", err);
      }); */
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

        // TODO: If using Cloudinary, you can also delete via img.publicId
        // await cloudinary.uploader.destroy(img.publicId);
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

/* const updateStock = asyncHandler(async (req, res) => {
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
}); */
const updateStock = asyncHandler(async (req, res) => {
  const { orderItems } = req.body;

  try {
    for (const item of orderItems) {
      const product = await Product.findById(item._id);

      if (!product) {
        return res.status(404).json({ message: `Product with ID ${item._id} not found` });
      }

      if (product.variants && product.variants.length > 0) {
        // Find the variant by ID (or by options like color & size)
        const variant = product.variants.id(item.variantId);
        if (variant) {
          variant.stock -= item.qty;
          if (variant.stock < 0) variant.stock = 0;
        } else {
          return res.status(404).json({
            message: `Variant with ID ${item.variantId} not found for product ${item._id}`,
          });
        }

        // Update total product stock as sum of variant stocks
        product.countInStock = product.variants.reduce((acc, v) => acc + v.stock, 0);
      } else {
        // No variants, update product stock directly
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
};
