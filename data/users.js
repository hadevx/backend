const bcrypt = require("bcrypt");

const users = [
  {
    name: "Admin",
    email: "admin@admin.com",
    password: bcrypt.hashSync("12345", 10),
    phone: "55443322",
    isAdmin: true,
  },
  {
    name: "John Doe",
    email: "john.doe@example.com",
    password: bcrypt.hashSync("12345", 10),
    phone: "55443322",
    isAdmin: false,
  },
  {
    name: "Jane Smith",
    email: "jane.smith@example.com",
    password: bcrypt.hashSync("12345", 10),
    phone: "55443322",
    isAdmin: false,
  },
  {
    name: "Alice Johnson",
    email: "alice.johnson@example.com",
    password: bcrypt.hashSync("12345", 10),
    phone: "55443322",
    isAdmin: false,
  },
  {
    name: "Bob Brown",
    email: "bob.brown@example.com",
    password: bcrypt.hashSync("12345", 10),
    phone: "55443322",
    isAdmin: false,
  },
  {
    name: "Charlie Davis",
    email: "charlie.davis@example.com",
    password: bcrypt.hashSync("12345", 10),
    phone: "55443322",
    isAdmin: false,
  },
  {
    name: "Diana Evans",
    email: "diana.evans@example.com",
    password: bcrypt.hashSync("12345", 10),
    phone: "55443322",
    isAdmin: false,
  },
  {
    name: "Edward Green",
    email: "edward.green@example.com",
    password: bcrypt.hashSync("12345", 10),
    phone: "55443322",
    isAdmin: false,
  },
  {
    name: "Fiona Harris",
    email: "fiona.harris@example.com",
    password: bcrypt.hashSync("12345", 10),
    phone: "55443322",
    isAdmin: false,
  },
  {
    name: "George King",
    email: "george.king@example.com",
    password: bcrypt.hashSync("12345", 10),
    phone: "55443322",
    isAdmin: false,
  },
  {
    name: "Hannah Lewis",
    email: "hannah.lewis@example.com",
    password: bcrypt.hashSync("12345", 10),
    phone: "55443322",
    isAdmin: false,
  },
];

module.exports = users;
