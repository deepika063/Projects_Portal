const express = require('express');
const {
  createSubject,
  getSubjects,
  getFacultySubjects,
  enrollStudent,
  getStudentSubjects
} = require('../controllers/subjectController.js');
const { protect, authorize } = require('../middleware/authMiddleware.js');

const router = express.Router();

// Public route
router.get('/', getSubjects);

// Protected routes
router.use(protect);

// Faculty only routes
router.post('/', authorize('faculty'), createSubject);
router.get('/faculty/my-subjects', authorize('faculty'), getFacultySubjects);

// Student only routes
router.post('/:subjectId/enroll', authorize('student'), enrollStudent);
router.get('/student/my-subjects', authorize('student'), getStudentSubjects);

module.exports = router;