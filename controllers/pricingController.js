const PricingConfig = require("../models/pricingConfigModel");
const MarketingSpend = require("../models/marketingSpendModel");
const PricingService = require("../utils/pricingService");
const asyncHandler = require("express-async-handler");

const getPricingConfig = asyncHandler(async (req, res) => {
  try {
    let config = await PricingConfig.findOne().sort({ createdAt: -1 });
    if (!config) {
      config = await PricingConfig.create({
        mcd: {
          enabled: true,
          updateFrequency: "daily",
          sensitivityCoefficient: 1.0,
          maxPriceIncrease: 0.15,
          smoothingFactor: 0.3,
          minimumSpendThreshold: 100,
        },
        rcd: {
          enabled: true,
          maxDiscount: 20,
          spendWeight: 2.0,
          thresholds: { minimumSpend: 50, minimumVisits: 2 },
        },
      });
    }
    res.json(config);
  } catch (error) {
    console.error('Error getting pricing config:', error);
    res.status(500).json({ error: error.message });
  }
});

const updatePricingConfig = asyncHandler(async (req, res) => {
  try {
    let config = await PricingConfig.findOne();
    if (config) {
      Object.assign(config, req.body);
      await config.save();
    } else {
      config = await PricingConfig.create(req.body);
    }
    res.json(config);
  } catch (error) {
    console.error('Error updating pricing config:', error);
    res.status(500).json({ error: error.message });
  }
});

const addMarketingSpend = asyncHandler(async (req, res) => {
  try {
    const { totalSpend, byPlatform } = req.body;
    const today = new Date();
    
    const existingSpend = await MarketingSpend.findOne({
      date: {
        $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
      }
    });

    if (existingSpend) {
      existingSpend.totalSpend = totalSpend;
      existingSpend.byPlatform = byPlatform;
      await existingSpend.save();
      res.json(existingSpend);
    } else {
      const newSpend = await MarketingSpend.create({
        totalSpend,
        byPlatform
      });
      res.json(newSpend);
    }
  } catch (error) {
    throw new Error(error);
  }
});

const getProductPricing = asyncHandler(async (req, res) => {
  try {
    const { basePrice } = req.body;
    const userId = req.user?._id;
    
    const pricing = await PricingService.calculateFinalPrice(basePrice, userId);
    res.json(pricing);
  } catch (error) {
    throw new Error(error);
  }
});

const getAnalytics = asyncHandler(async (req, res) => {
  try {
    const config = await PricingConfig.findOne().sort({ createdAt: -1 });
    const mcdMultiplier = await PricingService.getMCDMultiplier();
    
    const today = new Date();
    const marketingData = await MarketingSpend.findOne({
      date: {
        $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
      }
    });
    
    res.json({
      config: config || {},
      currentMCDMultiplier: mcdMultiplier,
      marketingSpend: marketingData?.totalSpend || 0,
      marketingByPlatform: marketingData?.byPlatform || {}
    });
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  getPricingConfig,
  updatePricingConfig,
  addMarketingSpend,
  getProductPricing,
  getAnalytics,
};