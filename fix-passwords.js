const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/userModel');
require('dotenv').config();

async function fixPasswords() {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log('Connected to database');

    // Get the specific user
    const user = await User.findOne({ email: 'valentine@umweltdev.com' });
    
    if (!user) {
      console.log('User not found');
      return;
    }

    console.log('Found user:', user.email);
    console.log('Current password hash:', user.password.substring(0, 20) + '...');

    // Set the password directly (this will trigger the pre-save hook to hash it properly)
    const plainPassword = 'anthonyJ5'; // Your actual password
    
    // Temporarily disable the pre-save hook to set password directly
    user.password = await bcrypt.hash(plainPassword, 10);
    await user.save({ validateBeforeSave: false });

    console.log('Password fixed for user:', user.email);
    console.log('New password hash:', user.password.substring(0, 20) + '...');

    // Test the password
    const isMatch = await bcrypt.compare(plainPassword, user.password);
    console.log('Password test result:', isMatch);

    mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    mongoose.disconnect();
  }
}

fixPasswords();