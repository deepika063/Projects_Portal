const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  subjectCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  subjectName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  facultyName: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  academicYear: {
    type: String,
    required: true,
    default: '2024-2025'
  },
  credits: {
    type: Number,
    default: 3
  },
  maxStudents: {
    type: Number,
    default: 50
  },
  enrolledStudents: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for better query performance
subjectSchema.index({ subjectCode: 1 });
subjectSchema.index({ faculty: 1 });
subjectSchema.index({ department: 1 });

module.exports = mongoose.model('Subject', subjectSchema);