const express = require('express');
const { 
  registerStudent, 
  registerFaculty, 
  loginUser, 
  getMe 
} = require('../controllers/authController.js');
const { protect } = require('../middleware/authMiddleware.js');

const router = express.Router();

// Add route debugging
router.use((req, res, next) => {
  console.log(`🛣️ Auth route called: ${req.method} ${req.path}`);
  next();
});

router.post('/register/student', registerStudent);
router.post('/register/faculty', registerFaculty);
router.post('/login', loginUser);
router.get('/me', protect, (req, res, next) => {
  console.log('🎯 /me route reached, calling getMe controller...');
  next();
}, getMe);

module.exports = router;