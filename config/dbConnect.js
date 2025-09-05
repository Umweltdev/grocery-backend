const mongoose = require('mongoose');

const dbConnect =  () => {
  try {
    mongoose.connect(process.env.MONGO);

    //  mongoose.connect(`mongodb://127.0.0.1/romax-ecommerce`);
    console.log("Database Connected Successfully");
  } catch (error) {
    console.log("Database error:", error);
  }
};

module.exports = dbConnect;

