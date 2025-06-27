const mongoose = require('mongoose');
const { db } = require('../database/db');
const User = require('../models/User');
const Branch = require('../models/Branch');

async function cleanupAndFix() {
  try {
    // Connect to MongoDB
    await mongoose.connect(db);
    console.log('Connected to MongoDB');

    // Clean up old branches that don't have proper coordinator setup
    const branchesToDelete = ['Data Analytics', 'Artificial Intelligence and Machine Learning', 'Cognitive Systems'];
    for (const branchName of branchesToDelete) {
      const result = await Branch.deleteOne({ name: branchName });
      if (result.deletedCount > 0) {
        console.log(`🗑️  Deleted old branch: ${branchName}`);
      }
    }

    // Check for missing DS coordinator
    const dsCoordinator = await User.findOne({ username: 'ds_coord' });
    if (!dsCoordinator) {
      const dsBranch = await Branch.findOne({ code: 'DS' });
      if (dsBranch) {
        const coordinator = new User({
          username: 'ds_coord',
          password: 'ds123456',
          role: 'coordinator',
          branchId: dsBranch._id,
          fullName: 'Sarah Wilson',
          email: 'sarah.wilson@myclassroom.com'
        });
        await coordinator.save();
        console.log('✅ Created missing DS coordinator');
      }
    }

    // Update branch names for consistency
    await Branch.updateOne({ code: 'CSE' }, { code: 'CSC', name: 'Computer Science' });
    console.log('✅ Updated CSE branch to CSC');

    console.log('\n🎉 Cleanup and fixes completed!');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the cleanup
cleanupAndFix();
