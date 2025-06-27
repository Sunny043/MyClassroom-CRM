const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let studentSchema = new Schema({
  // Personal Information
  firstName: {
    type: String,
    required: [true, 'First name is required']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required']
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['Male', 'Female', 'Other']
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'India' }
  },
  
  // Academic Information
  studentId: {
    type: String,
    required: [true, 'Student ID is required'],
    unique: true,
    uppercase: true
  },
  rollNo: {
    type: String,
    required: [true, 'Roll number is required'],
    unique: true,
    uppercase: true
  },
  branchId: {
    type: Schema.Types.ObjectId,
    ref: 'Branch',
    required: [true, 'Branch is required']
  },
  sectionName: {
    type: String,
    required: [true, 'Section is required'],
    default: 'A'
  },
  year: {
    type: Number,
    required: [true, 'Academic year is required'],
    min: 1,
    max: 4
  },
  semester: {
    type: Number,
    required: [true, 'Semester is required'],
    min: 1,
    max: 8
  },
  admissionDate: {
    type: Date,
    required: [true, 'Admission date is required']
  },
  academicYear: {
    type: String,
    required: [true, 'Academic year is required'] // e.g., "2024-25"
  },
  
  // Additional Information
  guardianName: {
    type: String,
    required: [true, 'Guardian name is required']
  },
  guardianPhone: {
    type: String,
    required: [true, 'Guardian phone is required']
  },
  emergencyContact: {
    name: String,
    phone: String,
    relation: String
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', '']
  },
  
  // Status
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Graduated', 'Transferred', 'Dropped'],
    default: 'Active'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  collection: 'students',
  timestamps: true
});

// Virtual for full name
studentSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtual fields are serialized
studentSchema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('Student', studentSchema);