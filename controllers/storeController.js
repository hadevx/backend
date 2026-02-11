const asyncHandler = require("../middleware/asyncHandler");
const Store = require("../models/storeModel");

// helper: normalize social links
const normalizeSocial = (value, baseUrl) => {
  if (!value) return "";

  let v = value.trim();

  // already a full URL
  if (v.startsWith("http://") || v.startsWith("https://")) {
    return v;
  }

  // remove @ if exists
  if (v.startsWith("@")) {
    v = v.slice(1);
  }

  return `${baseUrl}/${v}`;
};

const updateStoreStatus = asyncHandler(async (req, res) => {
  const {
    status,
    storeName,
    email,
    banner,
    phoneNumber,
    instagram,
    twitter,
    tiktok,
    cashOnDeliveryEnabled,
  } = req.body;

  let store = await Store.findOne({});

  // ✅ If store doc doesn't exist yet, create one
  if (!store) {
    store = new Store({});
  }

  // --------------------
  // ✅ BASIC INFO
  // --------------------
  if (status !== undefined) store.status = status;

  if (storeName !== undefined) {
    store.storeName = storeName.trim();
  }

  if (email !== undefined) {
    store.email = email.trim().toLowerCase();
  }

  if (banner !== undefined) {
    store.banner = banner.trim();
  }

  // --------------------
  // ✅ CONTACT INFO
  // --------------------
  if (phoneNumber !== undefined) {
    store.phoneNumber = phoneNumber.trim();
  }

  // --------------------
  // ✅ SOCIAL LINKS
  // --------------------
  if (instagram !== undefined) {
    store.instagram = normalizeSocial(instagram, "https://instagram.com");
  }

  if (twitter !== undefined) {
    store.twitter = normalizeSocial(twitter, "https://x.com");
  }

  if (tiktok !== undefined) {
    store.tiktok = normalizeSocial(tiktok, "https://www.tiktok.com/@");
  }

  // --------------------
  // ✅ CHECKOUT OPTIONS
  // --------------------
  if (cashOnDeliveryEnabled !== undefined) {
    store.cashOnDeliveryEnabled = Boolean(cashOnDeliveryEnabled);
  }

  const updatedStore = await store.save();

  res.status(200).json(updatedStore);
});

const getStoreStatus = asyncHandler(async (req, res) => {
  const store = await Store.find({}).sort({ createdAt: -1 });

  res.status(200).json(store);
});

module.exports = {
  updateStoreStatus,
  getStoreStatus,
};
