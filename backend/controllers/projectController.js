const Project = require('../models/Project.js');
const Subject = require('../models/Subject.js');
const User = require('../models/User.js');
const path = require('path');
const fs = require('fs');

// @desc    Upload a project
// @route   POST /api/projects/upload
// @access  Private/Student
const uploadProject = async (req, res) => {
  try {
    const { projectTitle, description, subjectId } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a project file'
      });
    }

    // Check if student is enrolled in the subject
    const subject = await Subject.findOne({
      _id: subjectId,
      'enrolledStudents.student': req.user._id
    });

    if (!subject) {
      // Delete uploaded file if student not enrolled
      fs.unlinkSync(req.file.path);
      return res.status(403).json({
        success: false,
        message: 'You are not enrolled in this subject or subject does not exist'
      });
    }

    // Check if student already submitted project for this subject
    const existingProject = await Project.findOne({
      subject: subjectId,
      student: req.user._id
    });

    if (existingProject) {
      // Delete uploaded file if project already exists
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a project for this subject'
      });
    }

    // Create project
    const project = await Project.create({
      projectTitle,
      description,
      subject: subjectId,
      subjectCode: subject.subjectCode,
      student: req.user._id,
      studentName: req.user.username,
      studentEmail: req.user.email,
      fileUrl: req.file.path,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      fileType: path.extname(req.file.originalname)
    });

    res.status(201).json({
      success: true,
      message: 'Project uploaded successfully',
      data: project
    });
  } catch (error) {
    // Delete uploaded file if error occurs
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: 'Error uploading project',
      error: error.message
    });
  }
};

// @desc    Get projects for a faculty (their subjects)
// @route   GET /api/projects/faculty
// @access  Private/Faculty
const getFacultyProjects = async (req, res) => {
  try {
    // Get subjects taught by this faculty
    const subjects = await Subject.find({ faculty: req.user._id });
    const subjectIds = subjects.map(subject => subject._id);

    const projects = await Project.find({ subject: { $in: subjectIds } })
      .populate('subject', 'subjectName subjectCode')
      .populate('student', 'username email')
      .sort({ submissionDate: -1 });

    res.json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching faculty projects',
      error: error.message
    });
  }
};

// @desc    Get projects for a student
// @route   GET /api/projects/student
// @access  Private/Student
const getStudentProjects = async (req, res) => {
  try {
    const projects = await Project.find({ student: req.user._id })
      .populate('subject', 'subjectName subjectCode facultyName')
      .populate('evaluatedBy', 'username')
      .sort({ submissionDate: -1 });

    res.json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching student projects',
      error: error.message
    });
  }
};

// @desc    Evaluate a project
// @route   PUT /api/projects/evaluate/:projectId
// @access  Private/Faculty
const evaluateProject = async (req, res) => {
  try {
    const { marks, facultyFeedback, evaluationCriteria } = req.body;
    
    const project = await Project.findById(req.params.projectId)
      .populate('subject');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if faculty teaches this subject
    const subject = await Subject.findOne({
      _id: project.subject._id,
      faculty: req.user._id
    });

    if (!subject) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to evaluate this project'
      });
    }

    // Update project evaluation
    project.marks = marks;
    project.facultyFeedback = facultyFeedback;
    project.evaluationCriteria = evaluationCriteria;
    project.evaluatedBy = req.user._id;
    project.evaluationDate = new Date();
    project.status = 'evaluated';

    await project.save();

    res.json({
      success: true,
      message: 'Project evaluated successfully',
      data: project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error evaluating project',
      error: error.message
    });
  }
};

// @desc    Get projects by subject
// @route   GET /api/projects/subject/:subjectId
// @access  Private/Faculty
const getProjectsBySubject = async (req, res) => {
  try {
    // Verify faculty teaches this subject
    const subject = await Subject.findOne({
      _id: req.params.subjectId,
      faculty: req.user._id
    });

    if (!subject) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view projects for this subject'
      });
    }

    const projects = await Project.find({ subject: req.params.subjectId })
      .populate('student', 'username email')
      .sort({ submissionDate: -1 });

    res.json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching projects by subject',
      error: error.message
    });
  }
};

module.exports = {
  uploadProject,
  getFacultyProjects,
  getStudentProjects,
  evaluateProject,
  getProjectsBySubject
};