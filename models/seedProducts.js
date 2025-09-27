const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("./productModel"); // Adjust path if needed

// Load environment variables
dotenv.config();


 const categoryMap = {
  "Fruits & Vegetables": new mongoose.Types.ObjectId("60d5ecb3b4d3f2a1d9c8b7a1"),
  "Dairy & Eggs": new mongoose.Types.ObjectId("60d5ecb3b4d3f2a1d9c8b7a2"),
  Beverages: new mongoose.Types.ObjectId("60d5ecb3b4d3f2a1d9c8b7a3"),
  Snacks: new mongoose.Types.ObjectId("60d5ecb3b4d3f2a1d9c8b7a4"),
  "Household Essentials": new mongoose.Types.ObjectId(
    "60d5ecb3b4d3f2a1d9c8b7a5"
  ),
  "Personal Care": new mongoose.Types.ObjectId("60d5ecb3b4d3f2a1d9c8b7a6"),
  Bakery: new mongoose.Types.ObjectId("60d5ecb3b4d3f2a1d9c8b7a7"),
  "Meat & Seafood": new mongoose.Types.ObjectId("60d5ecb3b4d3f2a1d9c8b7a8"),
  "Pantry Staples": new mongoose.Types.ObjectId("60d5ecb3b4d3f2a1d9c8b7a9"),
  "Frozen Foods": new mongoose.Types.ObjectId("60d5ecb3b4d3f2a1d9c8b7aa"), // New Category
  "Cleaning Supplies": new mongoose.Types.ObjectId("60d5ecb3b4d3f2a1d9c8b7ab"), // New Category
};

// A completely new set of 12 products
const products = [
  {
    productId: "VEG-CAR-009",
    slug: "organic-carrots-1lb",
    name: "Organic Carrots (1lb Bag)",
    description: "A 1lb bag of crisp, sweet organic carrots. Perfect for snacking, roasting, or salads.",
    images: [{ url: "https://lh3.googleusercontent.com/gg-dl/AJfQ9KSSA2IevBUwK9RkYiVTIbLug2zAVqEJYsbh8Ao8AVvS6Qq9t8-OdZKLfwHRgQNnjrVIivb415Kb895FtfG1gptd_WxZnnujeULvSwdVSTYikYzT9BQRRaGaKpwl0NCxh5BzIznfUqaxdKK3efA5bCaudj8kv9I6rV_lGggvpKuJ3sKgew=s1024", public_id: "organic-carrots" }],
    regularPrice: 2.99,
    stock: 180,
    totalstar: 4.8,
    category: categoryMap["Fruits & Vegetables"],
  },
  {
    productId: "VEG-BRO-010",
    slug: "broccoli-crown",
    name: "Broccoli Crown",
    description: "A fresh, vibrant green broccoli crown, packed with vitamins and ready for steaming or stir-frying.",
    images: [{ url: "https://lh3.googleusercontent.com/gg-dl/AJfQ9KQgqCccf53y-7bkUeh-Qnb3AQ362f7tAg3mXhQgOIyEyuXoJhJoRPFhMXbvBTKUTjzaj_7Go_Cih82DX5npsblKddNjPLVt0yLm50yCCkPAM_wz47QTDDwiJTkUlSI5sFjG9zoyClOpJXu8PGcaThd_kOXlSxda5TjI1EjMxIdyN-JDNg=s1024", public_id: "broccoli-crown" }],
    regularPrice: 2.49,
    salePrice: 1.99,
    stock: 110,
    totalstar: 4.7,
    category: categoryMap["Fruits & Vegetables"],
  },

  {
    productId: "BEV-OJU-011",
    slug: "orange-juice-1-5l",
    name: "Orange Juice (1.5L)",
    description: "1.5L of pure, not-from-concentrate orange juice. A refreshing start to any day.",
    images: [{ url: "https://lh3.googleusercontent.com/gg-dl/AJfQ9KTfbwUAr0QslydQbGu_mscBNdzMm6V3_r5b67MJGe5zvCaxwVG6ikaddwl-c8_xOLEThMo7Y6WFP8i_4_s2ItBhYp6FFCPnlwbVUxhRLeT0O8ukvRdigSuwMMGIwZqMqct8USYE2kwA3CLI_TMy2ngRQwLrQ2nfhr3L4Y6AQJQglhnPAQ=s1024", public_id: "orange-juice" }],
    regularPrice: 5.49,
    stock: 90,
    totalstar: 4.6,
    category: categoryMap["Beverages"],
  },

  {
    productId: "PAN-SAU-012",
    slug: "marinara-pasta-sauce",
    name: "Marinara Pasta Sauce",
    description: "A classic marinara sauce made from vine-ripened tomatoes and Italian herbs. Jar size: 24oz.",
    images: [{ url: "https://lh3.googleusercontent.com/gg-dl/AJfQ9KQAM8Qu0uTz7EU29EnX8cxJDfBjBIR2NxWonBCwlAKPahdqMHLU7XvdpfQpBxGKMXVaVFVl9QOxxoz04duYsjgecGv3ijGE9RgsJx234bTrLlsYQO-61PffyGENXnDfahcGBFHpSKsB9ze-Rty_QdDSClJV_JU9bbXVIKwEdtWPMOFe=s1024", public_id: "marinara-sauce" }],
    regularPrice: 4.29,
    salePrice: 3.79,
    stock: 200,
    totalstar: 4.5,
    category: categoryMap["Pantry Staples"],
  },
  {
    productId: "PAN-TUN-013",
    slug: "canned-tuna-in-oil",
    name: "Canned Tuna in Olive Oil",
    description: "Solid light tuna packed in olive oil for a rich flavor. Perfect for salads and sandwiches.",
    images: [{ url: "https://lh3.googleusercontent.com/gg-dl/AJfQ9KTRSJvWETsI_kHA_V8zAbSvDQrEko9R9Xr5vVTd8GN5aZZHLNRUC-pds_PbweTvOYa-Bnpx1knOsaLb_VTRmqI3I7MItPJWukxHC15uBnGPUcC01ojie6mva_YUcRdXZod1gOW2pBaZmHTp3MpzX5JY1frok_yRlWwdZBk1euKh-RMdbg=s1024", public_id: "canned-tuna" }],
    regularPrice: 2.79,
    stock: 300,
    totalstar: 4.4,
    category: categoryMap["Pantry Staples"],
  },

  // --- NEW MEAT ITEM ---
  {
    productId: "MEA-BEE-014",
    slug: "lean-ground-beef-1lb",
    name: "Lean Ground Beef (1lb)",
    description: "1lb of 90/10 lean ground beef, versatile and flavorful for burgers, tacos, or pasta sauce.",
    images: [{ url: "https://lh3.googleusercontent.com/gg-dl/AJfQ9KQlbj9Atj6TmHByMeaMQ6BMsmu-iPh6vdrfxhQ8NXfM0-78oIAgIJE8vkzQ71gjJ9BReT70f2Bb6iQBX8Sx1K1pS62WPDcJacwKbcMwm57yiA4sm9BHUTmhFmpH77s6iYIB_f2Wb5vQx02oolfkR8KJvT8YhkHesYA4ob1SHMiv4LbBkQ=s1024", public_id: "ground-beef" }],
    regularPrice: 7.99,
    stock: 60,
    totalstar: 4.8,
    category: categoryMap["Meat & Seafood"],
  },

  {
    productId: "BAK-BAG-015",
    slug: "fresh-baguette",
    name: "Fresh Baguette",
    description: "A crusty, freshly baked French baguette with a soft, airy interior. Baked daily.",
    images: [{ url: "https://lh3.googleusercontent.com/gg/AAHar4eiKjRYmD8NRSpJi0JNY92D4MiSGYgXhKIBFtIeEOBfoXYb5T95YDWXI4qtvtfoI5XfBzCQr0nQFomO21hZG7qCyttM78ETsuc1i39zMslh-hoxvAeMELCu8wcY5c1dpW8kn4f5ehiZoWyOXV1GrShB173d-wrCIJGv8p-m7-gjNYiiV1eiWNZr91PfWA9e_BLtNTmTAeZ1748YJKqq4eVuEpPLGz4OZsJlW_r8gZL5ytjJoTi1bXF9V0Rj2dC9kWikmeSmi9lOos2osVJoe85Hy8atJKoOKvzDzeeW3apaPCKvPpz5ysYcd9U3mqFrmdgx6Ie2CfLZ12LNdCQPgkK1=s1024", public_id: "fresh-baguette" }],
    regularPrice: 3.49,
    stock: 85,
    totalstar: 4.9,
    category: categoryMap["Bakery"],
  },

  // --- NEW FROZEN FOODS ---
  {
    productId: "FRO-PIZ-016",
    slug: "pepperoni-frozen-pizza",
    name: "Pepperoni Frozen Pizza",
    description: "A classic pepperoni pizza with a crispy crust, ready to bake for a quick and delicious meal.",
    images: [{ url: "https://lh3.googleusercontent.com/gg-dl/AJfQ9KQpKd5TshwljmDkfhEjkaIzvTApSdTIulB4AX3S-Oltcu7YyeiTDzFzKd-_OmZGGu-bgh7B5N9JRxCYKhji9S-Ek6qyB9zcQloH9eqW-lRkEW6WiUX2gM1rLUndcSsSC_PwijueiQ6amdrsTYnpYnR3eNnMRi9udfTvuBX8xuX7gpKDlw=s1024", public_id: "frozen-pizza" }],
    regularPrice: 8.99,
    salePrice: 7.49,
    stock: 100,
    totalstar: 4.2,
    category: categoryMap["Frozen Foods"],
  },
  {
    productId: "FRO-BER-017",
    slug: "mixed-berry-blend-frozen",
    name: "Mixed Berry Blend (Frozen)",
    description: "A blend of frozen strawberries, blueberries, and raspberries. Perfect for smoothies.",
    images: [{ url: "https://lh3.googleusercontent.com/gg-dl/AJfQ9KRRIPvhpAMIBzkALLw3fr8d42KfdJUlPSijom7RVgm_fNK3ANi3hoqTqGOHGAqyIgCf-GlXAGrjCI_VwVrrpONE8AM8I7sezdD9XTuZQBx6BZTZzCBbf4I56zfbDMk1R57b16c-Ctn9zrJVt2Lj4-GPWP827RLfjzXCVd73jCQRRTCT2A=s1024", public_id: "frozen-berries" }],
    regularPrice: 9.99,
    stock: 120,
    totalstar: 4.9,
    category: categoryMap["Frozen Foods"],
  },

  {
    productId: "CLE-ALL-018",
    slug: "all-purpose-cleaner-lemon",
    name: "All-Purpose Cleaner (Lemon Scent)",
    description: "A powerful all-purpose cleaner that cuts through grease and grime, leaving a fresh lemon scent.",
    images: [{ url: "https://lh3.googleusercontent.com/gg-dl/AJfQ9KQ9RqfR3ScjLnTPGo7BRQz2IYEszbT1giGDuBNhMFdUkxXbIkZt2E8u30qpCfTAXp_SUTL9M5ucgm1T5Ix4Jdkqutrg9Vs_cALVnbsrh3KrmPxyLvuhbH2ThEc750DQjuYrpZkutCViEBiSjXAFtaiyjGRv5uJNhMyvRZaL7jjGBmB1Aw=s1024", public_id: "all-purpose-cleaner" }],
    regularPrice: 4.99,
    stock: 150,
    totalstar: 4.7,
    category: categoryMap["Cleaning Supplies"],
  },

  {
    productId: "DAI-YOG-019",
    slug: "greek-yogurt-plain",
    name: "Greek Yogurt (Plain)",
    description: "Thick and creamy plain Greek yogurt, high in protein. A healthy base for breakfast or snacks.",
    images: [{ url: "https://lh3.googleusercontent.com/gg-dl/AJfQ9KQbeV0vwCDzftjFw4O3VQkazZuq_9kJjVUF6NsjXCDrTVAKJRwSszW5MMBxyZRXjnZlYiJtz_84qobQP3ZJ_jUXqu7XmyunSYa4RhCauO_BjAGX14lp3Rghbkooo1Osgz4TebA4aMnMifcCeqWpkUSbKY_65fyUa9uF6fsEcxK77P7dZQ=s1024", public_id: "greek-yogurt" }],
    regularPrice: 5.99,
    stock: 95,
    totalstar: 4.6,
    category: categoryMap["Dairy & Eggs"],
  },
  {
    productId: "SNA-GRA-020",
    slug: "granola-bars-variety-pack",
    name: "Granola Bars (Variety Pack)",
    description: "A variety pack of 12 chewy granola bars, with flavors like Oats & Honey and Peanut Butter.",
    images: [{ url: "https://lh3.googleusercontent.com/gg-dl/AJfQ9KTfvF1uWULXTC0YD8zafZfusV7i8FGw1yOUdAxOYey0GVgPPnMkQNSzjQ5U2cleESlor9gRa2Eo1rcRvolHORR8zVyrYQeIKal64NUQ_76GpSzWbHQDqRzy8F4bTKXK1tanlLlvlMa1s7p8GKluy1jcZhgPJT-G1NCbjVfiPwsIHn-v=s1024", public_id: "granola-bars" }],
    regularPrice: 8.49,
    salePrice: 7.99,
    stock: 130,
    totalstar: 4.5,
    category: categoryMap["Snacks"],
  },
];
const seedDB = async () => {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(
      process.env.MONGO_URI ||
        "mongodb+srv://admin-Riliwan:Z8copJruYyqRIEWN@cluster0.zchdj.mongodb.net/romax-grocery-store?retryWrites=true&w=majority&appName=Cluster0"
    );
    console.log("✅ Connected to DB");

    // 2. Clear existing product data
    // await Product.deleteMany({});
    // console.log("Existing products cleared.");

    // 3. Insert the new product data
    await Product.insertMany(products);
    console.log("🌱 Product data has been seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    // 4. Disconnect from DB
    mongoose.connection.close();
    console.log("MongoDB connection closed.");
  }
};

// Run the seeding function
seedDB();