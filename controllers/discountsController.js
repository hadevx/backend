const asyncHandler = require("../middleware/asyncHandler");
const Product = require("../models/productModel");
const Discount = require("../models/discountModel");

const createDiscount = asyncHandler(async (req, res) => {
  const { discountBy, category } = req.body;

  // 1️⃣ Create the discount
  const discount = await Discount.create({ discountBy, category });

  // 2️⃣ Update all products in the discounted categories
  const products = await Product.find({ category: { $in: category } });

  for (const product of products) {
    product.hasDiscount = discountBy > 0;
    product.discountBy = discountBy;
    product.discountedPrice = product.price - product.price * discountBy;

    await product.save();
  }

  // 3️⃣ Return the created discount
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
  const { id } = req.params;
  console.log(id);
  // 1. Delete the discount
  const discount = await Discount.findByIdAndDelete(id);
  if (!discount) {
    res.status(404);
    throw new Error("Discount not found");
  }

  // 2. Reset products linked to this discount's categories
  await Product.updateMany(
    { category: { $in: discount.category } }, // products in those categories
    {
      $set: { hasDiscount: false },
      $unset: { discountedPrice: "" }, // remove discountedPrice field
    },
  );

  res.json({ message: "Discount deleted and products updated" });
});

const getDiscountStatus = asyncHandler(async (req, res) => {
  const discount = await Discount.find({});

  res.json(discount);
});

module.exports = {
  getDiscountStatus,
  deleteDiscount,
  updateDiscounts,
  createDiscount,
};
