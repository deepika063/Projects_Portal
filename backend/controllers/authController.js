const User = require('../models/User.js');
const { generateToken } = require('../utils/generateToken.js');

// @desc    Register a new student (auto-approved)
// @route   POST /api/auth/register/student
// @access  Public
const registerStudent = async (req, res) => {
  try {
    const { username, email, password, department, academicYear, enrolledSubjects } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or username'
      });
    }

    // Create student
    const user = await User.create({
      username,
      email,
      password,
      role: 'student',
      department,
      academicYear: academicYear || '2024-2025',
      enrolledSubjects: enrolledSubjects || [],
      status: 'approved' // Auto-approve students
    });

    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        department: user.department,
        status: user.status,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error in student registration',
      error: error.message
    });
  }
};

// @desc    Register a new faculty (pending approval)
// @route   POST /api/auth/register/faculty
// @access  Public
const registerFaculty = async (req, res) => {
  try {
    const { username, email, password, department, facultyId } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or username'
      });
    }

    // Create faculty (pending approval)
    const user = await User.create({
      username,
      email,
      password,
      role: 'faculty',
      department,
      facultyId: facultyId || null,
      status: 'approved' // Needs admin approval
    });

    res.status(201).json({
      success: true,
      message: 'Faculty registration submitted. Waiting for admin approval.',
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        department: user.department,
        status: user.status
        // No token - they can't login until approved
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error in faculty registration',
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists and password matches
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      // Check if faculty is approved
      if (user.role === 'faculty' && user.status !== 'approved') {
        return res.status(401).json({
          success: false,
          message: 'Your faculty account is pending admin approval'
        });
      }

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          department: user.department,
          status: user.status,
          enrolledSubjects: user.enrolledSubjects,
          token: generateToken(user._id)
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error in login',
      error: error.message
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    console.log('🔐 getMe called - User ID:', req.user?._id);
    
    // Check if user exists in request (middleware should set this)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    // Get fresh user data from database
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('❌ getMe error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in getMe',
      error: error.message
    });
  }
};
    // REMOVE THE MOCK RESPONSE - Use real user data
    // res.json({
    //   success: true,
    //   message: 'Get me endpoint - will add user data when we implement protection middleware'
    // });

    // ADD THIS INSTEAD - Return actual user data
module.exports = {
  registerStudent,
  registerFaculty,
  loginUser,
  getMe
};