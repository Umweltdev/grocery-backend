const mongoose = require("mongoose"); 

var brandSchema = new mongoose.Schema(
  {
    brandId: {
      type: String,
      required: true,
      unique: true,
    },
    name: { type: String, required: true, unique: true, index: true },
    image: { type: String },
    isFeatured: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Brand", brandSchema);
