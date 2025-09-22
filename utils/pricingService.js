const PricingConfig = require("../models/pricingConfigModel");
const MarketingSpend = require("../models/marketingSpendModel");
const User = require("../models/userModel");

class PricingService {
  static async getMCDMultiplier() {
    try {
      const config = await PricingConfig.findOne().sort({ createdAt: -1 });
      if (!config || !config.mcd.enabled) return 1.0;

      const today = new Date();
      const marketingData = await MarketingSpend.findOne({
        date: {
          $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
          $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
        }
      });

      if (!marketingData || marketingData.totalSpend < config.mcd.minimumSpendThreshold) {
        return 1.0;
      }

      let multiplier = 1 + (0.05 * config.mcd.sensitivityCoefficient);
      return Math.min(multiplier, 1 + config.mcd.maxPriceIncrease);
    } catch (error) {
      console.error("Error calculating MCD multiplier:", error);
      return 1.0;
    }
  }

  static async getRCDDiscount(userId) {
    try {
      const config = await PricingConfig.findOne().sort({ createdAt: -1 });
      if (!config || !config.rcd.enabled) return 0;

      const user = await User.findById(userId);
      if (!user) return 0;

      const { totalSpend, totalVisits } = user;
      const { rcd } = config;

      if (totalSpend < rcd.thresholds.minimumSpend || totalVisits < rcd.thresholds.minimumVisits) {
        return 0;
      }

      const spendFactor = Math.min(totalSpend / 1000, 1);
      const visitFactor = Math.min(totalVisits / 20, 1);

      const discount = (rcd.maxDiscount * (spendFactor * rcd.spendWeight + visitFactor * (1 / rcd.spendWeight))) / 2;
      
      return Math.min(discount, rcd.maxDiscount);
    } catch (error) {
      console.error("Error calculating RCD discount:", error);
      return 0;
    }
  }

  static async calculateFinalPrice(basePrice, userId = null) {
    try {
      const mcdMultiplier = await this.getMCDMultiplier();
      const mcdPrice = basePrice * mcdMultiplier;

      if (!userId) {
        return {
          basePrice,
          mcdPrice: Math.round(mcdPrice * 100) / 100,
          finalPrice: Math.round(mcdPrice * 100) / 100,
          discount: 0,
          mcdMultiplier
        };
      }

      const rcdDiscount = await this.getRCDDiscount(userId);
      const finalPrice = mcdPrice * (1 - rcdDiscount / 100);

      return {
        basePrice,
        mcdPrice: Math.round(mcdPrice * 100) / 100,
        finalPrice: Math.round(finalPrice * 100) / 100,
        discount: rcdDiscount,
        mcdMultiplier
      };
    } catch (error) {
      console.error("Error calculating final price:", error);
      return {
        basePrice,
        mcdPrice: basePrice,
        finalPrice: basePrice,
        discount: 0,
        mcdMultiplier: 1.0
      };
    }
  }
}

module.exports = PricingService;