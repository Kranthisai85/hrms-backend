const express = require('express');
const router = express.Router();
const designationController = require('../controllers/designationController');

// CRUD routes for designations
router.get('/', designationController.getAllDesignations);
router.get('/:id', designationController.getDesignation);
router.post('/', designationController.createDesignation);
router.put('/:id', designationController.updateDesignation);
router.delete('/:id', designationController.deleteDesignation);

module.exports = router;
