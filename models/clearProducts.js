// clearProducts.js
const mongoose = require("mongoose");
const Product = require("./productModel"); // adjust path if in ./models/productModel.js

const MONGO_URI =
  "mongodb+srv://admin-Riliwan:Z8copJruYyqRIEWN@cluster0.zchdj.mongodb.net/romax-grocery-store?retryWrites=true&w=majority&appName=Cluster0";

async function clearProducts() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Connected to DB");

    // Delete all products (wipes what you seeded)
     const res = await Product.deleteMany({
      productId: { $regex: /^(VEG|BEV|PAN|MEA|BAK|FRO|CLE|DAI|SNA)-.*-(009|010|011|012|013|014|015|016|017|018|019|020)$/ },
    });
    console.log(`🧹 Removed ${res.deletedCount} old products (009–020)`);

    await mongoose.disconnect();
    console.log("🔌 Disconnected from DB");
  } catch (err) {
    console.error("❌ Error clearing products:", err);
  }
}

clearProducts();
