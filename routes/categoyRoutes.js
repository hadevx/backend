const express = require("express");
const router = express.Router();
const Category = require("../models/categoryModel");
const { protectAdmin } = require("../middleware/authMiddleware");

// Create a category or subcategory
router.post("/", async (req, res) => {
  try {
    const { name, parent } = req.body;
    const category = new Category({ name, parent: parent || null });
    const saved = await category.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a category by name
router.delete("/", protectAdmin, async (req, res) => {
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

const getCategories = async (req, res) => {
  const pageSize = 5; // categories per page
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

const getAllCategories = async (req, res) => {
  const categories = await Category.find({});
  res.json(categories);
};

router.get("/all", getAllCategories);

// Get all categories (flat list)
router.get("/", getCategories);

// Get categories as a tree
const getCategoryTree = async (parentId = null) => {
  const categories = await Category.find({ parent: parentId });
  return Promise.all(
    categories.map(async (cat) => ({
      _id: cat._id,
      name: cat.name,
      children: await getCategoryTree(cat._id),
    }))
  );
};

router.get("/tree", async (req, res) => {
  const tree = await getCategoryTree();
  res.json(tree);
});

module.exports = router;
