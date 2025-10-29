const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User.js');

const debugFaculty = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/projects-portal');
    
    console.log('=== ALL FACULTY USERS ===');
    
    // Get all faculty
    const allFaculty = await User.find({ role: 'faculty' });
    
    allFaculty.forEach((faculty, index) => {
      console.log(`\n--- Faculty ${index + 1} ---`);
      console.log(`ID: ${faculty._id}`);
      console.log(`Username: ${faculty.username}`);
      console.log(`Email: ${faculty.email}`);
      console.log(`Status: ${faculty.status}`);
      console.log(`Department: ${faculty.department}`);
    });

    // Specifically check pending faculty
    const pendingFaculty = await User.find({ role: 'faculty', status: 'pending' });
    console.log(`\n=== PENDING FACULTY COUNT: ${pendingFaculty.length} ===`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

debugFaculty();