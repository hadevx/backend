const dotenv = require("dotenv");
const users = require("./data/users.js"); //dummy data
const products = require("./data/products.js"); //dummy data
const addresses = require("./data/addresses.js"); //dummy data
const orders = require("./data/orders.js"); //dummy data
const categories = require("./data/categories.js");

const User = require("./models/userModel.js");
const Product = require("./models/productModel.js");
const Order = require("./models/orderModel.js");
const Address = require("./models/addressModel.js");
const Delivery = require("./models/deliveryModel.js");
const Discount = require("./models/discountModel.js");
const Store = require("./models/storeModel.js");
const Category = require("./models/categoryModel.js");

const dbConnect = require("./config/db.js");

dotenv.config();
dbConnect();

const seedData = async () => {
  try {
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
    await Address.deleteMany();
    await Delivery.deleteMany();
    await Discount.deleteMany();
    await Store.deleteMany();
    await Category.deleteMany();

    const createdUsers = await User.insertMany(users);
    const createdCategories = await Category.insertMany(categories);
    const adminUser = createdUsers[0]._id;

    const sampleProducts = products.map((product, index) => {
      return {
        ...product,
        user: adminUser,
        category: createdCategories[index % createdCategories.length]._id,
      };
    });
    const sampleOrders = orders.map((order) => {
      return { ...order, user: adminUser };
    });

    await Product.insertMany(sampleProducts);
    await Address.insertMany(addresses);
    await Order.insertMany(sampleOrders);

    await Delivery.create({ timeToDeliver: "today", shippingFee: 0, minDeliveryCost: 0 });

    await Store.create({ status: "active" });

    console.log("Data seeded");
    process.exit();
  } catch (error) {
    console.log(`${error}`);
    process.exit(1);
  }
};

const seedCustom = async () => {
  try {
    await User.create(users[0]);
    await Delivery.create({ timeToDeliver: "today", shippingFee: 0, minDeliveryCost: 0 });

    await Store.create({ status: "active" });

    console.log("Data seeded");
    process.exit();
  } catch (error) {
    console.log(`${error}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
    await Address.deleteMany();
    // await Delivery.deleteMany();
    // await Discount.deleteMany();
    // await Store.deleteMany();
    await Category.deleteMany();

    console.log("Data destroyed");
    process.exit();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

const seedProduction = async () => {
  await User.create(users[0]);
  await Delivery.create({ timeToDeliver: "today", shippingFee: 0, minDeliveryCost: 0 });
  await Store.create({ status: "active" });

  console.log("Data seeded");
};

if (process.argv[2] === "-d") {
  destroyData();
} else if (process.argv[2] === "-c") {
  seedCustom();
} else if (process.argv[2] === "-p") {
  seedProduction();
} else {
  seedData();
}
