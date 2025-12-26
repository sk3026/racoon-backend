const express = require("express");
const Checkout = require("../models/Cheakout"); // keep filename as-is
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const { protect } = require("../middleware/middleware");

const router = express.Router();

/* ---------------- CREATE CHECKOUT ---------------- */
router.post("/", protect, async (req, res) => {
  try {
    const { checkoutItems, shippingAddress, paymentMethod, totalPrice } = req.body;

    if (!checkoutItems || checkoutItems.length === 0) {
      return res.status(400).json({ msg: "No checkout items" });
    }

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

    return res.status(201).json(checkout);
  } catch (error) {
    return res.status(500).json({ msg: "Server error", error });
  }
});

/* ---------------- PAY CHECKOUT ---------------- */
router.put("/:id/pay", protect, async (req, res) => {
  const checkout = await Checkout.findById(req.params.id);

  if (!checkout) return res.status(404).json({ msg: "Checkout not found" });
  if (req.body.paymentStatus !== "Completed") {
    return res.status(400).json({ msg: "Payment not completed" });
  }

  checkout.isPaid = true;
  checkout.paidAt = Date.now();
  checkout.paymentStatus = "Completed";
  checkout.paymentDetails = req.body.paymentDetails;

  await checkout.save();
  res.json(checkout);
});

/* ---------------- FINALIZE ORDER ---------------- */
router.post("/:id/finalize", protect, async (req, res) => {
  const checkout = await Checkout.findById(req.params.id);

  if (!checkout) return res.status(404).json({ msg: "Checkout not found" });
  if (!checkout.isPaid) return res.status(400).json({ msg: "Checkout not paid" });
  if (checkout.isFinalized) return res.status(400).json({ msg: "Already finalized" });

  const order = await Order.create({
    user: checkout.user,
    orderItems: checkout.checkoutItems, // ✅ THIS FIXES EMPTY ARRAY
    shippingAddress: checkout.shippingAddress,
    paymentMethod: checkout.paymentMethod,
    totalPrice: checkout.totalPrice,
    paymentStatus: "Paid",
    isPaid: true,
    paidAt: checkout.paidAt,
  });

  checkout.isFinalized = true;
  checkout.finalizedAt = Date.now();
  await checkout.save();

  await Cart.findOneAndDelete({ user: req.user._id });

  res.status(201).json(order);
});

module.exports = router;
