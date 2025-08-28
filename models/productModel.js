const mongoose = require("mongoose");
const { Schema } = mongoose;

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
        url: { type: String, required: true }, // Cloudinary URL
        publicId: { type: String, required: true }, // Cloudinary public_id
      },
    ],

    brand: {
      type: String,
    },
    category: {
      type: String,
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
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
