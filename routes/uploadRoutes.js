const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

const router = express.Router();

// Make sure uploads folder exists inside container
const uploadPath = "/app/uploads";
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Multer disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => {
    // Save file with timestamp + original extension
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Upload route
router.post("/", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  // Return the path to access the file
  res.json({
    message: "Image uploaded",
    imageUrl: `/uploads/${req.file.filename}`, // frontend can use this URL
    filename: req.file.filename, // save this in DB if needed
  });
});

module.exports = router;

/* 
// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Upload route
router.post("/", upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  const streamUpload = (reqFile) => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "your-folder-name" },
        (error, result) => {
          if (result) resolve(result);
          else reject(error);
        }
      );
      streamifier.createReadStream(reqFile.buffer).pipe(stream);
    });
  };

  try {
    const result = await streamUpload(req.file);

    res.json({
      message: "Image uploaded",
      image: result.secure_url, // the URL to display
      publicId: result.public_id, // save this in DB when product is created
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; */

/* const path = require("path");
const express = require("express");
const multer = require("multer");

const router = express.Router();

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
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  const mimetype = filetypes.test(file.mimetype);
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb("Image only!");
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

router.post("/", upload.single("image"), (req, res) => {
  res.send({
    message: "Image uploaded",
    image: `http://localhost:4001/uploads/${req.file.filename}`,
  });
});

module.exports = router;
 */
