const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createBranch,
  getBranches,
  getBranch,
  updateBranch,
  deleteBranch
} = require('../controllers/branchController');

// Apply authentication middleware to all routes
router.use(protect);

// Routes with role-based authorization
router.route('/')
  .post(authorize('admin'), createBranch)
  .get(authorize('admin'), getBranches);

router.route('/:id')
  .get(authorize('admin'), getBranch)
  .put(authorize('admin'), updateBranch)
  .delete(authorize('admin'), deleteBranch);

module.exports = router;
