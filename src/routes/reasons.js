const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    createReasons,
    getAllReasons,
    getAllTypeReasons,
    updateReason,
    deleteReason
} = require('../controllers/reasons_controller');

// Apply authentication middleware to all routes
router.use(protect);

// Routes with role-based authorization
router.route('/')
    .post(authorize('admin'), createReasons)
    .get(authorize('admin'), getAllReasons);
router.route('/:type')
    .get(authorize('admin'), getAllTypeReasons);

router.route('/:id')
    .put(authorize('admin'), updateReason)
    .delete(authorize('admin'), deleteReason);

module.exports = router;
