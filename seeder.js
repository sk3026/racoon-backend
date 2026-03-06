const mongoose = require("mongoose");
const Product = require("./models/Product");

mongoose.connect("mongodb://localhost:27017/ecommerce");

const products = [
  {
    name: "Stylish Jacket",
    price: 120,
    description: "Fashion leather jacket",
    images: [{ url: "https://picsum.photos/500/500?random=11" }],
    isNewArrival: true
  },
  {
    name: "Casual Hoodie",
    price: 90,
    description: "Comfortable hoodie",
    images: [{ url: "https://picsum.photos/500/500?random=12" }],
    isNewArrival: true
  },
  {
    name: "Running Shoes",
    price: 150,
    description: "Lightweight running shoes",
    images: [{ url: "https://picsum.photos/500/500?random=13" }],
    isNewArrival: true
  }
];

const seedProducts = async () => {
  try {
    await Product.deleteMany(); // optional
    await Product.insertMany(products);

    console.log("Products seeded successfully");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedProducts();