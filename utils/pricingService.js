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

      const Order = require("../models/orderModel");
      const orders = await Order.find({ orderBy: userId, isPaid: true });
      
      const totalProductsPurchased = orders.reduce((total, order) => {
        return total + order.products.reduce((sum, item) => sum + item.count, 0);
      }, 0);
      
      const totalSpent = orders.reduce((total, order) => total + order.totalPrice, 0);
      const totalOrders = orders.length;

      const { rcd } = config;

      if (totalSpent < rcd.thresholds.minimumSpend || totalOrders < rcd.thresholds.minimumVisits) {
        return 0;
      }

      const spendFactor = Math.min(totalSpent / 10000, 1);
      const productFactor = Math.min(totalProductsPurchased / 50, 1);

      const discount = (rcd.maxDiscount * (spendFactor * rcd.spendWeight + productFactor * (1 / rcd.spendWeight))) / 2;
      
      return Math.min(discount, rcd.maxDiscount);
    } catch (error) {
      console.error("Error calculating RCD discount:", error);
      return 0;
    }
  }

  static async calculateProductPricing(basePrice, userId = null) {
    try {
      const mcdMultiplier = await this.getMCDMultiplier();
      const mcdPrice = basePrice * mcdMultiplier;
      
      let rcdDiscount = 0;
      let rcdPrice = mcdPrice;
      
      if (userId) {
        rcdDiscount = await this.getRCDDiscount(userId);
        rcdPrice = mcdPrice * (1 - rcdDiscount / 100);
      }

      return {
        basePrice: Math.round(basePrice * 100) / 100,
        mcdPrice: Math.round(mcdPrice * 100) / 100,
        rcdPrice: Math.round(rcdPrice * 100) / 100,
        finalPrice: Math.round(rcdPrice * 100) / 100,
        rcdDiscount: Math.round(rcdDiscount * 100) / 100,
        mcdMultiplier: Math.round(mcdMultiplier * 10000) / 10000
      };
    } catch (error) {
      console.error("Error calculating product pricing:", error);
      return {
        basePrice: Math.round(basePrice * 100) / 100,
        mcdPrice: Math.round(basePrice * 100) / 100,
        rcdPrice: Math.round(basePrice * 100) / 100,
        finalPrice: Math.round(basePrice * 100) / 100,
        rcdDiscount: 0,
        mcdMultiplier: 1.0
      };
    }
  }

  static async calculateFinalPrice(basePrice, userId = null) {
    const pricing = await this.calculateProductPricing(basePrice, userId);
    return {
      basePrice: pricing.basePrice,
      mcdPrice: pricing.mcdPrice,
      finalPrice: pricing.finalPrice,
      discount: pricing.rcdDiscount,
      mcdMultiplier: pricing.mcdMultiplier
    };
  }
}

module.exports = PricingService;