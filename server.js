const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/Db");

const userRoutes = require("./routes/userRoute");
const productRoutes = require("./routes/productRoute");
const cartRoutes = require("./routes/cartRoutes");
const checkoutRoutes = require("./routes/checkoutRoute"); 
const orderRoutes = require("./routes/orderRoute");
const uploadRoutes = require("./routes/uploadRoute");
const subscribeRoutes = require("./routes/subscribeRoute");
const adminRoutes = require("./routes/adminRoute"); 
const productAdminRoutes = require("./routes/productAdminRoute");
const adminOrderRoutes = require("./routes/adminOrderRoutes");   

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// DB Connection
connectDB();

const PORT = process.env.PORT || 3000;

// Root
app.get("/", (req, res) => {
  res.send("Welcome to Racoon API");
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/subscribe", subscribeRoutes);
app.use("/api/admin/products", productAdminRoutes); 


//admin route
app.use("/api/admin/users", adminRoutes);
app.use("/api/admin/orders", adminOrderRoutes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
