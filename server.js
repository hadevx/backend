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

// Database connection
dbConnect();

// Intialize express app
const app = express();

// CORS
app.use(
  cors({
    origin: "http://localhost:3000",
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
app.use("/api/upload", uploadRoutes);

app.get("/api/config/paypal", (req, res) => res.send({ clientId: process.env.PAYPAL_CLIENT_ID }));

/* const __dirname = path.resolve(); */
app.use("/uploads", express.static(path.join(__dirname, "./uploads")));

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API intialized");
    console.log(req.path);
  });
}
// Error handlers
app.use(notFound);
app.use(errorHandle);

app.listen(process.env.PORT || 8000, (req, res) => {
  console.log("Listening on port " + process.env.PORT);
});
