const { verifyToken } = require('../utils/generateToken.js');
const User = require('../models/User.js');

const protect = async (req, res, next) => {
  try {
    let token;

    console.log('🛡️ Protect middleware called for:', req.method, req.path);
    
    // Check for token in header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('🔑 Token found in header');
    } else {
      console.log('❌ No token found in header');
    }

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized to access this route' 
      });
    }

    try {
      // Verify token
      console.log('🔍 Verifying token...');
      const decoded = verifyToken(token);
      console.log('✅ Token decoded. User ID:', decoded.userId);
      
      // Get user from token
      req.user = await User.findById(decoded.userId).select('-password');
      
      if (!req.user) {
        console.log('❌ User not found for ID:', decoded.userId);
        return res.status(401).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      console.log('✅ User found:', req.user.username, req.user.role);
      next();
    } catch (error) {
      console.error('❌ Token verification failed:', error);
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized to access this route' 
      });
    }
  } catch (error) {
    console.error('❌ Protect middleware error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error in authentication' 
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };