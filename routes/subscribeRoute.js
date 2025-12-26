const express = require("express");
const router = express.Router();
const Subscriber = require("../models/subscriber");

// POST /api/subscribe
router.post("/", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ msg: "Please provide a valid email" });
  }

  try {
    const existing = await Subscriber.findOne({ email });
    if (existing) {
      return res.status(400).json({ msg: "Email is already subscribed" });
    }

    await Subscriber.create({ email });
    res.status(201).json({ msg: "Subscribed successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
