const mongoose = require('mongoose');

const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.MONGO, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ssl: true, // important when SSL is required
    });

    console.log("✅ Database Connected Successfully");
  } catch (error) {
    console.error("Database connection error:", error.message);
    process.exit(1); // stop the app if DB fails
  }
};

module.exports = dbConnect;
