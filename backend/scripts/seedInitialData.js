const mongoose = require('mongoose');
const { db } = require('../database/db');
const User = require('../models/User');
const Branch = require('../models/Branch');

async function seedData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(db);
    console.log('Connected to MongoDB');

    // Clear existing data (optional - be careful in production)
    // await User.deleteMany({});
    // await Branch.deleteMany({});

    // Create default admin if doesn't exist
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (!existingAdmin) {
      const admin = new User({
        username: 'admin',
        password: 'admin123',
        role: 'admin',
        fullName: 'System Administrator',
        email: 'admin@myclassroom.com'
      });
      await admin.save();
      console.log('✅ Default admin created: username=admin, password=admin123');
    } else {
      console.log('ℹ️  Admin already exists');
    }

    // Create sample branches with coordinators
    const branchesData = [
      {
        name: 'Computer Science',
        code: 'CSC',
        description: 'Computer Science and Engineering',
        hodName: 'Dr. John Smith',
        hodEmail: 'john.smith@myclassroom.com',
        coordinatorUsername: 'csc_coord',
        coordinatorPassword: 'csc123456',
        coordinatorFullName: 'Robert Johnson',
        coordinatorEmail: 'robert.johnson@myclassroom.com'
      },
      {
        name: 'Data Science',
        code: 'DS',
        description: 'Data Science and Analytics',
        hodName: 'Dr. Jane Doe',
        hodEmail: 'jane.doe@myclassroom.com',
        coordinatorUsername: 'ds_coord',
        coordinatorPassword: 'ds123456',
        coordinatorFullName: 'Sarah Wilson',
        coordinatorEmail: 'sarah.wilson@myclassroom.com'
      },
      {
        name: 'Artificial Intelligence',
        code: 'AI',
        description: 'Artificial Intelligence and Machine Learning',
        hodName: 'Dr. Alex Johnson',
        hodEmail: 'alex.johnson@myclassroom.com',
        coordinatorUsername: 'ai_coord',
        coordinatorPassword: 'ai123456',
        coordinatorFullName: 'Michael Chen',
        coordinatorEmail: 'michael.chen@myclassroom.com'
      },
      {
        name: 'Information Technology',
        code: 'IT',
        description: 'Information Technology and Systems',
        hodName: 'Dr. Maria Garcia',
        hodEmail: 'maria.garcia@myclassroom.com',
        coordinatorUsername: 'it_coord',
        coordinatorPassword: 'it123456',
        coordinatorFullName: 'Emily Rodriguez',
        coordinatorEmail: 'emily.rodriguez@myclassroom.com'
      },
      {
        name: 'Cyber Security',
        code: 'CS',
        description: 'Cyber Security and Information Assurance',
        hodName: 'Dr. David Brown',
        hodEmail: 'david.brown@myclassroom.com',
        coordinatorUsername: 'cyber_coord',
        coordinatorPassword: 'cyber123456',
        coordinatorFullName: 'Jennifer Kim',
        coordinatorEmail: 'jennifer.kim@myclassroom.com'
      },
      {
        name: 'Software Engineering',
        code: 'SE',
        description: 'Software Engineering and Development',
        hodName: 'Dr. Lisa Anderson',
        hodEmail: 'lisa.anderson@myclassroom.com',
        coordinatorUsername: 'se_coord',
        coordinatorPassword: 'se123456',
        coordinatorFullName: 'James Thompson',
        coordinatorEmail: 'james.thompson@myclassroom.com'
      },
      {
        name: 'Business Analytics',
        code: 'BA',
        description: 'Business Analytics and Intelligence',
        hodName: 'Dr. Kevin White',
        hodEmail: 'kevin.white@myclassroom.com',
        coordinatorUsername: 'ba_coord',
        coordinatorPassword: 'ba123456',
        coordinatorFullName: 'Amanda Davis',
        coordinatorEmail: 'amanda.davis@myclassroom.com'
      },
      {
        name: 'Digital Marketing',
        code: 'DM',
        description: 'Digital Marketing and E-Commerce',
        hodName: 'Dr. Rachel Green',
        hodEmail: 'rachel.green@myclassroom.com',
        coordinatorUsername: 'dm_coord',
        coordinatorPassword: 'dm123456',
        coordinatorFullName: 'Christopher Lee',
        coordinatorEmail: 'christopher.lee@myclassroom.com'
      }
    ];

    for (const branchData of branchesData) {
      // Check if branch already exists
      const existingBranch = await Branch.findOne({ 
        $or: [{ code: branchData.code }, { name: branchData.name }] 
      });
      
      if (!existingBranch) {
        // Create branch
        const branch = new Branch({
          name: branchData.name,
          code: branchData.code,
          description: branchData.description,
          hodName: branchData.hodName,
          hodEmail: branchData.hodEmail,
          coordinatorCredentials: {
            username: branchData.coordinatorUsername,
            password: branchData.coordinatorPassword
          },
          sections: [
            { name: 'A', maxCapacity: 60, currentStrength: 0, isActive: true },
            { name: 'B', maxCapacity: 60, currentStrength: 0, isActive: true }
          ]
        });
        await branch.save();

        // Create coordinator user
        const coordinator = new User({
          username: branchData.coordinatorUsername,
          password: branchData.coordinatorPassword,
          role: 'coordinator',
          branchId: branch._id,
          fullName: branchData.coordinatorFullName,
          email: branchData.coordinatorEmail
        });
        await coordinator.save();
        console.log(`✅ Created branch: ${branchData.name} with coordinator: ${branchData.coordinatorUsername}`);
      } else {
        // Update existing branch to include coordinator credentials if missing
        if (!existingBranch.coordinatorCredentials || !existingBranch.coordinatorCredentials.username) {
          existingBranch.coordinatorCredentials = {
            username: branchData.coordinatorUsername,
            password: branchData.coordinatorPassword
          };
          if (!existingBranch.sections || existingBranch.sections.length === 0) {
            existingBranch.sections = [
              { name: 'A', maxCapacity: 60, currentStrength: 0, isActive: true }
            ];
          }
          await existingBranch.save();
          
          // Create coordinator user if doesn't exist
          const existingCoordinator = await User.findOne({ username: branchData.coordinatorUsername });
          if (!existingCoordinator) {
            const coordinator = new User({
              username: branchData.coordinatorUsername,
              password: branchData.coordinatorPassword,
              role: 'coordinator',
              branchId: existingBranch._id,
              fullName: branchData.coordinatorFullName,
              email: branchData.coordinatorEmail
            });
            await coordinator.save();
            console.log(`✅ Updated existing branch: ${branchData.name} with coordinator: ${branchData.coordinatorUsername}`);
          }
        } else {
          console.log(`ℹ️  Branch ${branchData.name} already exists with coordinator`);
        }
      }
    }

    console.log('\n🎉 Seed data creation completed!');
    console.log('\n📋 Login Credentials:');
    console.log('👤 Admin: username=admin, password=admin123');
    console.log('👤 CSC Coordinator: username=csc_coord, password=csc123456');
    console.log('👤 DS Coordinator: username=ds_coord, password=ds123456');
    console.log('👤 AI Coordinator: username=ai_coord, password=ai123456');
    console.log('👤 IT Coordinator: username=it_coord, password=it123456');
    console.log('👤 Cyber Security Coordinator: username=cyber_coord, password=cyber123456');
    console.log('👤 SE Coordinator: username=se_coord, password=se123456');
    console.log('👤 BA Coordinator: username=ba_coord, password=ba123456');
    console.log('👤 DM Coordinator: username=dm_coord, password=dm123456');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the seed function
seedData();
