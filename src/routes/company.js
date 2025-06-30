const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getOneCompany,
    // getDepartment,
    // updateDepartment,
    // deleteDepartment
} = require('../controllers/company_controller');

// Apply authentication middleware to all routes
router.use(protect);


router.route('/:id')
    .get(authorize('admin'), getOneCompany)
//     .put(authorize('admin'), updateDepartment)
//     .delete(authorize('admin'), deleteDepartment);

module.exports = router;
