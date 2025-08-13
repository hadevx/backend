const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      default: "active",
      required: true,
    },
    banner: {
      type: String,
      deafult: "",
    },
  },
  { timestamps: true }
);

const Store = mongoose.model("Store", storeSchema);

module.exports = Store;
