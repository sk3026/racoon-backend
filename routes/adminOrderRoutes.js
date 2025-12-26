const express = require("express");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const { protect, admin } = require("../middleware/middleware");

const router = express.Router();

const ALLOWED_STATUSES = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

/**
 * GET /api/admin/orders
 * Get all orders (Admin)
 */
router.get("/", protect, admin, async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({})
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalOrders = await Order.countDocuments();

    res.status(200).json({
      orders,
      page,
      pages: Math.ceil(totalOrders / limit),
      totalOrders,
    });
  } catch (error) {
    console.error("GET ALL ORDERS ERROR:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

/**
 * PUT /api/admin/orders/:id
 * Update order status
 */
router.put("/:id", protect, admin, async (req, res) => {
  try {
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ msg: "Invalid order ID" });
    }

    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        msg: "Invalid status",
        allowed: ALLOWED_STATUSES,
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }

    order.status = status;

    if (status === "Delivered") {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      order.isCancelled = false;
    }

    if (status === "Cancelled") {
      order.isCancelled = true;
      order.isDelivered = false;
    }

    const updatedOrder = await order.save();
    res.status(200).json(updatedOrder);

  } catch (error) {
    console.error("UPDATE ORDER ERROR:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

/**
 * DELETE /api/admin/orders/:id
 * (Optional – learning only)
 */
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ msg: "Invalid order ID" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }

    await order.deleteOne();
    res.status(200).json({ msg: "Order deleted successfully" });

  } catch (error) {
    console.error("DELETE ORDER ERROR:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

module.exports = router;
