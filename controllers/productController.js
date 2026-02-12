const asyncHandler = require("../middleware/asyncHandler");
const Product = require("../models/productModel");
const Delivery = require("../models/deliveryModel");
const Discount = require("../models/discountModel");
const Category = require("../models/categoryModel");
const fs = require("fs");
const path = require("path");

/**
 * Helpers: normalize color/size (capitalize)
 * - color: "black" -> "Black"
 * - size:  "xl" -> "XL", "medium" -> "Medium"
 */
const capitalizeWord = (val) => {
  if (val === null || val === undefined) return val;
  const s = String(val).trim();
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
};

const normalizeColor = (color) => capitalizeWord(color);

// Keep common apparel sizes uppercased; otherwise capitalize word
const normalizeSize = (size) => {
  if (size === null || size === undefined) return size;
  const s = String(size).trim();
  if (!s) return s;

  // Common tokens that should remain uppercase
  const upperTokens = new Set([
    "XXS",
    "XS",
    "S",
    "M",
    "L",
    "XL",
    "XXL",
    "XXXL",
    "XXXL",
    "XXXXL",
    "5XL",
    "6XL",
    "7XL",
    "8XL",
    "9XL",
    "10XL",
    "OS",
    "ONE SIZE",
    "ONESIZE",
    "UK",
    "US",
    "EU",
  ]);

  const up = s.toUpperCase();
  if (upperTokens.has(up)) return up;

  // Numeric sizes like "42" or "42.5" -> keep as-is
  if (/^\d+(\.\d+)?$/.test(s)) return s;

  // Multi-word (e.g., "one size") -> "One Size"
  if (s.includes(" ")) {
    return s
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => capitalizeWord(w))
      .join(" ");
  }

  // Default: "medium" -> "Medium"
  return capitalizeWord(s);
};

const normalizeVariants = (variants) => {
  if (!Array.isArray(variants)) return variants;

  return variants.map((v) => {
    const out = { ...(v || {}) };

    if (out.color !== undefined) out.color = normalizeColor(out.color);

    if (Array.isArray(out.sizes)) {
      out.sizes = out.sizes.map((s) => ({
        ...(s || {}),
        size: normalizeSize(s?.size),
        stock: s?.stock,
        price: s?.price ?? 0,
      }));
    }

    // images untouched
    return out;
  });
};

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getAllProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({});
  res.json(products);
});

const escapeRegex = (s = "") => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getProducts = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.limit) || 30;
  const page = Number(req.query.pageNumber) || 1;

  const keyword = (req.query.keyword || "").trim();
  const colorParam = (req.query.color || "").trim(); // "red,black"
  const categoryParam = (req.query.category || "").trim(); // category id
  const inStock = req.query.inStock === "true";

  // ✅ featured filter (?featured=true)
  const featured = req.query.featured === "true";

  const minPrice =
    req.query.minPrice !== undefined && req.query.minPrice !== ""
      ? Number(req.query.minPrice)
      : null;

  const maxPrice =
    req.query.maxPrice !== undefined && req.query.maxPrice !== ""
      ? Number(req.query.maxPrice)
      : null;

  const filter = {};

  // Search (safe regex)
  if (keyword) {
    filter.name = { $regex: escapeRegex(keyword), $options: "i" };
  }

  // Category
  if (categoryParam) {
    filter.category = categoryParam;
  }

  // ✅ Featured
  if (featured) {
    filter.featured = true;
  }

  // Price
  if (minPrice !== null || maxPrice !== null) {
    filter.price = {};
    if (minPrice !== null && !Number.isNaN(minPrice)) filter.price.$gte = minPrice;
    if (maxPrice !== null && !Number.isNaN(maxPrice)) filter.price.$lte = maxPrice;

    if (Object.keys(filter.price).length === 0) delete filter.price;
  }

  // In stock
  if (inStock) {
    filter.countInStock = { $gt: 0 };
  }

  // Color filter (variants.color)
  if (colorParam) {
    const colors = colorParam
      .split(",")
      .map((c) => c.trim().toLowerCase())
      .filter(Boolean);

    if (colors.length) {
      filter["variants.color"] = { $in: colors };
    }
  }

  const count = await Product.countDocuments(filter);

  const products = await Product.find(filter)
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

const getFeaturedProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find({ featured: true })
      .populate("category", "name") // ✅ populate only category name
      .limit(4);

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

const getProductById = asyncHandler(async (req, res) => {
  // 1. Fetch the product and populate category
  const product = await Product.findById(req.params.id).populate("category", "name parent");
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Return product
  res.status(200).json(product);
});
// @desc    Get related products (same category + parent + children)
// @route   GET /api/products/:id/related?limit=8
// @access  Public
const getRelatedProducts = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 8;

  const current = await Product.findById(req.params.id).populate("category", "_id parent");
  if (!current) {
    res.status(404);
    throw new Error("Product not found");
  }

  const categoryId = current.category?._id || current.category;
  if (!categoryId) {
    // no category -> fallback to latest products excluding current
    const fallback = await Product.find({ _id: { $ne: current._id } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("category", "name");
    return res.status(200).json(fallback);
  }

  // 1) Load category to get parent
  const categoryDoc = await Category.findById(categoryId).select("_id parent");
  if (!categoryDoc) {
    const fallback = await Product.find({ _id: { $ne: current._id } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("category", "name");
    return res.status(200).json(fallback);
  }

  // 2) Get all children categories recursively
  const getAllChildCategoryIds = async (catId) => {
    const ids = [catId];
    const children = await Category.find({ parent: catId }).select("_id");
    for (const child of children) {
      ids.push(...(await getAllChildCategoryIds(child._id)));
    }
    return ids;
  };

  const relatedCategoryIds = new Set();
  // include self category + children
  (await getAllChildCategoryIds(categoryDoc._id)).forEach((id) =>
    relatedCategoryIds.add(String(id)),
  );

  // include parent + parent's children (siblings)
  if (categoryDoc.parent) {
    relatedCategoryIds.add(String(categoryDoc.parent));
    const siblingsAndTheirChildren = await getAllChildCategoryIds(categoryDoc.parent);
    siblingsAndTheirChildren.forEach((id) => relatedCategoryIds.add(String(id)));
  }

  const categoryIdsArr = Array.from(relatedCategoryIds);

  // 3) Query related products excluding current, prefer newest
  const related = await Product.find({
    _id: { $ne: current._id },
    category: { $in: categoryIdsArr },
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("category", "name");

  // 4) If still not enough, top up with latest products
  if (related.length < limit) {
    const needed = limit - related.length;
    const existingIds = related.map((p) => p._id);
    const extra = await Product.find({
      _id: { $nin: [current._id, ...existingIds] },
    })
      .sort({ createdAt: -1 })
      .limit(needed)
      .populate("category", "name");

    return res.status(200).json([...related, ...extra]);
  }

  res.status(200).json(related);
});

const createProduct = asyncHandler(async (req, res) => {
  let { name, price, image, category, countInStock, description, variants } = req.body;

  // ✅ Validation
  if (!name || !price || !image || !description || !countInStock) {
    res.status(400);
    throw new Error("Please fill all the required fields");
  }

  // ✅ Normalize variants (capitalize size/color)
  variants = normalizeVariants(variants);

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
  let {
    name,
    price,
    description,
    image,
    category,
    countInStock,
    featured,
    hasDiscount,
    discountBy,
    variants,
  } = req.body;

  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // ✅ Delete old images that are no longer in the new images array
  if (image && Array.isArray(image)) {
    const oldImages = product.image || [];

    for (const oldImg of oldImages) {
      const oldUrl = oldImg?.url ? oldImg.url : oldImg;
      const existsInNew = image.some((img) => (img?.url ? img.url : img) === oldUrl);

      if (!existsInNew && typeof oldUrl === "string" && oldUrl.includes("/uploads/")) {
        const filename = oldUrl.split("/uploads/").pop();
        const filePath = path.join(__dirname, "..", "uploads", filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
    }

    product.image = image; // update product images
  }

  // ✅ Update basic fields
  if (name !== undefined) product.name = name;
  if (price !== undefined) product.price = Number(price);
  if (description !== undefined) product.description = description;
  if (category !== undefined) product.category = category;
  if (featured !== undefined) product.featured = featured;

  // --------------------------
  // ✅ Stock Update (FIXED)
  // --------------------------
  const variantsProvided = Array.isArray(variants);

  if (variantsProvided) {
    // ✅ Normalize variants (capitalize size/color)
    variants = normalizeVariants(variants);

    // Only compute stock if variants have sizes with stock
    const totalStock = variants.reduce((acc, v) => {
      const sizes = Array.isArray(v?.sizes) ? v.sizes : [];
      const variantStock = sizes.reduce((sum, s) => sum + Number(s?.stock || 0), 0);
      return acc + variantStock;
    }, 0);

    // ✅ Update variants always
    product.variants = variants;

    // ✅ If variants truly contain stock data, sync it
    // ✅ Otherwise DO NOT overwrite countInStock with 0
    if (totalStock > 0) {
      product.countInStock = totalStock;
    } else {
      // fallback: if user sent countInStock, use it
      if (countInStock !== undefined) {
        product.countInStock = Number(countInStock);
      }
      // else keep existing product.countInStock
    }
  } else {
    // ✅ No variants sent, normal stock update
    if (countInStock !== undefined) {
      product.countInStock = Number(countInStock);
    }
  }

  // --------------------------
  // ✅ Discount logic
  // --------------------------
  if (hasDiscount !== undefined) product.hasDiscount = hasDiscount;
  if (discountBy !== undefined) product.discountBy = Number(discountBy);

  const finalHasDiscount = product.hasDiscount === true;
  const finalDiscountBy = Number(product.discountBy || 0);

  product.discountedPrice = finalHasDiscount
    ? product.price - product.price * finalDiscountBy
    : product.price;

  const updatedProduct = await product.save();
  res.status(200).json(updatedProduct);
});

// controllers/productController.js
const updateProductVariants = asyncHandler(async (req, res) => {
  const { id } = req.params; // productId
  let { variantId, color, sizes, images } = req.body;

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

  // ✅ Normalize (capitalize)
  if (color !== undefined) color = normalizeColor(color);
  if (Array.isArray(sizes)) {
    sizes = sizes.map((s) => ({
      size: normalizeSize(s?.size),
      stock: s?.stock,
      price: s?.price ?? 0,
    }));
  }

  // Update fields
  if (color) product.variants[variantIndex].color = color;
  if (sizes && Array.isArray(sizes)) {
    product.variants[variantIndex].sizes = sizes;
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

// Get products by category (including children)
/* const getProductsByCategory = asyncHandler(async (req, res) => {
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
}); */
// GET /api/products/category/:id?page=1&limit=12&search=iphone&sort=createdAt&order=desc&minPrice=10&maxPrice=999&inStock=true
const getProductsByCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // ✅ Simple query params (with defaults)
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 12;

  const search = (req.query.search || "").trim();
  const minPrice = req.query.minPrice ? Number(req.query.minPrice) : null;
  const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : null;
  const inStock = req.query.inStock === "true";

  // ✅ NEW: color filter (supports "red" OR "red,blue")
  const color = (req.query.color || "").trim(); // e.g. "red" OR "red,blue"
  const colors = color
    ? color
        .split(",")
        .map((c) => c.trim().toLowerCase())
        .filter(Boolean)
    : [];

  // ✅ Simple sort mapping
  const sortKey = req.query.sort || "createdAt"; // createdAt | price | name
  const order = req.query.order === "asc" ? 1 : -1;
  const allowedSort = ["createdAt", "price", "name"];
  const sortField = allowedSort.includes(sortKey) ? sortKey : "createdAt";

  // 1) category exists
  const category = await Category.findById(id);
  if (!category) return res.status(404).json({ message: "Category not found" });

  // 2) get category + children IDs
  const getAllCategoryIds = async (catId) => {
    const children = await Category.find({ parent: catId }).select("_id");
    const childIds = await Promise.all(children.map((c) => getAllCategoryIds(c._id)));
    return [catId, ...childIds.flat()];
  };

  const categoryIds = await getAllCategoryIds(category._id);

  // 3) build filter
  const filter = { category: { $in: categoryIds } };

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  if (minPrice !== null || maxPrice !== null) {
    filter.price = {};
    if (minPrice !== null) filter.price.$gte = minPrice;
    if (maxPrice !== null) filter.price.$lte = maxPrice;
  }

  if (inStock) filter.countInStock = { $gt: 0 };

  // ✅ NEW: apply color filter (matches ANY variant color)
  if (colors.length > 0) {
    filter["variants.color"] = { $in: colors };
  }

  // 4) pagination
  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort({ [sortField]: order })
      .skip(skip)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  res.status(200).json({
    category: { _id: category._id, name: category.name },
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasPrev: page > 1,
      hasNext: page * limit < total,
    },
    filters: {
      search: search || null,
      minPrice,
      maxPrice,
      inStock,
      color: colors.length ? colors : null,
      sort: sortField,
      order: order === 1 ? "asc" : "desc",
    },
    products,
  });
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

const updateStock = asyncHandler(async (req, res) => {
  const { orderItems } = req.body;

  try {
    for (const item of orderItems) {
      const product = await Product.findById(item.product);

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

        // Find size (optional) - compare normalized values
        if (item.variantSize) {
          const wantedSize = normalizeSize(item.variantSize);
          const sizeObj = variant.sizes.find((s) => normalizeSize(s.size) === wantedSize);
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

// @desc    Get products on sale (discounted)
// @route   GET /api/products/sale
// @access  Public
const getSaleProducts = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.pageSize) || 30;
  const page = Number(req.query.pageNumber) || 1;

  // optional search
  const keyword = req.query.keyword ? { name: { $regex: req.query.keyword, $options: "i" } } : {};

  // sale filter: supports your current data model
  const saleFilter = {
    $or: [{ hasDiscount: true }],
  };

  const filter = { ...keyword, ...saleFilter };

  const count = await Product.countDocuments(filter);

  const products = await Product.find(filter)
    .sort({ createdAt: -1 })
    .populate("category", "name")
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.status(200).json({
    products,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  updateStock,
  getLatestProducts,
  getSaleProducts,
  getAllProducts,
  fetchProductsByIds,
  getFeaturedProducts,
  updateProductVariants,
  deleteProductVariant,
  getRelatedProducts,
};
