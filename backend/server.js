const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/database');

const app = express();

// Debug: Check if files exist
const fs = require('fs');
const path = require('path');

const filesToCheck = [
  './routes/auth.js',
  './controllers/authController.js', 
  './models/User.js',
  './utils/generateToken.js',
  './middleware/authMiddleware.js'
];

console.log('=== Checking required files ===');
filesToCheck.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`${file}: ${exists ? '✓ EXISTS' : '✗ MISSING'}`);
});
console.log('=== File check complete ===');

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
// Add this with your other route imports
app.use('/api/subjects', require('./routes/subjects.js'));
// Add route logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});
// Add this with your other routes
app.use('/api/admin', require('./routes/admin.js'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Add project routes
app.use('/api/projects', require('./routes/projects.js'));

app.get('/', (req, res) => {
  res.json({ message: 'Projects Portal API is running!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});