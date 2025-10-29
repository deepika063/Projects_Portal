const express = require('express');
const {
  uploadProject,
  getFacultyProjects,
  getStudentProjects,
  evaluateProject,
  getProjectsBySubject
} = require('../controllers/projectController.js');
const { protect, authorize } = require('../middleware/authMiddleware.js');
const upload = require('../middleware/uploadMiddleware.js');

const router = express.Router();

// All routes are protected
router.use(protect);

// Student routes
router.post('/upload', authorize('student'), upload.single('projectFile'), uploadProject);
router.get('/student', authorize('student'), getStudentProjects);

// Faculty routes
router.get('/faculty', authorize('faculty'), getFacultyProjects);
router.get('/subject/:subjectId', authorize('faculty'), getProjectsBySubject);
router.put('/evaluate/:projectId', authorize('faculty'), evaluateProject);

module.exports = router;