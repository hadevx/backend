const mongoose = require("mongoose");

const zoneFeeSchema = new mongoose.Schema(
  {
    zone: {
      type: String,
      required: true,
      trim: true, // e.g. "Hawalli"
    },
    fee: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
);

const deliverySchema = new mongoose.Schema(
  {
    timeToDeliver: {
      type: String,
      default: "today",
      required: true,
    },
    shippingFee: {
      type: Number,
      default: 0,
      required: true,
    },
    // ✅ FIX TYPO: requried -> required
    minDeliveryCost: {
      type: Number,
      default: 0,
      required: true,
    },

    // ✅ Free delivery above X KD (0 = disabled)
    freeDeliveryThreshold: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ✅ Zone-based fees (override shippingFee)
    zoneFees: {
      type: [zoneFeeSchema],
      default: [],
    },
  },
  { timestamps: true }, // ✅ gives you createdAt/updatedAt
);

const Delivery = mongoose.model("Delivery", deliverySchema);

module.exports = Delivery;
