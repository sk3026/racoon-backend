const express = require("express");
const User = require("../models/User");
const { protect, admin } = require("../middleware/middleware");

const router = express.Router();

/* ------------------------------------
   GET ALL USERS (ADMIN)
   GET /api/admin/users
------------------------------------ */
router.get("/", protect, admin, async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.status(200).json(users);
  } catch (error) {
    console.error("GET ALL USERS ERROR:", error);
    res.status(500).json({
      msg: "Server error",
      error: error.message,
    });
  }
});

/* ------------------------------------
   CREATE USER (ADMIN)
   POST /api/admin/users
------------------------------------ */
router.post("/", protect, admin, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        msg: "Name, email and password are required",
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || "customer", // admin can set role
    });

    res.status(201).json({
      msg: "User created successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("CREATE USER ERROR:", error);
    res.status(500).json({
      msg: "Server error",
      error: error.message,
    });
  }
});

//@route PUT /api/admin/users/:id
//@desc update user info(admin-only)
//@access Private/Admin
/* ------------------------------------
   UPDATE USER (ADMIN)
   PUT /api/admin/users/:id
------------------------------------ */
router.put("/:id", protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;

    const updatedUser = await user.save();

    res.status(200).json({
      msg: "User updated successfully",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error("UPDATE USER ERROR:", error);
    res.status(500).json({
      msg: "Server error",
      error: error.message,
    });
  }
});
//@route   DELETE /api/admin/users/:id
//@desc    Delete user (admin only)
//@access  Private/Admin
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        msg: "Admin cannot delete own account",
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      msg: "User removed successfully",
    });
  } catch (error) {
    console.error("DELETE USER ERROR:", error);
    res.status(500).json({
      msg: "Server error",
      error: error.message,
    });
  }
});


module.exports = router;
