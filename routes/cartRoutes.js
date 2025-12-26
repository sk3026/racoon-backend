const express = require("express");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { protect } = require("../middleware/middleware"); // ✅ CORRECT PATH

const router = express.Router();

/* ------------------------------------
   Helper: get cart by userId or guestId
------------------------------------ */
const getCart = async (userId, guestId) => {
  if (userId) return await Cart.findOne({ user: userId });
  if (guestId) return await Cart.findOne({ guestId });
  return null;
};

/* ------------------------------------
   ADD TO CART
   POST /api/cart
------------------------------------ */
router.post("/", async (req, res) => {
  try {
    const { productId, quantity, size, color, guestId, userId } = req.body;

    if (!userId && !guestId) {
      return res.status(400).json({
        message: "guestId or userId is required",
      });
    }

    if (!productId || !quantity) {
      return res.status(400).json({
        message: "productId and quantity are required",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await getCart(userId, guestId);

    if (cart) {
      const index = cart.products.findIndex(
        (p) =>
          p.productId.toString() === productId &&
          p.size === size &&
          p.color === color
      );

      if (index > -1) {
        cart.products[index].quantity += quantity;
      } else {
        cart.products.push({
          productId,
          name: product.name,
          image: product.images?.[0]?.url || "",
          price: product.price,
          quantity,
          size,
          color,
        });
      }

      cart.totalPrice = cart.products.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );

      await cart.save();
      return res.status(200).json(cart);
    }

    const newCart = new Cart({
      user: userId || null,
      guestId: guestId || null,
      products: [
        {
          productId,
          name: product.name,
          image: product.images?.[0]?.url || "",
          price: product.price,
          quantity,
          size,
          color,
        },
      ],
      totalPrice: product.price * quantity,
    });

    await newCart.save();
    return res.status(201).json(newCart);

  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

/* ------------------------------------
   UPDATE CART ITEM
   PUT /api/cart
------------------------------------ */
router.put("/", async (req, res) => {
  try {
    const { productId, quantity, size, color, guestId, userId } = req.body;

    if (!userId && !guestId) {
      return res.status(400).json({
        message: "guestId or userId is required",
      });
    }

    const cart = await getCart(userId, guestId);
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const index = cart.products.findIndex(
      (p) =>
        p.productId.toString() === productId &&
        p.size === size &&
        p.color === color
    );

    if (index === -1) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    if (quantity <= 0) {
      cart.products.splice(index, 1);
    } else {
      cart.products[index].quantity = quantity;
    }

    cart.totalPrice = cart.products.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    await cart.save();
    return res.status(200).json(cart);

  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

/* ------------------------------------
   REMOVE ITEM FROM CART
   DELETE /api/cart
------------------------------------ */
router.delete("/", async (req, res) => {
  try {
    const { productId, size, color, guestId, userId } = req.body;

    if (!userId && !guestId) {
      return res.status(400).json({
        message: "guestId or userId is required",
      });
    }

    const cart = await getCart(userId, guestId);
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const index = cart.products.findIndex(
      (p) =>
        p.productId.toString() === productId &&
        p.size === size &&
        p.color === color
    );

    if (index === -1) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    cart.products.splice(index, 1);

    cart.totalPrice = cart.products.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    await cart.save();
    return res.status(200).json(cart);

  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

/* ------------------------------------
   GET CART
------------------------------------ */
router.get("/", async (req, res) => {
  try {
    const { userId, guestId } = req.query;

    if (!userId && !guestId) {
      return res.status(400).json({
        message: "userId or guestId is required",
      });
    }

    const cart = await getCart(userId, guestId);
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    return res.status(200).json(cart);

  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
});

/* ------------------------------------
   MERGE GUEST CART → USER CART
   POST /api/cart/merge
------------------------------------ */
router.post("/merge", protect, async (req, res) => {
  const { guestId } = req.body;
  const userId = req.user._id;

  try {
    if (!guestId) {
      return res.status(400).json({
        message: "guestId is required",
      });
    }

    const guestCart = await Cart.findOne({ guestId });
    const userCart = await Cart.findOne({ user: userId });

    if (!guestCart) {
      return res.status(200).json({ message: "No guest cart to merge" });
    }

    if (userCart) {
      guestCart.products.forEach((guestItem) => {
        const index = userCart.products.findIndex(
          (item) =>
            item.productId.toString() === guestItem.productId.toString() &&
            item.size === guestItem.size &&
            item.color === guestItem.color
        );

        if (index > -1) {
          userCart.products[index].quantity += guestItem.quantity;
        } else {
          userCart.products.push(guestItem);
        }
      });

      userCart.totalPrice = userCart.products.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );

      await userCart.save();
      await Cart.findByIdAndDelete(guestCart._id);

      return res.status(200).json(userCart);
    }

    guestCart.user = userId;
    guestCart.guestId = null;
    await guestCart.save();

    return res.status(200).json(guestCart);

  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
});

module.exports = router;
