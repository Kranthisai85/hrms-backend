const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: process.env.DB_DIALECT,
  logging: false,
});
const Designation = require('../models/Designation')(sequelize, DataTypes);

exports.getDesignation = async (req, res) => {
  try {
    const { id } = req.params;
    const designation = await Designation.findByPk(id);
    if (!designation) {
      return res.status(404).json({ success: false, message: 'Designation not found' });
    }
    res.status(200).json({ success: true, data: designation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch designation' });
  }
};

exports.getAllDesignations = async (req, res) => {
  try {
    const designations = await Designation.findAll({ where: { companyId: req.user.companyId } });
    res.status(200).json({ success: true, data: designations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch designations' });
  }
};

exports.createDesignation = async (req, res) => {
  try {
    const { name, departmentId } = req.body;
    const companyId = req.user.companyId;
    if (!name || !departmentId || !companyId) {
      return res.status(400).json({ success: false, message: 'Name, departmentId, and companyId are required' });
    }
    const designation = await Designation.create({ name, departmentId, companyId });
    res.status(201).json({ success: true, data: designation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to create designation' });
  }
};

exports.updateDesignation = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, departmentId } = req.body;
    const designation = await Designation.findByPk(id);
    if (!designation) {
      return res.status(404).json({ success: false, message: 'Designation not found' });
    }
    await designation.update({ name, departmentId });
    res.status(200).json({ success: true, data: designation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to update designation' });
  }
};

exports.deleteDesignation = async (req, res) => {
  try {
    const { id } = req.params;
    const designation = await Designation.findByPk(id);
    if (!designation) {
      return res.status(404).json({ success: false, message: 'Designation not found' });
    }
    await designation.destroy();
    res.status(200).json({ success: true, message: 'Designation deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to delete designation' });
  }
};
