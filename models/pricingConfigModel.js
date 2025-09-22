const mongoose = require("mongoose");

const pricingConfigSchema = new mongoose.Schema(
  {
    mcd: {
      enabled: { type: Boolean, default: true },
      updateFrequency: { type: String, default: "daily" },
      sensitivityCoefficient: { type: Number, default: 1.0 },
      maxPriceIncrease: { type: Number, default: 0.15 },
      smoothingFactor: { type: Number, default: 0.3 },
      minimumSpendThreshold: { type: Number, default: 100 },
    },
    rcd: {
      enabled: { type: Boolean, default: true },
      maxDiscount: { type: Number, default: 20 },
      spendWeight: { type: Number, default: 2.0 },
      thresholds: {
        minimumSpend: { type: Number, default: 50 },
        minimumVisits: { type: Number, default: 2 },
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PricingConfig", pricingConfigSchema);