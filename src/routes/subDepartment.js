const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createSubDepartment,
  getSubDepartments,
  getSubDepartmentsByDepartment,
  getSubDepartment,
  updateSubDepartment,
  deleteSubDepartment
} = require('../controllers/subDepartmentController');

// Apply authentication middleware to all routes
router.use(protect);

// Routes with role-based authorization
router.route('/')
  .post(authorize('admin'), createSubDepartment)
  .get(authorize('admin'), getSubDepartments);

router.route('/department/:department_id')
  .get(authorize('admin'), getSubDepartmentsByDepartment);

router.route('/:id')
  .get(authorize('admin'), getSubDepartment)
  .put(authorize('admin'), updateSubDepartment)
  .delete(authorize('admin'), deleteSubDepartment);

module.exports = router;
