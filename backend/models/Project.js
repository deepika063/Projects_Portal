const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  projectTitle: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  subjectCode: {
    type: String,
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  studentEmail: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number
  },
  fileType: {
    type: String
  },
  submissionDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['submitted', 'under_review', 'evaluated'],
    default: 'submitted'
  },
  marks: {
    type: Number,
    min: 0,
    max: 100
  },
  facultyFeedback: {
    type: String,
    trim: true
  },
  evaluatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  evaluationDate: {
    type: Date
  },
  evaluationCriteria: {
    innovation: { type: Number, min: 0, max: 25 },
    functionality: { type: Number, min: 0, max: 25 },
    documentation: { type: Number, min: 0, max: 25 },
    presentation: { type: Number, min: 0, max: 25 }
  },
  totalMarks: {
    type: Number,
    min: 0,
    max: 100
  }
});

// Calculate total marks before saving
projectSchema.pre('save', function(next) {
  if (this.evaluationCriteria) {
    const { innovation = 0, functionality = 0, documentation = 0, presentation = 0 } = this.evaluationCriteria;
    this.totalMarks = innovation + functionality + documentation + presentation;
  }
  next();
});

// Indexes for better performance
projectSchema.index({ subject: 1, student: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ student: 1 });

module.exports = mongoose.model('Project', projectSchema);