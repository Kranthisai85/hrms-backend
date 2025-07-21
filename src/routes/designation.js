const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const designationController = require('../controllers/designationController');

router.use(protect);

// CRUD routes for designations
router.get('/', authorize('admin'), designationController.getAllDesignations);
router.get('/:id', authorize('admin'), designationController.getDesignation);
router.post('/', authorize('admin'), designationController.createDesignation);
router.put('/:id', authorize('admin'), designationController.updateDesignation);
router.delete('/:id', authorize('admin'), designationController.deleteDesignation);

module.exports = router;
