// routes/userRoute.js

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middleware/middleware");  

const router = express.Router();

// Utility: generate JWT with sanity check
const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT secret missing");
  return jwt.sign({ id: userId }, secret, { expiresIn: "30d" });
};

// POST /api/users/register
// - Validates inputs
// - Normalizes email
// - Relies on schema pre-save hook to hash password
// - Handles duplicate key errors (E11000)
router.post("/register", async (req, res) => {
  try {
    let { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ msg: "Name, email, and password are required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // Existence check
    const existing = await User.findOne({ email: normalizedEmail }).lean();
    if (existing) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // IMPORTANT: do not hash here if the schema hashes in a pre('save') hook
    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.error("Register Error:", err);
    if (err && err.code === 11000) {
      return res.status(400).json({ msg: "Email already in use" });
    }
    if (err.message === "JWT secret missing") {
      return res.status(500).json({ msg: "Server config error" });
    }
    return res.status(500).json({ msg: "Server error" });
  }
});

// POST /api/users/login
// - Normalizes email
// - Selects password explicitly if schema uses select:false
// - Compares with bcrypt and returns JWT
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = String(email || "").trim().toLowerCase();

    // If password is select:false in schema, '+password' forces inclusion
    const user = await User.findOne({ email: normalizedEmail }).select(
      "+password"
    );
    if (!user) {
      return res.status(400).json({ msg: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid email or password" });
    }

    const token = generateToken(user._id);

    // Never return password
    return res.status(200).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
});

router.get("/profile", protect,async (req, res) => {
  res.json(req.user);

});

module.exports = router;
