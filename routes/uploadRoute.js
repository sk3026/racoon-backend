const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const { protect } = require("../middleware/middleware");

require("dotenv").config();

/* ------------------------------------
   Cloudinary Config
------------------------------------ */
cloudinary.config({
  cloud_name: process.env.Cloudinary_Cloud_Name,
  api_key: process.env.Cloudinary_API_Key,
  api_secret: process.env.Cloudinary_API_Secret,
});

/* ------------------------------------
   Multer Setup (Memory Storage)
------------------------------------ */
const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

/* ------------------------------------
   Upload Image
   POST /api/upload
------------------------------------ */
router.post("/", protect, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: "No file uploaded" });
    }

    const uploadToCloudinary = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "uploads" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });

    const result = await uploadToCloudinary();

    res.status(200).json({
      imageUrl: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error("FILE UPLOAD ERROR:", error);
    res.status(500).json({
      msg: "Server error",
      error: error.message,
    });
  }
});

module.exports = router;
