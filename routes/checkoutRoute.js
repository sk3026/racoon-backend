const express = require("express");
const Checkout = require("../models/CheakoutItems");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const { protect } = require("../middleware/middleware");

const router = express.Router();

/* ==================================================
   CREATE CHECKOUT
   POST /api/checkout
================================================== */
router.post("/", protect, async (req, res) => {
  try {
    const {
      checkoutItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
    } = req.body;

    // ---------- validation ----------
    if (!checkoutItems || checkoutItems.length === 0) {
      return res.status(400).json({ msg: "No checkout items" });
    }

    if (!shippingAddress || !paymentMethod || !totalPrice) {
      return res.status(400).json({ msg: "Missing checkout data" });
    }

    // ---------- create checkout ----------
    const checkout = await Checkout.create({
      user: req.user._id,
      checkoutItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
      paymentStatus: "Pending",
      isPaid: false,
      isFinalized: false,
    });

    res.status(201).json(checkout);
  } catch (error) {
    console.error("CREATE CHECKOUT ERROR:", error);
    res.status(500).json({
      msg: "Server error",
      error: error.message,
    });
  }
});

/* ==================================================
   PAY CHECKOUT
   PUT /api/checkout/:id/pay
================================================== */
router.put("/:id/pay", protect, async (req, res) => {
  try {
    const checkout = await Checkout.findById(req.params.id);

    if (!checkout) {
      return res.status(404).json({ msg: "Checkout not found" });
    }

    if (req.body.paymentStatus !== "Completed") {
      return res.status(400).json({ msg: "Payment not completed" });
    }

    checkout.isPaid = true;
    checkout.paidAt = Date.now();
    checkout.paymentStatus = "Completed";
    checkout.paymentDetails = req.body.paymentDetails || {};

    await checkout.save();

    res.status(200).json(checkout);
  } catch (error) {
    console.error("PAY CHECKOUT ERROR:", error);
    res.status(500).json({
      msg: "Server error",
      error: error.message,
    });
  }
});

/* ==================================================
   FINALIZE ORDER
   POST /api/checkout/:id/finalize
================================================== */
router.post("/:id/finalize", protect, async (req, res) => {
  try {
    const checkout = await Checkout.findById(req.params.id);

    if (!checkout) {
      return res.status(404).json({ msg: "Checkout not found" });
    }

    if (!checkout.isPaid) {
      return res.status(400).json({ msg: "Checkout not paid" });
    }

    if (checkout.isFinalized) {
      return res.status(400).json({ msg: "Checkout already finalized" });
    }

    if (!checkout.checkoutItems || checkout.checkoutItems.length === 0) {
      return res.status(400).json({ msg: "Checkout has no items" });
    }

    // ---------- create order ----------
    const order = await Order.create({
      user: checkout.user,
      orderItems: checkout.checkoutItems,
      shippingAddress: checkout.shippingAddress,
      paymentMethod: checkout.paymentMethod,
      totalPrice: checkout.totalPrice,
      paymentStatus: "Paid",
      isPaid: true,
      paidAt: checkout.paidAt,
    });

    // ---------- finalize checkout ----------
    checkout.isFinalized = true;
    checkout.finalizedAt = Date.now();
    await checkout.save();

    // ---------- clear cart ----------
    await Cart.findOneAndDelete({ user: checkout.user });

    res.status(201).json(order);
  } catch (error) {
    console.error("FINALIZE ORDER ERROR:", error);
    res.status(500).json({
      msg: "Server error",
      error: error.message,
    });
  }
});

module.exports = router;
