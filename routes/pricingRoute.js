const express = require("express");
const {
  getPricingConfig,
  updatePricingConfig,
  addMarketingSpend,
  getProductPricing,
  getAnalytics,
} = require("../controllers/pricingController");
const { authMiddleware, isAdmin } = require("../middlewares/auth");
const router = express.Router();

const { getUserStats } = require("../controllers/userStatsController");

router.get("/config", authMiddleware, getPricingConfig);
router.put("/config", authMiddleware, updatePricingConfig);
router.post("/marketing-spend", authMiddleware, addMarketingSpend);
router.post("/calculate", authMiddleware, getProductPricing);
router.get("/analytics", authMiddleware, getAnalytics);
router.get("/user-stats", authMiddleware, getUserStats);

module.exports = router;