const express = require('express');
const router = express.Router();
const {
  generatePayslip,
  getPayslips,
  submitTaxDeclaration,
  getTaxDeclaration,
  updateTaxDeclarationStatus,
  bulkImportDeclarations,
  exportDeclarations,
  bulkApproveDeclarations,
  downloadTemplate
} = require('../controllers/payrollController');
const { protect, authorize } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// Payslip routes
router.post('/generate', authorize('admin', 'super_admin'), generatePayslip);
router.get('/payslips/:employeeId', getPayslips);

// Tax declaration routes
router.post('/tax-declaration', submitTaxDeclaration);
router.get('/tax-declaration/:employeeId', getTaxDeclaration);
router.put('/tax-declaration/:id', authorize('admin', 'super_admin'), updateTaxDeclarationStatus);

// Bulk operations routes
router.post('/declarations/bulk-import', authorize('admin', 'super_admin'), bulkImportDeclarations);
router.get('/declarations/export', authorize('admin', 'super_admin'), exportDeclarations);
router.put('/declarations/bulk-approve', authorize('admin', 'super_admin'), bulkApproveDeclarations);
router.get('/declarations/template', authorize('admin', 'super_admin'), downloadTemplate);

module.exports = router;
