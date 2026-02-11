const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const sharp = require("sharp");
const { protectAdmin, requireAdminRole } = require("../middleware/authMiddleware");
const uploadPath = "/app/uploads";
const categoryUploadPath = "/app/uploads/categories";
const variantUploadPath = "/app/uploads/variants";

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}
if (!fs.existsSync(categoryUploadPath)) fs.mkdirSync(categoryUploadPath, { recursive: true });
if (!fs.existsSync(variantUploadPath)) fs.mkdirSync(variantUploadPath, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => {
    const name = path.parse(file.originalname).name.replace(/\s+/g, "-").toLowerCase();

    const ext = path.extname(file.originalname);

    const filename = `${name}-${Date.now()}${ext}`;
    cb(null, filename);
  },
});

const upload = multer({ storage });

const categoryStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, categoryUploadPath),
  filename: (req, file, cb) => {
    const name = path.parse(file.originalname).name.replace(/\s+/g, "-").toLowerCase();
    const ext = path.extname(file.originalname);
    cb(null, `${name}-${Date.now()}${ext}`);
  },
});
const uploadCategory = multer({ storage: categoryStorage });

const variantsStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, variantUploadPath),
  filename: (req, file, cb) => {
    const name = path.parse(file.originalname).name.replace(/\s+/g, "-").toLowerCase();
    const ext = path.extname(file.originalname);
    cb(null, `${name}-${Date.now()}${ext}`);
  },
});
const uploadVariant = multer({ storage: variantsStorage });

router.post(
  "/",
  /* protectAdmin, requireAdminRole, */ upload.array("images", 3),
  async (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    try {
      const optimizedFiles = [];

      for (const file of req.files) {
        const optimizedName = `optimized-${file.filename}.webp`;
        const outputPath = path.join(uploadPath, optimizedName);

        await sharp(file.path).resize({ width: 800 }).webp({ quality: 80 }).toFile(outputPath);

        fs.unlinkSync(file.path);

        const fullUrl = `${req.protocol}://${req.get("host")}/uploads/${optimizedName}`;
        optimizedFiles.push({
          imageUrl: fullUrl,
          publicId: optimizedName,
        });
      }

      res.json({
        message: "Images uploaded and optimized",
        images: optimizedFiles,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Image processing failed", error: err.message });
    }
  },
);

router.post(
  "/category",
  /*  protectAdmin,
  requireAdminRole, */
  uploadCategory.single("image"),
  async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    try {
      const optimizedName = `optimized-${req.file.filename}.webp`;
      const outputPath = path.join(categoryUploadPath, optimizedName);

      await sharp(req.file.path).resize({ width: 800 }).webp({ quality: 80 }).toFile(outputPath);

      fs.unlinkSync(req.file.path);

      res.json({
        message: "Category image uploaded",
        image: {
          imageUrl: `${req.protocol}://${req.get("host")}/uploads/categories/${optimizedName}`,
          publicId: optimizedName,
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Image processing failed", error: err.message });
    }
  },
);

router.post(
  "/variant",
  /* protectAdmin,
  requireAdminRole, */
  uploadVariant.array("images", 5),
  async (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    try {
      const optimizedFiles = [];

      for (const file of req.files) {
        const optimizedName = `optimized-${file.filename}.webp`;
        const outputPath = path.join(variantUploadPath, optimizedName);

        await sharp(file.path).resize({ width: 800 }).webp({ quality: 80 }).toFile(outputPath);

        fs.unlinkSync(file.path);

        const fullUrl = `${req.protocol}://${req.get("host")}/uploads/variants/${optimizedName}`;
        optimizedFiles.push({
          imageUrl: fullUrl,
          publicId: optimizedName,
        });
      }

      res.json({
        message: "Variant images uploaded",
        images: optimizedFiles,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Variant image upload failed", error: err.message });
    }
  },
);
module.exports = router;
