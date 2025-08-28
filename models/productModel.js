const mongoose = require("mongoose");
const { Schema } = mongoose;

/* // 🔹 Child Variant (Size level)
const childVariantSchema = new Schema(
  {
    size: { type: String }, // optional (used only if product has sizes)
    price: { type: Number }, // optional override
    countInStock: { type: Number, default: 0 },
    sku: { type: String, unique: true }, // unique SKU per variant
  },
  { _id: false }
);

// 🔹 Parent Variant (Color or direct stock)
const parentVariantSchema = new Schema(
  {
    color: { type: String }, // optional now (can be omitted for size-only products)

    images: [
      {
        url: { type: String },
        publicId: { type: String },
      },
    ],

    // Child variants (sizes under this color)
    children: { type: [childVariantSchema], default: [] },

    // Direct stock/price (when only color OR only size exists)
    price: { type: Number },
    countInStock: { type: Number, default: 0 },
    sku: { type: String, unique: true },
  },
  { _id: false }
);
 */
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
    // 🔹 Variants organized by color (with images + sizes)
    // variants: [parentVariantSchema],
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
