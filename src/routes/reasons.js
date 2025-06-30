const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    createReasons,
    getAllReasons,
    getAllTypeReasons,
    // getAllResignationReasons
    // getDepartment,
    // updateDepartment,
    // deleteDepartment
} = require('../controllers/reasons_controller');

// Apply authentication middleware to all routes
router.use(protect);

// Routes with role-based authorization
router.route('/')
    .post(authorize('admin'), createReasons)
    .get(authorize('admin'), getAllReasons);
router.route('/:type')
    .get(authorize('admin'), getAllTypeReasons)
// .get(authorize('admin'), getAllResignationReasons);

// router.route('/:id')
//     .get(authorize('admin'), getDepartment)
//     .put(authorize('admin'), updateDepartment)
//     .delete(authorize('admin'), deleteDepartment);

module.exports = router;
