const User = require("../models/userModel");
const Order = require("../models/orderModel");
const asyncHandler = require("express-async-handler");

const getUserStats = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    
    const orders = await Order.find({ orderBy: userId, isPaid: true });
    
    const totalProductsPurchased = orders.reduce((total, order) => {
      return total + order.products.reduce((sum, item) => sum + item.count, 0);
    }, 0);
    
    const totalSpent = orders.reduce((total, order) => total + order.totalPrice, 0);
    const totalOrders = orders.length;
    
    res.json({
      totalProductsPurchased,
      totalSpent,
      totalOrders,
      userId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = {
  getUserStats,
};