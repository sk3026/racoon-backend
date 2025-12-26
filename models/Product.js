const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    discountPrice: {
        type: Number,
    },
    images: {
        url: {
            type: [String],
            required: true,
        },
        altText: {
            type: String,
        }
    },
    category: {
        type: String,
        required: true,
    },
    countInStock: {
        type: Number,
        required: true,
        min: 0
    },
    sku: {
        type: String,
        required: true,
        unique: true,
    },
    brand: {
        type: String,
    },
   size: {
        type: [String],  // Changed from String to [String]
        required: true,
    },
    colors: {
        type: [String],
        required: true,
    },
    collectionType: {
        type: String,
        required: true,
    },
    material: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        enum: ["male", "female", "unisex"]
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    isPublished: {
        type: Boolean,
        default: false,
    },
    rating: {
        type: Number,
        default: 0,
    },
    numReviews: {
        type: Number,
        default: 0,
    },
    tags: {
        type: [String],  
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        
    },
    metaDescription: {
        type: String,
    },
    metaKeywords: {
        type: [String],  
    },
    dimensions: {
        height: Number,
        width: Number,
        length: Number,
    },
    weight: {
        type: Number,
    }
}, {
    timestamps: true
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;