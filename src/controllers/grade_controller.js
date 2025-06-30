const asyncHandler = require('express-async-handler');
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: console.log,
});

const formatDate = (date) => {
    return date.toISOString().slice(0, 19).replace('T', ' ');
};

const Grade = require('../models/Grade')(sequelize, DataTypes);

global.db = {
    sequelize,
    Sequelize,
    Grade,
};

// Create a new department
exports.createGrade = asyncHandler(async (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({
            success: false,
            message: 'Name is required'
        });
    }

    // const defaultDescription = description || 'No Description Provided';
    const formattedTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const grade = await Grade.create({
        name,
        createdAt: formattedTime,
        updatedAt: formattedTime,
    });

    res.status(201).json({
        success: true,
        data: grade,
    });
});

// Get all departments
exports.getAllGrades = asyncHandler(async (req, res) => {
    const grades = await Grade.findAll();
    res.json({
        success: true,
        count: grades.length,
        data: grades
    });
});

// Get single department
// exports.getDepartment = asyncHandler(async (req, res) => {
//     const department = await Department.findByPk(req.params.id);

//     if (!department) {
//         return res.status(404).json({
//             success: false,
//             message: 'Department not found'
//         });
//     }

//     res.json({
//         success: true,
//         data: department
//     });
// });

// // Update department
// exports.updateDepartment = asyncHandler(async (req, res) => {
//     const department = await Department.findByPk(req.params.id);

//     if (!department) {
//         return res.status(404).json({
//             success: false,
//             message: 'Department not found'
//         });
//     }

//     const updatedDepartment = await department.update(req.body);

//     res.json({
//         success: true,
//         data: updatedDepartment
//     });
// });

// // Delete department
// exports.deleteDepartment = asyncHandler(async (req, res) => {
//     const department = await Department.findByPk(req.params.id);

//     if (!department) {
//         return res.status(404).json({
//             success: false,
//             message: 'Department not found'
//         });
//     }

//     await department.destroy();

//     res.json({
//         success: true,
//         data: {}
//     });
// });
