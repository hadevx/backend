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
    image: {
      type: String,
      required: true, // fixed typo
    },
    imagePublicId: {
      type: String, // Cloudinary public_id for deletion
    },
    brand: {
      type: String,
    },
    category: {
      type: String,
    },
    description: {
      type: String,
      required: true, // fixed typo
    },
    price: {
      type: Number,
      required: true,
    },
    countInStock: {
      type: Number,
      required: true, // fixed typo
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
