const mongoose = require('mongoose');
require('dotenv').config();

const Student = require('./models/Student');
const Branch = require('./models/Branch');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log('Connected to MongoDB');
  createSampleStudents();
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

async function createSampleStudents() {
  try {
    // Get AI branch (we know it exists)
    const aiBranch = await Branch.findOne({ code: 'AI' });
    const cscBranch = await Branch.findOne({ code: 'CSC' });
    
    if (!aiBranch || !cscBranch) {
      console.log('Branches not found. Please run seed script first.');
      return;
    }

    const sampleStudents = [
      {
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice.johnson@student.edu',
        phone: '9876543210',
        dateOfBirth: new Date('2000-05-15'),
        gender: 'Female',
        address: {
          street: '123 Main St',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          country: 'India'
        },
        studentId: 'AI002',
        rollNo: '102',
        branchId: aiBranch._id,
        sectionName: 'A',
        year: 2,
        semester: 3,
        admissionDate: new Date('2023-08-01'),
        academicYear: '2024-25',
        guardianName: 'Robert Johnson',
        guardianPhone: '9876543211',
        emergencyContact: {
          name: 'Mary Johnson',
          phone: '9876543212',
          relation: 'Mother'
        },
        bloodGroup: 'A+'
      },
      {
        firstName: 'Bob',
        lastName: 'Smith',
        email: 'bob.smith@student.edu',
        phone: '9876543220',
        dateOfBirth: new Date('1999-12-20'),
        gender: 'Male',
        address: {
          street: '456 Oak Ave',
          city: 'Delhi',
          state: 'Delhi',
          zipCode: '110001',
          country: 'India'
        },
        studentId: 'CSC003',
        rollNo: '103',
        branchId: cscBranch._id,
        sectionName: 'B',
        year: 3,
        semester: 5,
        admissionDate: new Date('2022-08-01'),
        academicYear: '2024-25',
        guardianName: 'John Smith',
        guardianPhone: '9876543221',
        emergencyContact: {
          name: 'Sarah Smith',
          phone: '9876543222',
          relation: 'Sister'
        },
        bloodGroup: 'B+'
      },
      {
        firstName: 'Carol',
        lastName: 'Davis',
        email: 'carol.davis@student.edu',
        phone: '9876543230',
        dateOfBirth: new Date('2001-03-10'),
        gender: 'Female',
        address: {
          street: '789 Pine Rd',
          city: 'Bangalore',
          state: 'Karnataka',
          zipCode: '560001',
          country: 'India'
        },
        studentId: 'AI004',
        rollNo: '104',
        branchId: aiBranch._id,
        sectionName: 'A',
        year: 1,
        semester: 2,
        admissionDate: new Date('2024-08-01'),
        academicYear: '2024-25',
        guardianName: 'Michael Davis',
        guardianPhone: '9876543231',
        emergencyContact: {
          name: 'Linda Davis',
          phone: '9876543232',
          relation: 'Mother'
        },
        bloodGroup: 'O-'
      }
    ];

    for (const studentData of sampleStudents) {
      const existingStudent = await Student.findOne({ email: studentData.email });
      if (!existingStudent) {
        await Student.create(studentData);
        console.log(`✅ Created student: ${studentData.firstName} ${studentData.lastName}`);
      } else {
        console.log(`ℹ️  Student ${studentData.firstName} ${studentData.lastName} already exists`);
      }
    }

    console.log('\n🎉 Sample students created successfully!');
    
  } catch (error) {
    console.error('Error creating sample students:', error);
  } finally {
    mongoose.connection.close();
  }
}
