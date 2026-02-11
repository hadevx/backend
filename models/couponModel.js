const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    discountBy: {
      type: Number, // 0.1 = 10%
      required: true,
    },

    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
      },
    ],

    maxUses: {
      type: Number, // optional
      default: null,
    },

    usedCount: {
      type: Number,
      default: 0,
    },

    expiresAt: {
      type: Date,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const Coupon = mongoose.model("Coupon", couponSchema);
module.exports = Coupon;
