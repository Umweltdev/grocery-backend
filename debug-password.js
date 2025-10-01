const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('./models/userModel');
require('dotenv').config();

async function debugPassword() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO);
    console.log('Connected to database');

    // Get user email/phone to test
    const emailOrPhone = process.argv[2];
    const testPassword = process.argv[3];

    if (!emailOrPhone || !testPassword) {
      console.log('Usage: node debug-password.js <email_or_phone> <password>');
      process.exit(1);
    }

    // Find user
    const user = await User.findOne({
      $or: [{ email: emailOrPhone.toLowerCase() }, { phone: emailOrPhone }],
    });

    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }

    console.log('✅ User found:', user.email);
    console.log('📧 Email:', user.email);
    console.log('📱 Phone:', user.phone);
    console.log('🔒 Stored hash (first 20 chars):', user.password.substring(0, 20) + '...');
    console.log('🔑 Test password length:', testPassword.length);
    console.log('🔑 Test password (first 10 chars):', testPassword.substring(0, 10) + '...');

    // Test password comparison
    const isMatch = await bcrypt.compare(testPassword, user.password);
    console.log('🔍 Password match result:', isMatch);

    // Test with trimmed password
    const trimmedPassword = testPassword.trim();
    const isMatchTrimmed = await bcrypt.compare(trimmedPassword, user.password);
    console.log('🔍 Trimmed password match:', isMatchTrimmed);

    // Test manual hash generation
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(testPassword, salt);
    console.log('🆕 New hash would be:', newHash.substring(0, 20) + '...');

    mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    mongoose.disconnect();
  }
}

debugPassword();