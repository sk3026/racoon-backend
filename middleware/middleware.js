const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Middleware to protect routes by verifying JWT token
 */
const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // Extract token
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user to request object (excluding password)
      req.user = await User.findById(decoded.id).select("-password");
      //                              ^^^^^^^^^^^ FIXED

      if (!req.user) {
        return res.status(401).json({ msg: "User not found" });
      }

      return next();
    } catch (err) {
      console.error("JWT Error:", err);

      // Differentiate expired token vs invalid token
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ msg: "Token expired" });
      } else if (err.name === "JsonWebTokenError") {
        return res.status(401).json({ msg: "Invalid token" });
      }

      return res.status(401).json({ msg: "Not authorized" });
    }
  } else {
    // No token provided
    return res.status(401).json({ msg: "Not authorized, no token" });
  }
};

//middleware to cheack admin

const admin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        return res.status(403).json({ msg: "Forbidden, admin access only" });
    }
};

module.exports = { protect, admin };
