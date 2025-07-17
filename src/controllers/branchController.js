const asyncHandler = require('express-async-handler');
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

const Branch = require('../models/Branch')(sequelize, DataTypes);
global.db = {
  sequelize,
  Sequelize,
  Branch,
};

exports.createBranch = async (req, res) => {
  try {
    const { name, address } = req.body;
    const companyId = req.user.companyId;
    if (!name || !companyId) {
      return res.status(400).json({ success: false, message: 'Name and companyId are required' });
    }
    const defaultAddress = address || 'No Address Provided';
    const formattedTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const branch = await Branch.create({
      name,
      companyId,
      address: defaultAddress,
      createdAt: formattedTime,
      updatedAt: formattedTime,
    });
    res.status(201).json({ success: true, data: branch });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error creating branch' });
  }
};

exports.getBranches = async (req, res) => {
  try {
    const branches = await Branch.findAll({
      where: { companyId: req.user.companyId }
    });
    res.json({ success: true, count: branches.length, data: branches });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error retrieving branches' });
  }
};

exports.getBranch = async (req, res) => {
  try {
    const branch = await Branch.findByPk(req.params.id);
    if (!branch) {
      return res.status(404).json({ success: false, message: 'Branch not found' });
    }
    res.json({ success: true, data: branch });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error retrieving branch' });
  }
};

exports.updateBranch = async (req, res) => {
  try {
    const branch = await Branch.findByPk(req.params.id);
    if (!branch) {
      return res.status(404).json({ success: false, message: 'Branch not found' });
    }
    const updatedBranch = await branch.update(req.body);
    res.json({ success: true, data: updatedBranch });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error updating branch' });
  }
};

exports.deleteBranch = async (req, res) => {
  try {
    const branch = await Branch.findByPk(req.params.id);
    if (!branch) {
      return res.status(404).json({ success: false, message: 'Branch not found' });
    }
    await branch.destroy();
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error deleting branch' });
  }
};
