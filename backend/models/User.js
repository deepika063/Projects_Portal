const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['student', 'faculty', 'admin'], 
    required: true 
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved' // Students will be auto-approved
  },
  department: { 
    type: String, 
    required: true 
  },
  facultyId: {
    type: String,
    sparse: true // For faculty only
  },
  enrolledSubjects: [{ 
    type: String 
  }],
  academicYear: {
    type: String,
    default: '2024-2025'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add this pre-save hook to set status based on role
userSchema.pre('save', async function(next) {
  // Set status based on role for new users
  if (this.isNew) {
    if (this.role === 'student') {
      this.status = 'approved'; // Auto-approve students
    } else if (this.role === 'faculty') {
      this.status = 'pending'; // Faculty needs approval
    }
  }
  
  // Hash password only if modified
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);