const User = require('../models/User.js');

// @desc    Get all pending faculty
// @route   GET /api/admin/pending-faculty
// @access  Private/Admin
const getPendingFaculty = async (req, res) => {
  try {
    const pendingFaculty = await User.find({ 
      role: 'faculty', 
      status: 'pending' 
    }).select('-password');

    res.json({
      success: true,
      count: pendingFaculty.length,
      data: pendingFaculty
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching pending faculty',
      error: error.message
    });
  }
};

// @desc    Approve faculty
// @route   PUT /api/admin/approve-faculty/:userId
// @access  Private/Admin
const approveFaculty = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user || user.role !== 'faculty') {
      return res.status(404).json({
        success: false,
        message: 'Faculty user not found'
      });
    }

    user.status = 'approved';
    await user.save();

    res.json({
      success: true,
      message: 'Faculty approved successfully',
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error approving faculty',
      error: error.message
    });
  }
};

// @desc    Reject faculty
// @route   PUT /api/admin/reject-faculty/:userId
// @access  Private/Admin
const rejectFaculty = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user || user.role !== 'faculty') {
      return res.status(404).json({
        success: false,
        message: 'Faculty user not found'
      });
    }

    user.status = 'rejected';
    await user.save();

    res.json({
      success: true,
      message: 'Faculty rejected',
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error rejecting faculty',
      error: error.message
    });
  }
};

module.exports = {
  getPendingFaculty,
  approveFaculty,
  rejectFaculty
};