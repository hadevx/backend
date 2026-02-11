const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      default: "active",
      required: true,
    },

    storeName: {
      type: String,
    },

    banner: {
      type: String,
      default: "",
      trim: true,
    },

    phoneNumber: {
      type: String,
      default: "",
      trim: true,
      // simple Kuwait-friendly validation (optional)
      validate: {
        validator: function (v) {
          if (!v) return true; // allow empty
          // accepts +965XXXXXXXX or 965XXXXXXXX or XXXXXXXX
          return /^(\+?\d{1,3})?\s?\d{7,12}$/.test(v.replace(/\s/g, ""));
        },
        message: "Invalid phone number format",
      },
    },

    instagram: {
      type: String,
      default: "",
      trim: true,
    },

    email: {
      type: String,
      default: "",
      trim: true,
      // basic email validation (optional)
      validate: {
        validator: function (v) {
          if (!v) return true; // allow empty
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: "Invalid email format",
      },
    },

    twitter: {
      type: String,
      default: "",
      trim: true,
    },

    tiktok: {
      type: String,
      default: "",
      trim: true,
    },

    cashOnDeliveryEnabled: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const Store = mongoose.model("Store", storeSchema);

module.exports = Store;
