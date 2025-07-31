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

const Grade = require('../models/Grade')(sequelize, DataTypes);

global.db = {
    sequelize,
    Sequelize,
    Grade,
};

exports.createGrade = async (req, res) => {
    try {
        const { name } = req.body;
        const companyId = req.user.companyId;
        if (!name || !companyId) {
            return res.status(400).json({ success: false, message: 'Name and companyId are required' });
        }
        const formattedTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const grade = await Grade.create({
            name,
            companyId,
            createdAt: formattedTime,
            updatedAt: formattedTime,
        });
        res.status(201).json({ success: true, data: grade });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Error creating grade' });
    }
};

exports.getAllGrades = async (req, res) => {
    try {
        const grades = await Grade.findAll({ where: { companyId: req.user.companyId } });
        res.json({ success: true, count: grades.length, data: grades });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Error retrieving grades' });
    }
};

exports.updateGrade = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const companyId = req.user.companyId;

        if (!name) {
            return res.status(400).json({ success: false, message: 'Name is required' });
        }

        const grade = await Grade.findOne({ 
            where: { 
                id: id,
                companyId: companyId 
            } 
        });

        if (!grade) {
            return res.status(404).json({ success: false, message: 'Grade not found' });
        }

        const formattedTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
        
        await grade.update({
            name,
            updatedAt: formattedTime,
        });

        res.json({ success: true, data: grade });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Error updating grade' });
    }
};

exports.deleteGrade = async (req, res) => {
    try {
        const { id } = req.params;
        const companyId = req.user.companyId;

        const grade = await Grade.findOne({ 
            where: { 
                id: id,
                companyId: companyId 
            } 
        });

        if (!grade) {
            return res.status(404).json({ success: false, message: 'Grade not found' });
        }

        await grade.destroy();

        res.json({ success: true, message: 'Grade deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Error deleting grade' });
    }
};
