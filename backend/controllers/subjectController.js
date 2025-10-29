const Subject = require('../models/Subject.js');
const User = require('../models/User.js');

// @desc    Create a new subject
// @route   POST /api/subjects
// @access  Private/Faculty
const createSubject = async (req, res) => {
  try {
    const { subjectCode, subjectName, description, department, credits, maxStudents } = req.body;

    // Check if subject already exists
    const subjectExists = await Subject.findOne({ subjectCode });
    if (subjectExists) {
      return res.status(400).json({
        success: false,
        message: 'Subject with this code already exists'
      });
    }

    // Get faculty details
    const facultyUser = await User.findById(req.user._id);
    if (!facultyUser || facultyUser.role !== 'faculty') {
      return res.status(403).json({
        success: false,
        message: 'Only faculty can create subjects'
      });
    }

    const subject = await Subject.create({
      subjectCode,
      subjectName,
      description,
      faculty: req.user._id,  // ← Using 'faculty'
      facultyName: facultyUser.username,
      department: department || facultyUser.department,
      credits,
      maxStudents
    });

    res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      data: subject
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating subject',
      error: error.message
    });
  }
};

// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Public
const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({ isActive: true })
      .populate('faculty', 'username email department')  // ← CHANGED to 'faculty'
      .select('-enrolledStudents');

    res.json({
      success: true,
      count: subjects.length,
      data: subjects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching subjects',
      error: error.message
    });
  }
};

// @desc    Get subjects by faculty
// @route   GET /api/subjects/faculty/my-subjects
// @access  Private/Faculty
const getFacultySubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({ faculty: req.user._id })  // ← CHANGED to 'faculty'
      .populate('enrolledStudents.student', 'username email');

    res.json({
      success: true,
      count: subjects.length,
      data: subjects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching faculty subjects',
      error: error.message
    });
  }
};

// @desc    Enroll student in subject
// @route   POST /api/subjects/:subjectId/enroll
// @access  Private/Student
const enrollStudent = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.subjectId);
    
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    const alreadyEnrolled = subject.enrolledStudents.some(
      enrollment => enrollment.student.toString() === req.user._id.toString()
    );

    if (alreadyEnrolled) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this subject'
      });
    }

    if (subject.enrolledStudents.length >= subject.maxStudents) {
      return res.status(400).json({
        success: false,
        message: 'Subject has reached maximum capacity'
      });
    }

    subject.enrolledStudents.push({
      student: req.user._id
    });

    await subject.save();

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { enrolledSubjects: subject.subjectCode }
    });

    res.json({
      success: true,
      message: 'Successfully enrolled in subject',
      data: subject
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error enrolling in subject',
      error: error.message
    });
  }
};

// @desc    Get student's enrolled subjects
// @route   GET /api/subjects/student/my-subjects
// @access  Private/Student
const getStudentSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({
      'enrolledStudents.student': req.user._id
    }).populate('faculty', 'username email department');  // ← CHANGED to 'faculty'

    res.json({
      success: true,
      count: subjects.length,
      data: subjects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching student subjects',
      error: error.message
    });
  }
};

module.exports = {
  createSubject,
  getSubjects,
  getFacultySubjects,
  enrollStudent,
  getStudentSubjects
};