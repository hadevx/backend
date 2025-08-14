const mongoose = require("mongoose");

const dotenv = require("dotenv");
dotenv.config();
const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });
  } catch (error) {
    console.log(`Data Base Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = dbConnect;
