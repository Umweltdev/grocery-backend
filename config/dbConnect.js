const mongoose = require('mongoose');

const dbConnect =  () => {
  try {
    mongoose.connect(process.env.MONGO);

    console.log("Database Connected Successfully");
  } catch (error) {
    console.log("Database error:", error);
  }
};

module.exports = dbConnect;

