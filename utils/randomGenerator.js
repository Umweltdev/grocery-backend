const crypto = require("crypto");


const generateRandomHex = () => {
  const buffer = crypto.randomBytes(4);
  return "#" + buffer.toString("hex");
}

module.exports = generateRandomHex;
