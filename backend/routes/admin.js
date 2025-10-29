const express = require('express');
const { 
  getPendingFaculty, 
  approveFaculty, 
  rejectFaculty 
} = require('../controllers/adminController.js');
const { protect, authorize } = require('../middleware/authMiddleware.js');

const router = express.Router();

// All admin routes are protected and admin only
router.use(protect);
router.use(authorize('admin'));

router.get('/pending-faculty', getPendingFaculty);
router.put('/approve-faculty/:userId', approveFaculty);
router.put('/reject-faculty/:userId', rejectFaculty);

module.exports = router;