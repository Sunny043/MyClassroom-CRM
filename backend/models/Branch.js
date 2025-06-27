const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let branchSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Branch name is required'],
    unique: true
  },
  code: {
    type: String,
    required: [true, 'Branch code is required'],
    unique: true,
    uppercase: true
  },
  description: {
    type: String,
    default: ''
  },
  hodName: {
    type: String,
    default: ''
  },
  hodEmail: {
    type: String,
    default: '',
    lowercase: true
  },
  coordinatorCredentials: {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    }
  },
  sections: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    maxCapacity: {
      type: Number,
      default: 60
    },
    currentStrength: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  totalSections: {
    type: Number,
    default: 0
  },
  totalStudents: {
    type: Number,
    default: 0
  }
}, {
  collection: 'branches',
  timestamps: true
});

module.exports = mongoose.model('Branch', branchSchema);
