const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User.js');

const debugUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/projects-portal');
    console.log('Connected to MongoDB\n');

    // Check if users collection exists
    const collections = await mongoose.connection.db.listCollections().toArray();
    const usersCollectionExists = collections.some(col => col.name === 'users');
    console.log('Users collection exists:', usersCollectionExists);

    if (!usersCollectionExists) {
      console.log('No users collection found!');
      process.exit(0);
    }

    // Get ALL users without any filters
    const allUsers = await User.find({});
    console.log(`\n=== TOTAL USERS IN DATABASE: ${allUsers.length} ===`);

    if (allUsers.length === 0) {
      console.log('No users found in database!');
      process.exit(0);
    }

    // Display all users with ALL fields
    allUsers.forEach((user, index) => {
      console.log(`\n--- User ${index + 1} ---`);
      console.log('Full document:', JSON.stringify(user.toObject(), null, 2));
    });

    // Check specifically for faculty
    const facultyUsers = await User.find({ role: 'faculty' });
    console.log(`\n=== FACULTY USERS: ${facultyUsers.length} ===`);
    facultyUsers.forEach(faculty => {
      console.log(`ID: ${faculty._id}`);
      console.log(`Email: ${faculty.email}`);
      console.log(`Status: ${faculty.status}`);
      console.log(`Role: ${faculty.role}`);
      console.log('---');
    });

    // Check pending faculty specifically
    const pendingFaculty = await User.find({ role: 'faculty', status: 'pending' });
    console.log(`\n=== PENDING FACULTY: ${pendingFaculty.length} ===`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

debugUsers();