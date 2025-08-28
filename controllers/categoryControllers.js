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

module.exports = { createCategory, deleteCategory, updateCategory };
