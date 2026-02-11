const asyncHandler = require("../middleware/asyncHandler");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");

const createCategory = asyncHandler(async (req, res) => {
  try {
    const { name, parent, image } = req.body;

    // Check if category with same name exists under same parent
    const existing = await Category.findOne({
      name: name.trim(),
      parent: parent || null,
    });

    if (existing) {
      return res.status(400).json({ message: "Category already exists under this parent" });
    }

    const category = new Category({
      name: name.trim(),
      parent: parent || null,
      image,
    });

    const saved = await category.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const deleteCategory = asyncHandler(async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const deletedCategory = await Category.findOneAndDelete({ name });

    if (!deletedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({ message: "Category deleted successfully", category: deletedCategory });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update
const updateCategory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params; // category id
    const { name, parent, image } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Update fields only if provided
    if (name) category.name = name;
    if (parent !== undefined) category.parent = parent || null;
    if (image !== undefined) category.image = image;

    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
const getCategories = async (req, res) => {
  const pageSize = 10; // categories per page
  const page = Number(req.query.pageNumber) || 1;

  // Optional search
  const keyword = req.query.keyword ? { name: { $regex: req.query.keyword, $options: "i" } } : {};

  // Count total matching categories
  const count = await Category.countDocuments({ ...keyword });

  // Fetch paginated categories
  const categories = await Category.find({ ...keyword })
    .populate("parent", "name")
    .sort({ name: 1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    categories,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
};

const getMainCategoriesWithCounts = asyncHandler(async (req, res) => {
  const categories = await Category.find({ parent: null }).sort({ name: 1 });

  // Get all categories once to build a lookup map
  const allCategories = await Category.find();

  // Helper: recursively get all child category IDs
  const getAllChildIds = (catId, categories) => {
    const children = categories.filter((c) => String(c.parent) === String(catId));
    let ids = children.map((c) => c._id.toString());
    children.forEach((c) => {
      ids = ids.concat(getAllChildIds(c._id, categories));
    });
    return ids;
  };

  const result = [];

  for (const cat of categories) {
    // Get all subcategory IDs + main category itself
    const categoryIds = [cat._id.toString(), ...getAllChildIds(cat._id, allCategories)];

    // Count products in any of these categories
    const count = await Product.countDocuments({ category: { $in: categoryIds } });

    result.push({
      _id: cat._id,
      name: cat.name,
      count,
    });
  }

  res.json(result);
});

module.exports = {
  createCategory,
  deleteCategory,
  updateCategory,
  getCategories,
  getMainCategoriesWithCounts,
};
