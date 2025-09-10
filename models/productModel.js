const mongoose = require("mongoose");
const { Schema } = mongoose;

const variantSchema = new Schema({
  color: { type: String, required: true },
  images: [
    {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
    },
  ],
  sizes: [
    {
      size: { type: String, required: true },
      stock: { type: Number, required: true },
      price: { type: Number, default: 0 },
    },
  ],
});

const productSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    name: {
      type: String,
      required: true,
    },

    image: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    ],

    category: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Category",
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    countInStock: {
      type: Number,
      required: true,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    variants: [variantSchema],

    discountBy: {
      type: Number,
      default: 0, // 0.05 = 5%
    },
    discountedPrice: {
      type: Number,
      default: 0, // calculated price after discount
    },
    hasDiscount: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
