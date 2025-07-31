const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    createGrade,
    getAllGrades,
    updateGrade,
    deleteGrade
} = require('../controllers/grade_controller');

// Apply authentication middleware to all routes
router.use(protect);

// Routes with role-based authorization
router.route('/')
    .post(authorize('admin'), createGrade)
    .get(authorize('admin'), getAllGrades);

router.route('/:id')
    .put(authorize('admin'), updateGrade)
    .delete(authorize('admin'), deleteGrade);

module.exports = router;
