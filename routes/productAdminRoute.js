const express = require("express");
const Product = require("../models/Product");
const { protect, admin } = require("../middleware/middleware");

const router = express.Router();

//@route   GET /api/admin/products
//@desc    Get all products (admin)
//@access  Private/Admin
router.get("/", protect, admin, async (req, res) => {
  try {
    const products = await Product.find({});    
    res.status(200).json(products);
  }
    catch (error) {
    console.error("GET ALL PRODUCTS ERROR:", error);
    res.status(500).json({
      msg: "Server error",
      error: error.message,
    });
  }
});

module.exports = router;