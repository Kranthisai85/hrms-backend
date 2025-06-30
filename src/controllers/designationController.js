const { Sequelize, DataTypes } = require('sequelize'); // 1. Import first

// 2. Initialize Sequelize instance
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: process.env.DB_DIALECT,
  logging: console.log,
});

// 3. Import the model after sequelize and DataTypes are ready
const Designation = require('../models/Designation')(sequelize, DataTypes);

exports.getDesignation = async (req, res) => {
  const { id } = req.params;
  try {
    const designation = await Designation.findByPk(id);
    if (!designation) {
      return res.status(404).json({ success: false, message: 'Designation not found' });
    }
    res.status(200).json({ success: true, data: designation });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch designation', error });
  }
};

exports.getAllDesignations = async (req, res) => {
  try {
    const designations = await Designation.findAll();
    res.status(200).json({ success: true, data: designations });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch designations', error });
  }
};

exports.createDesignation = async (req, res) => {
  const { name, departmentId} = req.body;
    const companyId = process.env.DEFAULT_COMPANY_ID || 1; // Default company ID

  console.log('Request body:', req.body);
  console.log('Creating designation with:', { name, departmentId, companyId });
  try {
    const designation = await Designation.create({ name, departmentId, companyId });
    console.log('Designation created successfully:', designation);
    res.status(201).json({ success: true, data: designation });
  } catch (error) {
    console.error('Error creating designation:', error);
    res.status(500).json({ success: false, message: 'Failed to create designation', error });
  }
};

exports.updateDesignation = async (req, res) => {
  const { id } = req.params;
  const { name, departmentId } = req.body;
  try {
    const designation = await Designation.findByPk(id);
    if (!designation) {
      return res.status(404).json({ success: false, message: 'Designation not found' });
    }
    await designation.update({ name, departmentId });
    res.status(200).json({ success: true, data: designation });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update designation', error });
  }
};

exports.deleteDesignation = async (req, res) => {
  const { id } = req.params;
  try {
    const designation = await Designation.findByPk(id);
    if (!designation) {
      return res.status(404).json({ success: false, message: 'Designation not found' });
    }
    await designation.destroy();
    res.status(200).json({ success: true, message: 'Designation deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete designation', error });
  }
};
