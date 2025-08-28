const express = require("express");
const router = express.Router();
const Category = require("../models/categoryModel");
const { protectUser, protectAdmin } = require("../middleware/authMiddleware");
const { createCategory, deleteCategory } = require("../controllers/categoryControllers");

// Create a category or subcategory
router.post("/", protectUser, protectAdmin, createCategory);

// Delete a category by name
router.delete("/", protectUser, protectAdmin, deleteCategory);

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
      image: cat.image,
      children: await getCategoryTree(cat._id),
    }))
  );
};

router.get("/tree", async (req, res) => {
  const tree = await getCategoryTree();
  res.json(tree);
});

router.put(
  "/:id",
  protectUser,
  protectAdmin,
  require("../controllers/categoryControllers").updateCategory
);
module.exports = router;
