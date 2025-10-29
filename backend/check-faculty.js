const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User.js');

const checkFaculty = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/projects-portal');
    
    console.log('🔍 Checking all faculty accounts...\n');

    // Check ALL users first
    const allUsers = await User.find({});
    console.log(`📊 TOTAL USERS: ${allUsers.length}`);
    
    allUsers.forEach(user => {
      console.log(`- ${user.username} (${user.email}) - Role: ${user.role}, Status: ${user.status}`);
    });

    // Check specifically for faculty
    const faculty = await User.find({ role: 'faculty' });
    console.log(`\n🎓 FACULTY USERS: ${faculty.length}`);
    
    faculty.forEach(f => {
      console.log(`- ${f.username} (${f.email}) - Status: ${f.status}`);
    });

    // Check pending faculty
    const pending = await User.find({ role: 'faculty', status: 'pending' });
    console.log(`\n⏳ PENDING FACULTY: ${pending.length}`);
    
    if (pending.length > 0) {
      pending.forEach(p => {
        console.log(`- ${p.username} (${p.email}) - ID: ${p._id}`);
      });
    } else {
      console.log('No pending faculty found.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkFaculty();