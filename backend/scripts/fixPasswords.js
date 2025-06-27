const mongoose = require('mongoose');
const { db } = require('../database/db');
const User = require('../models/User');

async function fixCoordinatorPasswords() {
  try {
    // Connect to MongoDB
    await mongoose.connect(db);
    console.log('Connected to MongoDB');

    // Find all coordinators
    const coordinators = await User.find({ role: 'coordinator' });
    console.log(`Found ${coordinators.length} coordinators to fix`);

    const passwordMap = {
      'csc_coord': 'csc123456',
      'ds_coord': 'ds123456',
      'ai_coord': 'ai123456',
      'it_coord': 'it123456',
      'cyber_coord': 'cyber123456',
      'se_coord': 'se123456',
      'ba_coord': 'ba123456',
      'dm_coord': 'dm123456'
    };

    for (const coordinator of coordinators) {
      const newPassword = passwordMap[coordinator.username];
      if (newPassword) {
        // Set the password and let the pre-save middleware hash it
        coordinator.password = newPassword;
        await coordinator.save();
        console.log(`✅ Fixed password for ${coordinator.username}`);
      }
    }

    console.log('\n🎉 All coordinator passwords fixed!');

    // Test one login
    const testUser = await User.findOne({ username: 'csc_coord' });
    if (testUser) {
      const isMatch = await testUser.comparePassword('csc123456');
      console.log(`🧪 Test login for csc_coord: ${isMatch ? 'SUCCESS' : 'FAILED'}`);
    }

  } catch (error) {
    console.error('❌ Error fixing passwords:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the fix
fixCoordinatorPasswords();
