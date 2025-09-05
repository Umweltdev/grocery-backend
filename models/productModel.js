const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
  {
    star: Number,
    comment: String,
    postedby: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
    },
    description: {
      type: String,
    },
    isFeatured: { type: Boolean, default: false },
    published: { type: Boolean, default: false  },
    reStock: { type: Boolean, default: false  },
    regularPrice: {
      type: Number,
      required: true,
    },
    salePrice: {
      type: Number,
    },
    stock: {
      type: Number,
    },
    sold: {
      type: Number,
      default: 0,
    },
    tags: [
      {
        type: String,
      },
    ],
    published: {
      type: Boolean,
      default: false,
    },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },
    images: [
      {
        public_id: String,
        url: String,
      },
    ],
    ratings: [
      {
        star: Number,
        comment: String,
        postedby: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      }
    ],
    totalrating: {
      type: Number,
      default: 0,
    },
    totalstar: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);
// productSchema.index({ slug: 1 }, { unique: true });

module.exports = mongoose.model("Product", productSchema);
