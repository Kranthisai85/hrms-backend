const asyncHandler = require('express-async-handler');
const formatDate = (date) => date.toISOString().slice(0, 19).replace('T', ' ');
const { Sequelize, DataTypes } = require('sequelize');


// Use the global db instance that's initialized in app.js
// const { sequelize, Department, SubDepartment } = global.db;
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: process.env.DB_DIALECT,
  logging: console.log,
});
// --- Controller Functions ---
const SubDepartment = require('../models/SubDepartment')(sequelize, DataTypes);

const createSubDepartment = asyncHandler(async (req, res) => {
  console.log('SubDepartment model:', global.db.SubDepartment);
  console.log("Request Body:", req.body);

  const { name, department_id, description } = req.body;

  if (!name || !department_id) {
    return res.status(400).json({
      success: false,
      message: 'Name and department_id are required',
    });
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

  res.status(201).json({
    success: true,
    data: subDepartment,
  });
});

const getAllSubDepartments = asyncHandler(async (req, res) => {
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
  res.status(200).json({
    success: true,
    data: subDepartments,
  });
});

const getSubDepartmentsByDepartment = asyncHandler(async (req, res) => {
  const subDepartments = await SubDepartment.findAll({
    where: { department_id: req.params.department_id },
    include: ['department'],
  });

  res.json({
    success: true,
    count: subDepartments.length,
    data: subDepartments,
  });
});

const getSubDepartment = asyncHandler(async (req, res) => {
  const subDepartment = await SubDepartment.findByPk(req.params.id, {
    include: ['department'],
  });

  if (!subDepartment) {
    return res.status(404).json({
      success: false,
      message: 'Sub-department not found',
    });
  }

  res.json({
    success: true,
    data: subDepartment,
  });
});

const updateSubDepartment = asyncHandler(async (req, res) => {
  const { name, department_id, description } = req.body;

  if (!name || !department_id) {
    return res.status(400).json({
      success: false,
      message: 'Name and department_id are required',
    });
  }

  const subDepartment = await SubDepartment.findByPk(req.params.id);

  if (!subDepartment) {
    return res.status(404).json({
      success: false,
      message: 'Sub-department not found',
    });
  }

  const updatedSubDepartment = await subDepartment.update({
    name,
    departmentId: department_id,
    description,
  });

  res.json({
    success: true,
    data: updatedSubDepartment,
  });
});

const deleteSubDepartment = asyncHandler(async (req, res) => {
  const subDepartment = await SubDepartment.findByPk(req.params.id);

  if (!subDepartment) {
    return res.status(404).json({
      success: false,
      message: 'Sub-department not found',
    });
  }

  await subDepartment.destroy();

  res.json({
    success: true,
    data: {},
  });
});

// --- Exports ---
module.exports = {
  createSubDepartment,
  getSubDepartments: getAllSubDepartments,
  getSubDepartmentsByDepartment,
  getSubDepartment,
  updateSubDepartment,
  deleteSubDepartment,
};
