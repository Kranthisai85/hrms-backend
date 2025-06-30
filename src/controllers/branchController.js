const asyncHandler = require('express-async-handler');
const { Sequelize, DataTypes } = require('sequelize'); // Import DataTypes
require('dotenv').config(); // Load environment variables from .env file

// Initialize Sequelize using environment variables
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: process.env.DB_DIALECT, // Dynamically set the dialect (e.g., 'mysql')
  logging: console.log, // Use console.log as the logging function
});
const formatDate = (date) => {
  return date.toISOString().slice(0, 19).replace('T', ' '); // Format: 'YYYY-MM-DD HH:mm:ss'
};

const currentTime = new Date();
const formattedTime = formatDate(currentTime);  // Convert to MySQL compatible format

console.log('Formatted current time: ', formattedTime);


// Import the Branch model and pass DataTypes
const Branch = require('../models/Branch')(sequelize, DataTypes);

// Set up global.db for shared access
global.db = {
  sequelize,
  Sequelize,
  Branch,
};

// Get Branch model from global db object
// @desc    Create a new branch
// @route   POST /api/branches
// @access  Private/Admin
exports.createBranch = asyncHandler(async (req, res) => {
  const { name, companyId, address } = req.body;

  // Basic validation
  if (!name || !companyId) {
    return res.status(400).json({ 
      success: false,
      message: 'Name and companyId are required'
    });
  }

  const defaultAddress = address || 'No Address Provided'; // Default address if not provided
  const formattedTime = new Date().toISOString().slice(0, 19).replace('T', ' '); // Format: 'YYYY-MM-DD HH:mm:ss'

  console.log('Creating branch with:', {
    name,
    companyId,
    address: defaultAddress,
    createdAt: formattedTime,
    updatedAt: formattedTime,
  });

  const branch = await Branch.create({
    name,
    companyId, // Use the correct column name
    address: defaultAddress,
    createdAt: formattedTime,
    updatedAt: formattedTime,
  });

  res.status(201).json({
    success: true,
    data: branch,
  });
});

// @desc    Get all branches
// @route   GET /api/branches
// @access  Private/Admin
exports.getBranches = asyncHandler(async (req, res) => {
  const branches = await Branch.findAll();
  res.json({
    success: true,
    count: branches.length,
    data: branches
  });
});

// @desc    Get single branch
// @route   GET /api/branches/:id
// @access  Private/Admin
exports.getBranch = asyncHandler(async (req, res) => {
  const branch = await Branch.findByPk(req.params.id);

  if (!branch) {
    return res.status(404).json({
      success: false,
      message: 'Branch not found'
    });
  }

  res.json({
    success: true,
    data: branch
  });
});

// @desc    Update branch
// @route   PUT /api/branches/:id
// @access  Private/Admin
exports.updateBranch = asyncHandler(async (req, res) => {
  const branch = await Branch.findByPk(req.params.id);

  if (!branch) {
    return res.status(404).json({
      success: false,
      message: 'Branch not found'
    });
  }

  const updatedBranch = await branch.update(req.body);
  
  res.json({
    success: true,
    data: updatedBranch
  });
});

// @desc    Delete branch
// @route   DELETE /api/branches/:id
// @access  Private/Admin
exports.deleteBranch = asyncHandler(async (req, res) => {
  const branch = await Branch.findByPk(req.params.id);

  if (!branch) {
    return res.status(404).json({
      success: false,
      message: 'Branch not found'
    });
  }

  await branch.destroy();
  
  res.json({
    success: true,
    data: {}
  });
});
