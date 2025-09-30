const express = require("express");
const { calculateDelivery } = require("../controllers/deliveryController");
const { authMiddleware } = require("../middlewares/auth");

const router = express.Router();

router.post("/calculate", authMiddleware, calculateDelivery);

module.exports = router;