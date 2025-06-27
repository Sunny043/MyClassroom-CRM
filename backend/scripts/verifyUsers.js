const mongoose = require('mongoose');
const { db } = require('../database/db');
const User = require('../models/User');
const Branch = require('../models/Branch');

async function verifyUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(db);
    console.log('Connected to MongoDB');

    // Get all users
    const users = await User.find({}).populate('branchId', 'name code');
    console.log('\n📋 All Users in Database:');
    console.log('========================');

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.role.toUpperCase()}: ${user.fullName}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Email: ${user.email}`);
      if (user.branchId) {
        console.log(`   Branch: ${user.branchId.name} (${user.branchId.code})`);
      }
      console.log('   ---');
    });

    // Get all branches
    const branches = await Branch.find({});
    console.log('\n🏢 All Branches in Database:');
    console.log('============================');

    branches.forEach((branch, index) => {
      console.log(`${index + 1}. ${branch.name} (${branch.code})`);
      console.log(`   HOD: ${branch.hodName}`);
      console.log(`   Sections: ${branch.sections.map(s => s.name).join(', ')}`);
      console.log(`   Coordinator Username: ${branch.coordinatorCredentials?.username || 'Not set'}`);
      console.log('   ---');
    });

    console.log(`\n✅ Total Users: ${users.length}`);
    console.log(`✅ Total Branches: ${branches.length}`);
    console.log(`✅ Admins: ${users.filter(u => u.role === 'admin').length}`);
    console.log(`✅ Coordinators: ${users.filter(u => u.role === 'coordinator').length}`);

  } catch (error) {
    console.error('❌ Error verifying users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the verification
verifyUsers();
