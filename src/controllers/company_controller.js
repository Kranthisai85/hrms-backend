const asyncHandler = require('express-async-handler');
const { Sequelize, DataTypes } = require('sequelize');
// const Company = require('../models/Company');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: console.log,
});

const Company = require('../models/Company')(sequelize, DataTypes);

global.db = {
    sequelize,
    Sequelize,
    Company,
};

// Get single department
exports.getOneCompany = asyncHandler(async (req, res) => {
    const company = await Company.findOne({
        where: { id: 8 }
    });

    if (!company) {
        return res.status(404).json({
            success: false,
            message: 'Company not found'
        });
    }

    res.json({
        success: true,
        data: company
    });
});

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
