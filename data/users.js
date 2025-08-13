const bcrypt = require("bcrypt");

const users = [
  {
    name: "Admin",
    email: "admin@admin.com",
    password: bcrypt.hashSync("12345", 10),
    phone: "51237845",
    isAdmin: true,
  },
  {
    name: "John Doe",
    email: "john.doe@example.com",
    password: bcrypt.hashSync("12345", 10),
    phone: "56473219",
    isAdmin: false,
  },
  {
    name: "Jane Smith",
    email: "jane.smith@example.com",
    password: bcrypt.hashSync("12345", 10),
    phone: "59821476",
    isAdmin: false,
  },
  {
    name: "Alice Johnson",
    email: "alice.johnson@example.com",
    password: bcrypt.hashSync("12345", 10),
    phone: "54327689",
    isAdmin: false,
  },
  {
    name: "Bob Brown",
    email: "bob.brown@example.com",
    password: bcrypt.hashSync("12345", 10),
    phone: "57649382",
    isAdmin: false,
  },
  {
    name: "Charlie Davis",
    email: "charlie.davis@example.com",
    password: bcrypt.hashSync("12345", 10),
    phone: "53219847",
    isAdmin: false,
  },
  {
    name: "Diana Evans",
    email: "diana.evans@example.com",
    password: bcrypt.hashSync("12345", 10),
    phone: "54781234",
    isAdmin: false,
  },
  {
    name: "Edward Green",
    email: "edward.green@example.com",
    password: bcrypt.hashSync("12345", 10),
    phone: "59038476",
    isAdmin: false,
  },
  {
    name: "Fiona Harris",
    email: "fiona.harris@example.com",
    password: bcrypt.hashSync("12345", 10),
    phone: "52179463",
    isAdmin: false,
  },
  {
    name: "George King",
    email: "george.king@example.com",
    password: bcrypt.hashSync("12345", 10),
    phone: "58713429",
    isAdmin: false,
  },
  {
    name: "Hannah Lewis",
    email: "hannah.lewis@example.com",
    password: bcrypt.hashSync("12345", 10),
    phone: "55672819",
    isAdmin: false,
  },
];

module.exports = users;
