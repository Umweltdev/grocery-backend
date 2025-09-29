// seedCategories.js
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const Category = require("./categoryModel");

// All categories (first batch + new 9)
const categories = [
  {
    categoryId: uuidv4(),
    name: "Electronics",
    image: { url: "https://picsum.photos/300/200?random=1", public_id: "electronics" },
    level: 1,
  },
  {
    categoryId: uuidv4(),
    name: "Fashion",
    image: { url: "https://picsum.photos/300/200?random=2", public_id: "fashion" },
    level: 1,
  },
  {
    categoryId: uuidv4(),
    name: "Groceries",
    image: { url: "https://picsum.photos/300/200?random=3", public_id: "groceries" },
    level: 1,
  },
  {
    categoryId: uuidv4(),
    name: "Home & Living",
    image: { url: "https://picsum.photos/300/200?random=4", public_id: "home" },
    level: 1,
  },
  {
    categoryId: uuidv4(),
    name: "Sports",
    image: { url: "https://picsum.photos/300/200?random=5", public_id: "sports" },
    level: 1,
  },
  {
    categoryId: uuidv4(),
    name: "Books",
    image: { url: "https://picsum.photos/300/200?random=6", public_id: "books" },
    level: 1,
  },
  {
    categoryId: uuidv4(),
    name: "Beauty & Personal Care",
    image: { url: "https://picsum.photos/300/200?random=7", public_id: "beauty" },
    level: 1,
  },
  {
    categoryId: uuidv4(),
    name: "Toys & Games",
    image: { url: "https://picsum.photos/300/200?random=8", public_id: "toys" },
    level: 1,
  },
  {
    categoryId: uuidv4(),
    name: "Automotive",
    image: { url: "https://picsum.photos/300/200?random=9", public_id: "automotive" },
    level: 1,
  },
  // extra 9 categories
  {
    categoryId: uuidv4(),
    name: "Bakery",
    image: { url: "https://picsum.photos/300/200?random=10", public_id: "bakery" },
    level: 1,
  },
  {
    categoryId: uuidv4(),
    name: "Condiments",
    image: { url: "https://picsum.photos/300/200?random=11", public_id: "condiments" },
    level: 1,
  },
  {
    categoryId: uuidv4(),
    name: "Health & Wellness",
    image: { url: "https://picsum.photos/300/200?random=12", public_id: "health" },
    level: 1,
  },
  {
    categoryId: uuidv4(),
    name: "Breakfast Items",
    image: { url: "https://picsum.photos/300/200?random=13", public_id: "breakfast" },
    level: 1,
  },
  {
    categoryId: uuidv4(),
    name: "Herbs & Spices",
    image: { url: "https://picsum.photos/300/200?random=14", public_id: "spices" },
    level: 1,
  },
  {
    categoryId: uuidv4(),
    name: "Nuts & Seeds",
    image: { url: "https://picsum.photos/300/200?random=15", public_id: "nuts" },
    level: 1,
  },
  {
    categoryId: uuidv4(),
    name: "Ready-to-Eat",
    image: { url: "https://picsum.photos/300/200?random=16", public_id: "ready" },
    level: 1,
  },
  {
    categoryId: uuidv4(),
    name: "Sauces & Dressings",
    image: { url: "https://picsum.photos/300/200?random=17", public_id: "sauces" },
    level: 1,
  },
  {
    categoryId: uuidv4(),
    name: "Beverage Mixes",
    image: { url: "https://picsum.photos/300/200?random=18", public_id: "mixes" },
    level: 1,
  },
];

async function seed() {
  try {
    await mongoose.connect(
  "mongodb+srv://admin-Riliwan:Z8copJruYyqRIEWN@cluster0.zchdj.mongodb.net/romax-grocery-store?retryWrites=true&w=majority&appName=Cluster0",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

    console.log("✅ Connected to DB");

    // Clean collection
    await Category.deleteMany({});
    console.log("🧹 Categories cleared");

    // Insert all
    await Category.insertMany(categories);
    console.log("🌱 Categories seeded successfully!");
  } catch (err) {
    console.error("❌ Error seeding categories:", err);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
