const mongoose = require("mongoose");

const discountSchema = new mongoose.Schema({
  discountBy: {
    type: Number,
    default: 0,
    required: true,
  },
  category: {
    type: String,
    default: "",
    required: true,
  },
});

const Discount = mongoose.model("Discount", discountSchema);

module.exports = Discount;
