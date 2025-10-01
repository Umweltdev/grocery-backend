const asyncHandler = require("express-async-handler");
const { calculateDeliveryFee } = require("../utils/deliveryCalculator");
const Address = require("../models/addressModel");

const calculateDelivery = asyncHandler(async (req, res) => {
  const { destinationAddressId } = req.body;
  const { _id } = req.user;

  try {
    // Get collection point address (you might want to set this as an environment variable or in your database)
    const ORIGIN_ADDRESS = process.env.STORE_ADDRESS || "Unit 18 Catford Broadway, London SE9 3QN";
    
    // Get destination address
    const destinationAddressDoc = await Address.findOne({ 
      _id: destinationAddressId, 
      createdBy: _id 
    });
    
    if (!destinationAddressDoc) {
      return res.status(404).json({ message: "Destination address not found" });
    }

    // Format destination address
    const destinationAddress = `${destinationAddressDoc.address}, ${destinationAddressDoc.state}, ${destinationAddressDoc.country}`;

    // Calculate delivery fee
    const deliveryInfo = await calculateDeliveryFee(ORIGIN_ADDRESS, destinationAddress);

    res.json({
      success: true,
      deliveryInfo,
      destinationAddress: destinationAddressDoc
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = {
  calculateDelivery
};