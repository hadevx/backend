const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema({
  status: {
    type: String,
    default: "active",
    required: true,
  },
});

const Store = mongoose.model("Store", storeSchema);

module.exports = Store;
