const mongoose = require("mongoose"); 

var addressSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    lowercase: true,
  },
  address: {
    type: String,
    required: true,
    lowercase: true,
  },
  state: {
    type: String,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  postal: {
    type: Number

  },
  country: {
    type: String,
    lowercase: true,
  },
  type: {
    type: String,
    enum: ['user', 'collection','billing'],
    default: 'user'
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("Address", addressSchema);
