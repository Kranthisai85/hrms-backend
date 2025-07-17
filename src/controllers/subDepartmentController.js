const { Sequelize, DataTypes } = require('sequelize');
const formatDate = (date) => date.toISOString().slice(0, 19).replace('T', ' ');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: process.env.DB_DIALECT,
  logging: false,
});
const SubDepartment = require('../models/SubDepartment')(sequelize, DataTypes);

global.db = global.db || {};
global.db.sequelize = sequelize;
global.db.SubDepartment = SubDepartment;

const createSubDepartment = async (req, res) => {
  try {
    const { name, department_id, description } = req.body;
    if (!name || !department_id) {
      return res.status(400).json({ success: false, message: 'Name and department_id are required' });
    }
    const defaultDescription = description || 'No Description Provided';
    const formattedTime = formatDate(new Date());
    const subDepartment = await global.db.SubDepartment.create({
      name,
      departmentId: department_id,
      description: defaultDescription,
      created_at: formattedTime,
      updated_at: formattedTime,
    });
    res.status(201).json({ success: true, data: subDepartment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error creating sub-department' });
  }
};

const getAllSubDepartments = async (req, res) => {
  try {
    const [subDepartments] = await global.db.sequelize.query(`
      SELECT 
        sd.id,
        sd.name,
        sd.description,
        sd.department_id,
        d.name AS department_name
      FROM sub_departments sd
      JOIN departments d ON sd.department_id = d.id
    `);
    res.status(200).json({ success: true, data: subDepartments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error retrieving sub-departments' });
  }
};

const getSubDepartmentsByDepartment = async (req, res) => {
  try {
    const subDepartments = await SubDepartment.findAll({
      where: { department_id: req.params.department_id },
      include: ['department'],
    });
    res.json({ success: true, count: subDepartments.length, data: subDepartments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error retrieving sub-departments by department' });
  }
};

const getSubDepartment = async (req, res) => {
  try {
    const subDepartment = await SubDepartment.findByPk(req.params.id, { include: ['department'] });
    if (!subDepartment) {
      return res.status(404).json({ success: false, message: 'Sub-department not found' });
    }
    res.json({ success: true, data: subDepartment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error retrieving sub-department' });
  }
};

const updateSubDepartment = async (req, res) => {
  try {
    const { name, department_id, description } = req.body;
    if (!name || !department_id) {
      return res.status(400).json({ success: false, message: 'Name and department_id are required' });
    }
    const subDepartment = await SubDepartment.findByPk(req.params.id);
    if (!subDepartment) {
      return res.status(404).json({ success: false, message: 'Sub-department not found' });
    }
    const updatedSubDepartment = await subDepartment.update({
      name,
      departmentId: department_id,
      description,
    });
    res.json({ success: true, data: updatedSubDepartment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error updating sub-department' });
  }
};

const deleteSubDepartment = async (req, res) => {
  try {
    const subDepartment = await SubDepartment.findByPk(req.params.id);
    if (!subDepartment) {
      return res.status(404).json({ success: false, message: 'Sub-department not found' });
    }
    await subDepartment.destroy();
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error deleting sub-department' });
  }
};

module.exports = {
  createSubDepartment,
  getSubDepartments: getAllSubDepartments,
  getSubDepartmentsByDepartment,
  getSubDepartment,
  updateSubDepartment,
  deleteSubDepartment,
};
