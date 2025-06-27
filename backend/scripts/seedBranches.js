const mongoose = require('mongoose');
const { db } = require('../database/db');
const Branch = require('../models/Branch');

const branches = [
  {
    name: "Computer Science",
    code: "CSE",
    description: "Computer Science and Engineering"
  },
  {
    name: "Data Science",
    code: "DS",
    description: "Data Science and Analytics"
  },
  {
    name: "Data Analytics",
    code: "DA",
    description: "Data Analytics and Business Intelligence"
  },
  {
    name: "Artificial Intelligence and Machine Learning",
    code: "AIML",
    description: "AI/ML and Deep Learning"
  },
  {
    name: "Cognitive Systems",
    code: "CSCS",
    description: "Cognitive Systems and Computing"
  }
];

const seedBranches = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(db);
    console.log('Connected to MongoDB');

    // Clear existing branches
    await Branch.deleteMany({});
    console.log('Cleared existing branches');

    // Insert new branches
    const result = await Branch.insertMany(branches);
    console.log(`${result.length} branches created successfully`);

    // Print the created branches
    result.forEach(branch => {
      console.log(`- ${branch.code}: ${branch.name}`);
    });

  } catch (error) {
    console.error('Error seeding branches:', error);
  } finally {
    // Close the connection
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

if (require.main === module) {
  seedBranches();
}

module.exports = seedBranches;
