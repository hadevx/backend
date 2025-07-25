const dotenv = require("dotenv");
const users = require("./data/users.js"); //dummy data
const products = require("./data/products.js"); //dummy data
const addresses = require("./data/addresses.js"); //dummy data
const User = require("./models/userModel.js");
const Product = require("./models/productModel.js");
const Order = require("./models/orderModel.js");
const Address = require("./models/addressModel.js");
const dbConnect = require("./config/db.js");

dotenv.config();
dbConnect();

const seedData = async () => {
  try {
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
    await Address.deleteMany();

    const createdUsers = await User.insertMany(users);
    const adminUser = createdUsers[0]._id;
    const sampleProducts = products.map((product) => {
      return { ...product, user: adminUser };
    });

    await Product.insertMany(sampleProducts);
    await Address.insertMany(addresses);
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

    console.log("Data destroyed");
    process.exit();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

if (process.argv[2] === "-d") {
  destroyData();
} else {
  seedData();
}
