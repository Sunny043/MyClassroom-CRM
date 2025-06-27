const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
  testStudentData();
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

const Student = require('./models/Student');
const Branch = require('./models/Branch');

async function testStudentData() {
  try {
    const students = await Student.find().populate('branchId').limit(5);
    console.log(`Found ${students.length} students in database`);
    
    if (students.length > 0) {
      console.log('\nSample student data:');
      students.forEach((student, index) => {
        console.log(`${index + 1}. Name: ${student.firstName} ${student.lastName}`);
        console.log(`   Email: ${student.email}`);
        console.log(`   Roll No: ${student.rollNo}`);
        console.log(`   Branch: ${student.branchId ? student.branchId.name : 'No branch'}`);
        console.log(`   Section: ${student.sectionName}`);
        console.log('---');
      });
    } else {
      console.log('No students found in database. Please run the seed script first.');
    }
    
  } catch (error) {
    console.error('Error fetching students:', error);
  } finally {
    mongoose.connection.close();
  }
}
