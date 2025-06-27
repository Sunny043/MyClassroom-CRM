const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let sectionSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Section name is required']
  },
  branchId: {
    type: Schema.Types.ObjectId,
    ref: 'Branch',
    required: [true, 'Branch ID is required']
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
  maxCapacity: {
    type: Number,
    default: 60
  },
  currentStrength: {
    type: Number,
    default: 0
  },
  classTeacher: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  collection: 'sections',
  timestamps: true
});

// Compound index to ensure unique section per branch, year, and semester
sectionSchema.index({ branchId: 1, year: 1, semester: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Section', sectionSchema);
