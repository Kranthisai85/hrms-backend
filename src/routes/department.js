const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createDepartment,
  getDepartments,
  getDepartment,
  updateDepartment,
  deleteDepartment
} = require('../controllers/departmentController');

// Apply authentication middleware to all routes
router.use(protect);

// Routes with role-based authorization
router.route('/')
  .post(authorize('admin'), createDepartment)
  .get(authorize('admin'), getDepartments);

router.route('/:id')
  .get(authorize('admin'), getDepartment)
  .put(authorize('admin'), updateDepartment)
  .delete(authorize('admin'), deleteDepartment);

module.exports = router;
