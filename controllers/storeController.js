const asyncHandler = require("../middleware/asyncHandler");
const Store = require("../models/storeModel");

const updateStoreStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const store = await Store.findById("66d5f56f917bb1f3da07d7f4");
  if (store) {
    store.status = status || store.status;
  }

  const updatedStatus = await store.save();
  res.json(updatedStatus);
});

const getStoreStatus = asyncHandler(async (req, res) => {
  const store = await Store.findById("66d5f56f917bb1f3da07d7f4");

  if (store) {
    res.json(store);
  }
});

module.exports = { updateStoreStatus, getStoreStatus };
