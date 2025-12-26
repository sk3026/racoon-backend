const mongoose = require("mongoose");

/* ------------------------------------
   Checkout Item Schema
------------------------------------ */
const checkoutItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      default: 1,
    },
  },
  { _id: false }
);

/* ------------------------------------
   Checkout Schema
------------------------------------ */
const checkoutSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    checkoutItems: {
      type: [checkoutItemSchema],
      required: true,
    },

    shippingAddress: {
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      postalCode: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
    },

    paymentMethod: {
      type: String,
      required: true,
    },

    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },

    isPaid: {
      type: Boolean,
      default: false,
    },

    paidAt: {
      type: Date,
    },

    paymentStatus: {
      type: String,
      default: "Pending",
    },

    paymentDetails: {
      type: mongoose.Schema.Types.Mixed,
    },

    isFinalized: {
      type: Boolean,
      default: false,
    },

    finalizedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

/* ------------------------------------
   Export Model
------------------------------------ */
module.exports = mongoose.model("Checkout", checkoutSchema);
