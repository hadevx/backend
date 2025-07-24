// Import
const path = require("path");
const express = require("express");
const products = require("./data/products.js");
const cors = require("cors");
const dbConnect = require("./config/db.js");
require("dotenv").config();
const productRoutes = require("./routes/productRoutes.js");
const userRoutes = require("./routes/userRoutes.js");
const orderRoutes = require("./routes/orderRoutes.js");
const { notFound, errorHandle } = require("./middleware/errorMiddleware.js");
const cookieParser = require("cookie-parser");
const uploadRoutes = require("./routes/uploadRoutes.js");
const storeRoutes = require("./routes/storeRoutes.js");
// Intialize express app
const app = express();

// CORS
app.use(
  cors({
    origin: ["https://storefront-phi-nine.vercel.app", "https://frontend-commerce.vercel.app"],
    credentials: true,
  })
);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser middleware
app.use(cookieParser());

// Routes
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/update-store-status", storeRoutes);
app.use("/api/upload", uploadRoutes);

app.get("/api/config/paypal", (req, res) => res.send({ clientId: process.env.PAYPAL_CLIENT_ID }));

app.use("/uploads", express.static(path.join(__dirname, "./uploads")));
app.get("/", (req, res) => {
  res.send("API intialized");
});

// Error handlers
app.use(notFound);
app.use(errorHandle);

app.listen(process.env.PORT || 8000, (req, res) => {
  dbConnect();
  console.log("Connecting to DB & Listening on port " + process.env.PORT);
});
