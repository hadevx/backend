// Import
const path = require("path");
const express = require("express");
const cors = require("cors");
const dbConnect = require("./config/db.js");
const dotenv = require("dotenv");

const {
  productRoutes,
  userRoutes,
  orderRoutes,
  uploadRoutes,
  storeRoutes,
  categoryRoutes,
  paymentRoutes,
} = require("./routes/index.js");

const { notFound, errorHandle } = require("./middleware/errorMiddleware.js");
const cookieParser = require("cookie-parser");

dotenv.config();

// Intialize express app
const app = express();

// CORS
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173", "https://backend-wxs4.onrender.com"],
    credentials: true,
  })
);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser middleware
app.use(cookieParser());

// Routes http://localhost:4001
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/update-store-status", storeRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/payment", paymentRoutes);

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
