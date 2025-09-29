const mongoose = require("mongoose");

var cardSchema = new mongoose.Schema({
  paymentMethodId: {
    type: String,
    required: true,
  },
  customerId: {
    type: String,
  },
  last4: {
    type: String,
  },
  brand: {
    type: String,
    enum: ["visa", "mastercard", "amex", "discover", "diners", "jcb", "unionpay"],
  },
  expMonth: {
    type: Number,
  },
  expYear: {
    type: Number,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
},
{ timestamps: true });

// cardSchema.virtual('formattedCardNumber').get(function() {
//     // Replace all but the last 4 digits with asterisks
//     const lastFourDigits = this.cardNumber.slice(-4);
//     const maskedDigits = '*'.repeat(this.cardNumber.length - 4);
//     return maskedDigits + lastFourDigits;
//   });

module.exports = mongoose.model("Card", cardSchema);
