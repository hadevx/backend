const asyncHandler = require("../middleware/asyncHandler");
const Category = require("../models/categoryModel");

const createCategory = asyncHandler(async (req, res) => {
  try {
    const { name, parent, image } = req.body;
    const category = new Category({ name, parent: parent || null, image });
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

module.exports = { createCategory, deleteCategory };
