const asyncHandler = require('express-async-handler');
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: false,
});

const Company = require('../models/Company')(sequelize, DataTypes);

global.db = {
    sequelize,
    Sequelize,
    Company,
};

exports.getOneCompany = async (req, res) => {
    try {
        const company = await Company.findOne({ where: { id: req.params.id } });
        if (!company) {
            return res.status(404).json({ success: false, message: 'Company not found' });
        }
        res.json({ success: true, company: company });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Error retrieving company' });
    }
};
