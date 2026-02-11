const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: Number, required: true },

    isAdmin: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    isVIP: { type: Boolean, default: false },

    // ✅ NEW
    lastLoginAt: {
      type: Date,
      default: null,
    },

    deviceInfo: {
      platform: String, // e.g. Windows, iPhone, Android
      userAgent: String, // raw browser UA
      ip: String,
    },

    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

module.exports = User;
