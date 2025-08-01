const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createEmployee,
  getEmployees,
  getEmployee,
  updateEmployee,
  deleteEmployee,
  importEmployees,
  exportEmployees
} = require('../controllers/employeeController');
const path = require('path');
const fs = require('fs');

// Apply authentication middleware to all routes
router.use((req, res, next) => {
  console.log('Request Headers:', req.headers);
  next();
});

router.use(protect);

// Routes with role-based authorization
router.route('/')
  .post(authorize('admin'), createEmployee)
  .get(authorize('admin'), getEmployees);

// Import/Export routes
router.post('/import', authorize('admin'), importEmployees);
router.get('/export', authorize('admin'), exportEmployees);

router.route('/:id')
  .get(authorize('admin', 'employee'), getEmployee)
  .put(authorize('admin'), updateEmployee)
  .delete(authorize('admin'), deleteEmployee);

// Photo upload route using express-fileupload
router.post('/upload-photo', async (req, res) => {
  try {
    const { employeeId } = req.body;
    
    if (!req.files || !req.files.photo) {
      return res.status(400).json({
        success: false,
        message: 'No photo file provided'
      });
    }
    
    const photoFile = req.files.photo;
    
    // Generate unique filename
    const fileExtension = path.extname(photoFile.name);
    const fileName = `employee_${employeeId}_${Date.now()}${fileExtension}`;
    
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(__dirname, 'uploads/employee-photos');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Move file to uploads directory
    const filePath = path.join(uploadDir, fileName);
    await photoFile.mv(filePath);
    
    // Update employee record with photo path
    const { Employee } = global.db;
    await Employee.update(
      { photo: fileName },
      { where: { id: employeeId } }
    );
    
    res.json({
      success: true,
      photoPath: fileName,
      message: 'Photo uploaded successfully'
    });
    
  } catch (error) {
    console.error('Photo upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading photo'
    });
  }
});

module.exports = router;
