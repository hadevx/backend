# 🛒 E-Commerce Backend API

A RESTful API for a full-featured e-commerce platform built with **Node.js** and **Express.js**, backed by **MongoDB**.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Authentication | JWT (JSON Web Tokens) |
| File Uploads | Multer (local VPS storage) |
| Password Hashing | bcrypt |

---

## ✨ Features

- 🔐 **Authentication & Authorization** — JWT-based login and registration with role-based access (admin / user)
- 📦 **Product Management** — Full CRUD for products with image uploads, variants (color, size, stock), categories, and discount support
- 🛍️ **Order Management** — Create and manage orders with item snapshots, shipping address, and delivery status tracking
- 💳 **Payment Integration** — Supports PayPal and Cash on Delivery
- 🖼️ **Image Uploads** — Images stored directly on the VPS and served as static files

---

## 📁 Project Structure

```
├── config/           # Database connection
├── controllers/      # Route handler logic
├── middleware/        # Auth, error handling, upload middleware
├── models/           # Mongoose schemas (User, Product, Order, Category)
├── routes/           # Express route definitions
├── uploads/          # Locally stored product images
├── seeder/           # Database seed scripts
├── .env              # Environment variables (not committed)
└── server.js         # Entry point
```

---

## 🔧 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or remote)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/your-repo.git
cd your-repo

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=4001
MONGO_URI=mongodb://root:password@127.0.0.1:27017/ecommerce
JWT_SECRET=your_jwt_secret
BASE_URL=http://your-vps-ip:4001
PAYPAL_CLIENT_ID=your_paypal_client_id
```

### Run the Server

```bash
# Development
npm run dev

# Production
npm start
```

### Seed the Database

```bash
# Import seed data
npm run seed

# Destroy seed data
npm run seed:destroy
```

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/auth/register` | Register a new user | Public |
| POST | `/api/auth/login` | Login and get token | Public |
| GET | `/api/auth/profile` | Get current user profile | Private |

### Products
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/products` | Get all products | Public |
| GET | `/api/products/:id` | Get single product | Public |
| POST | `/api/products` | Create a product | Admin |
| PUT | `/api/products/:id` | Update a product | Admin |
| DELETE | `/api/products/:id` | Delete a product | Admin |

### Orders
| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/orders` | Create an order | Private |
| GET | `/api/orders/myorders` | Get logged-in user's orders | Private |
| GET | `/api/orders/:id` | Get order by ID | Private |
| PUT | `/api/orders/:id/pay` | Mark order as paid | Private |
| PUT | `/api/orders/:id/deliver` | Mark order as delivered | Admin |
| GET | `/api/orders` | Get all orders | Admin |

### Categories
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/categories` | Get all categories | Public |
| POST | `/api/categories` | Create a category | Admin |
| PUT | `/api/categories/:id` | Update a category | Admin |
| DELETE | `/api/categories/:id` | Delete a category | Admin |

### Uploads
| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/upload` | Upload an image | Admin |

---

## 🗄️ Data Models

### Product
- `name`, `description`, `price`, `countInStock`
- `image` — array of `{ url, publicId }`
- `category` — ref to Category
- `variants` — array of `{ color, images, sizes }`
- `discountBy`, `discountedPrice`, `hasDiscount`

### Order
- `orderItems` — snapshot of purchased products
- `shippingAddress` — `{ governorate, city, block, street, house }`
- `paymentMethod` — `PayPal` | `Cash`
- `isPaid`, `isDelivered`, `paidAt`, `deliveredAt`

### User
- `name`, `email`, `password` (hashed)
- `isAdmin` — boolean

---

## 🖼️ Image Handling

Images are uploaded via `multipart/form-data` and stored in the `/uploads` directory on the VPS. They are served as static files and referenced in the database as relative paths (e.g. `/uploads/bag.webp`).

The full URL is constructed using the `BASE_URL` environment variable:

```
http://your-vps-ip:4001/uploads/bag.webp
```

---

## 🔒 Authentication

Protected routes require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

---

## 📄 License

This project is licensed under the MIT License.
