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

const Category = require('../models/Category')(sequelize, DataTypes);

global.db = {
    sequelize,
    Sequelize,
    Category,
};

exports.createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const companyId = req.user.companyId;
        if (!name || !companyId) {
            return res.status(400).json({ success: false, message: 'Name and companyId are required' });
        }
        const formattedTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const category = await Category.create({
            name,
            companyId,
            createdAt: formattedTime,
            updatedAt: formattedTime,
        });
        res.status(201).json({ success: true, data: category });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Error creating category' });
    }
};

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.findAll({
            where: { companyId: req.user.companyId }
        });
        res.json({ success: true, count: categories.length, data: categories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Error retrieving categories' });
    }
};
