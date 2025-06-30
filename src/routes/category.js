const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    createCategory,
    getAllCategories,
    // getDepartment,
    // updateDepartment,
    // deleteDepartment
} = require('../controllers/category_controller');

// Apply authentication middleware to all routes
router.use(protect);

// Routes with role-based authorization
router.route('/')
    .post(authorize('admin'), createCategory)
    .get(authorize('admin'), getAllCategories);

// router.route('/:id')
//     .get(authorize('admin'), getDepartment)
//     .put(authorize('admin'), updateDepartment)
//     .delete(authorize('admin'), deleteDepartment);

module.exports = router;
