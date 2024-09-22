const path = require("path");
const express = require("express");
const multer = require("multer");

const router = express.Router();

console.log(path.join(__dirname, "../uploads"));

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png/;
  const extname = filetypes.test(path.extname(file.originalname)).toLowerCase();
  const mimetype = filetypes.test(file.mimetype);
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb("Image only!");
  }
}

const upload = multer({ storage });

router.post("/", upload.single("image"), (req, res) => {
  res.send({
    message: "Image uploaded",
    image: `http://localhost:4001/uploads/${req.file.filename}`,
  });
});

module.exports = router;
