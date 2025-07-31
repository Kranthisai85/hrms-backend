const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    createCategory,
    getAllCategories,
    updateCategory,
    deleteCategory
} = require('../controllers/category_controller');

// Apply authentication middleware to all routes
router.use(protect);

// Routes with role-based authorization
router.route('/')
    .post(authorize('admin'), createCategory)
    .get(authorize('admin'), getAllCategories);

router.route('/:id')
    .put(authorize('admin'), updateCategory)
    .delete(authorize('admin'), deleteCategory);

module.exports = router;
