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

const Reasons = require('../models/Reasons')(sequelize, DataTypes);

global.db = {
    sequelize,
    Sequelize,
    Reasons,
};

// Create a new department
exports.createReasons = asyncHandler(async (req, res) => {
    const { name, type } = req.body;

    if (!name && !type) {
        return res.status(400).json({
            success: false,
            message: 'Name is required'
        });
    }

    // const defaultDescription = description || 'No Description Provided';
    const formattedTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const reason = await Reasons.create({
        name,
        type,
        createdAt: formattedTime,
        updatedAt: formattedTime,
    });

    res.status(201).json({
        success: true,
        data: reason,
    });
});

// Get all departments
exports.getAllReasons = asyncHandler(async (req, res) => {
    const reasons = await Reasons.findAll();
    res.json({
        success: true,
        count: reasons.length,
        data: reasons
    });
});

exports.getAllTypeReasons = asyncHandler(async (req, res) => {
    console.log("req.params.type");
    console.log(req.params.type);
    const reasons = await Reasons.findAll({
        where: {
            type: req.params.type
        }
    });
    res.json({
        success: true,
        count: reasons.length,
        data: reasons
    });
});

// exports.getAllResignationReasons = asyncHandler(async (req, res) => {
//     const reasons = await Reasons.findAll({
//         where: {
//             type: 'resignation'
//         }
//     });
//     res.json({
//         success: true,
//         count: reasons.length,
//         data: reasons
//     });
// });

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
