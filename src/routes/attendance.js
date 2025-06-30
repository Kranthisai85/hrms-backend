const express = require('express');
const router = express.Router();
const {
  checkIn,
  checkOut,
  getAttendanceHistory,
  getAttendanceStats,
  bulkMarkAttendance,
  lockAttendance,
  unlockAttendance,
  importAttendance,
  exportAttendance,
  downloadTemplate
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// Routes for all authenticated users
router.post('/check-in', checkIn);
router.put('/check-out', checkOut);
router.get('/history', getAttendanceHistory);

// Routes restricted to admin
router.get('/stats', authorize('admin', 'super_admin'), getAttendanceStats);
router.post('/bulk-mark', authorize('admin', 'super_admin'), bulkMarkAttendance);
router.put('/lock/:month/:year', authorize('admin', 'super_admin'), lockAttendance);
router.put('/unlock/:month/:year', authorize('super_admin'), unlockAttendance);
router.post('/import', authorize('admin', 'super_admin'), importAttendance);
router.get('/export/:month/:year', authorize('admin', 'super_admin'), exportAttendance);
router.get('/template', authorize('admin', 'super_admin'), downloadTemplate);

module.exports = router;
