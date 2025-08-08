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
    const uploadDir = path.join(__dirname, '../uploads/employee-photos');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Move file to uploads directory
    const filePath = path.join(uploadDir, fileName);
    await photoFile.mv(filePath);
    
    // Update employee record with photo path
    const { Employee } = global.db;
    const updateResult = await Employee.update(
      { photo: fileName },
      { where: { id: employeeId } }
    );
    
    // Check if the update was successful
    if (updateResult[0] === 0) {
      // If no rows were updated, the employee might not exist
      return res.status(404).json({
        success: false,
        message: 'Employee not found or photo update failed'
      });
    }
    
    // Only send success response if database update was successful
    res.json({
      success: true,
      photoPath: fileName,
      message: 'Photo uploaded and updated successfully'
    });
    
  } catch (error) {
    console.error('Photo upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading photo'
    });
  }
});

// Document upload route using express-fileupload
router.post('/upload-document', async (req, res) => {
  try {
    const { employeeId, documentName, comment, replaceExisting } = req.body;
    
    if (!req.files || !req.files.document) {
      return res.status(400).json({
        success: false,
        message: 'No document file provided'
      });
    }
    
    const documentFile = req.files.document;
    
    // Validate file type
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp',
      'application/pdf'
    ];
    
    if (!allowedTypes.includes(documentFile.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Only images (JPG, PNG, GIF, BMP, WebP) and PDF files are allowed'
      });
    }
    
    // Check file size (10MB limit)
    if (documentFile.size > 10 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'File size should not exceed 10MB'
      });
    }
    
    // Check if document already exists for this employee
    const { Document } = global.db;
    const existingDocument = await Document.findOne({
      where: {
        employee_id: employeeId,
        documentName: documentName
      }
    });
    
    // If document exists but replaceExisting is not set, return error
    if (existingDocument && replaceExisting !== 'true') {
      return res.status(409).json({
        success: false,
        message: 'Document already exists. Please set replaceExisting flag to replace.',
        existingDocument: {
          id: existingDocument.id,
          documentName: existingDocument.documentName,
          fileName: existingDocument.fileName,
          size: existingDocument.size,
          lastUpdated: existingDocument.lastUpdated,
          comment: existingDocument.comment
        }
      });
    }
    
    // Generate unique filename
    const fileExtension = path.extname(documentFile.name);
    const fileName = `document_${employeeId}_${Date.now()}_${documentName.replace(/[^a-zA-Z0-9]/g, '_')}${fileExtension}`;
    
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(__dirname, '../uploads/employee-documents');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Move file to uploads directory
    const filePath = path.join(uploadDir, fileName);
    await documentFile.mv(filePath);
    
    let result;
    
    if (existingDocument && replaceExisting === 'true') {
      // Update existing document
      // Delete old file if it exists
      const oldFilePath = path.join(uploadDir, existingDocument.fileName);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
      
      // Update document record in database
      result = await existingDocument.update({
        fileName: fileName,
        size: documentFile.size,
        lastUpdated: new Date(),
        comment: comment || existingDocument.comment
      });
    } else {
      // Create new document record in database
      result = await Document.create({
        employee_id: employeeId,
        user_id: req.user.id, // Current user uploading the document
        documentName: documentName,
        fileName: fileName,
        size: documentFile.size,
        lastUpdated: new Date(),
        comment: comment || ''
      });
    }
    
    res.json({
      success: true,
      fileName: fileName,
      size: documentFile.size,
      message: existingDocument ? 'Document replaced successfully' : 'Document uploaded successfully',
      replaced: !!existingDocument
    });
    
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading document'
    });
  }
});

module.exports = router;
