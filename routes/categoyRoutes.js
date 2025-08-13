const express = require("express");
const router = express.Router();
const Category = require("../models/categoryModel");

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

// Get all categories (flat list)
router.get("/", async (req, res) => {
  const categories = await Category.find().populate("parent", "name");
  res.json(categories);
});

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
