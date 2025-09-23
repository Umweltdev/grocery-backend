const mongoose = require("mongoose");

const marketingSpendSchema = new mongoose.Schema(
  {
    date: { type: Date, default: Date.now },
    totalSpend: { type: Number, required: true },
    byPlatform: {
      Google: { amount: { type: Number, default: 0 } },
      Facebook: { amount: { type: Number, default: 0 } },
      Instagram: { amount: { type: Number, default: 0 } },
      Twitter: { amount: { type: Number, default: 0 } },
      Other: { amount: { type: Number, default: 0 } },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MarketingSpend", marketingSpendSchema);