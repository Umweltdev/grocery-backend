const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function fixPasswordDirect() {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log('Connected to database');

    const plainPassword = 'anthonyJ5';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    
    console.log('New hash generated:', hashedPassword.substring(0, 20) + '...');
    
    // Test the new hash
    const testResult = await bcrypt.compare(plainPassword, hashedPassword);
    console.log('Hash test result:', testResult);
    
    if (testResult) {
      // Update directly in database
      const result = await mongoose.connection.db.collection('users').updateOne(
        { email: 'valentine@umweltdev.com' },
        { $set: { password: hashedPassword } }
      );
      
      console.log('Database update result:', result);
      console.log('Password fixed successfully!');
    } else {
      console.log('Hash generation failed');
    }

    mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    mongoose.disconnect();
  }
}

fixPasswordDirect();