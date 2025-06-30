const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createEmployee,
  getEmployees,
  getEmployee,
  updateEmployee,
  deleteEmployee,
  importEmployees,
  exportEmployees
} = require('../controllers/employeeController');

// Apply authentication middleware to all routes
router.use((req, res, next) => {
  console.log('Request Headers:', req.headers);
  next();
});

router.use(protect);

// Routes with role-based authorization
router.route('/')
  .post(authorize('admin'), createEmployee)
  .get(authorize('admin'), getEmployees);

// Import/Export routes
router.post('/import', authorize('admin'), importEmployees);
router.get('/export', authorize('admin'), exportEmployees);

router.route('/:id')
  .get(authorize('admin', 'employee'), getEmployee)
  .put(authorize('admin'), updateEmployee)
  .delete(authorize('admin'), deleteEmployee);

module.exports = router;
