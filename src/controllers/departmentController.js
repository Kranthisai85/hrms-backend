const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: process.env.DB_DIALECT,
  logging: false,
});

const formatDate = (date) => {
  return date.toISOString().slice(0, 19).replace('T', ' ');
};

const Department = require('../models/Department')(sequelize, DataTypes);

global.db = {
  sequelize,
  Sequelize,
  Department,
};

exports.createDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;
    const companyId = req.user.companyId;
    if (!name || !companyId) {
      return res.status(400).json({ success: false, message: 'Name and companyId are required' });
    }
    const defaultDescription = description || 'No Description Provided';
    const formattedTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const department = await Department.create({
      name,
      companyId,
      description: defaultDescription,
      createdAt: formattedTime,
      updatedAt: formattedTime,
    });
    res.status(201).json({ success: true, data: department });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error creating department' });
  }
};

exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.findAll({
      where: { companyId: req.user.companyId }
    });
    res.json({ success: true, count: departments.length, data: departments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error retrieving departments' });
  }
};

exports.getDepartment = async (req, res) => {
  try {
    const department = await Department.findByPk(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }
    res.json({ success: true, data: department });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error retrieving department' });
  }
};

exports.updateDepartment = async (req, res) => {
  try {
    const department = await Department.findByPk(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }
    const updatedDepartment = await department.update(req.body);
    res.json({ success: true, data: updatedDepartment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error updating department' });
  }
};

exports.deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findByPk(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }
    await department.destroy();
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error deleting department' });
  }
};
