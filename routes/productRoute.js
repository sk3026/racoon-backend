const express = require("express");
const Product = require("../models/Product");
const { protect, admin } = require("../middleware/middleware");

const router = express.Router();

// -----------------------------------
// CREATE PRODUCT (Admin Only)
// -----------------------------------
router.post("/", protect, admin, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      discountPrice,
      images,
      category,
      countInStock,
      sku,
      brand,
      size,
      colors,
      collectionType,
      material,
      gender,
    } = req.body;

    if (!name || !price || !category) {
      return res
        .status(400)
        .json({ message: "Name, price and category are required" });
    }

    const product = new Product({
      name,
      description,
      price,
      discountPrice,
      images,
      category,
      countInStock,
      sku,
      brand,
      size,
      colors,
      collectionType,
      material,
      gender,
      user: req.user._id,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// -----------------------------------
// UPDATE PRODUCT (Admin Only)
// -----------------------------------
router.put("/:id", protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const allowedUpdates = [
      "name",
      "description",
      "price",
      "discountPrice",
      "images",
      "category",
      "countInStock",
      "sku",
      "brand",
      "size",
      "colors",
      "collectionType",
      "material",
      "gender",
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    const updatedProduct = await product.save();
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// -----------------------------------
// DELETE PRODUCT (Admin Only)
// -----------------------------------
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.deleteOne();
    res.status(200).json({ message: "Product removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// -----------------------------------
// GET ALL PRODUCTS (Public)
// -----------------------------------
router.get("/", async (req, res) => {
  try {
    const {
      collection,
      size,
      color,
      gender,
      minPrice,
      maxPrice,
      sortBy,
      category,
      material,
      brand,
      limit,
      search,
    } = req.query;

    let query = {};

    // Filters
    if (collection && collection !== "all")
      query.collectionType = collection;

    if (category && category !== "all")
      query.category = category;

    if (material) query.material = { $in: material.split(",") };
    if (brand) query.brand = { $in: brand.split(",") };
    if (size) query.size = { $in: size.split(",") };
    if (color) query.colors = { $in: color.split(",") };
    if (gender) query.gender = gender;

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Sorting
    let sort = {};
    if (sortBy === "price") sort.price = 1;
    else if (sortBy === "price_desc") sort.price = -1;
    else if (sortBy === "latest") sort.createdAt = -1;

    const products = await Product.find(query)
      .sort(sort)
      .limit(limit ? Number(limit) : 0);

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// -----------------------------------
// GET SIMILAR PRODUCTS (Public)
// -----------------------------------
router.get("/similar/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const similarProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
    }).limit(4);

    res.json({ products: similarProducts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get("/best-seller", async (req, res) => {
  try {
    const bestSellers = await Product.find({})
      .sort({ sold: -1 })
      .limit(5);

    res.status(200).json(bestSellers);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

router.get("/new-arrivals", async (req, res) => {
  try {
    const newArrivals = await Product.find({})
      .sort({ createdAt: -1 })
      .limit(5);
    res.status(200).json(newArrivals);
  } catch (error) {
    res.status(500).json({  
      message: "Server error",
      error: error.message,
    });
  }

});
// -----------------------------------
// GET PRODUCT BY ID (Public)
// -----------------------------------
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});



 
    





module.exports = router;
