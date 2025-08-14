const mongoose = require("mongoose");

const dotenv = require("dotenv");
dotenv.config();
const dbConnect = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://hkosaimi:12345Hussain@cluster0.q8b7yys.mongodb.net/ecomm"
    );
  } catch (error) {
    console.log(`Data Base Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = dbConnect;
