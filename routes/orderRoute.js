const express = require("express");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const { protect } = require("../middleware/middleware");

const router = express.Router();

/* ==================================================
   GET LOGGED-IN USER ORDERS
   GET /api/orders/my-orders
   Private
================================================== */
router.get("/my-orders", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(orders);
  } catch (error) {
    console.error("GET USER ORDERS ERROR:", error);
    res.status(500).json({
      msg: "Server error",
      error: error.message,
    });
  }
});

/* ==================================================
   GET ORDER BY ID
   GET /api/orders/:id
   Private (OWNER ONLY)
================================================== */
router.get("/:id", protect, async (req, res) => {
  try {
    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ msg: "Invalid order ID" });
    }

    const order = await Order.findById(req.params.id)
      .populate("user", "name email");

    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }

    // ✅ Authorization: only owner can view
    if (order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: "Not authorized to view this order" });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("GET ORDER BY ID ERROR:", error);
    res.status(500).json({
      msg: "Server error",
      error: error.message,
    });
  }
});

module.exports = router;
