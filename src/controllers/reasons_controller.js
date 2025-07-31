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

const Reasons = require('../models/Reasons')(sequelize, DataTypes);

global.db = {
    sequelize,
    Sequelize,
    Reasons,
};

exports.createReasons = async (req, res) => {
    try {
        const { name, type } = req.body;
        const companyId = req.user.companyId;
        if (!name && !type) {
            return res.status(400).json({ success: false, message: 'Name is required' });
        }
        if (!companyId) {
            return res.status(400).json({ success: false, message: 'companyId is required' });
        }
        const formattedTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const reason = await Reasons.create({
            name,
            type,
            companyId,
            createdAt: formattedTime,
            updatedAt: formattedTime,
        });
        res.status(201).json({ success: true, data: reason });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Error creating reason' });
    }
};

exports.getAllReasons = async (req, res) => {
    try {
        const reasons = await Reasons.findAll({ where: { companyId: req.user.companyId } });
        res.json({ success: true, count: reasons.length, data: reasons });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Error retrieving reasons' });
    }
};

exports.getAllTypeReasons = async (req, res) => {
    try {
        const reasons = await Reasons.findAll({ where: { type: req.params.type } });
        res.json({ success: true, count: reasons.length, data: reasons });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Error retrieving reasons by type' });
    }
};

exports.updateReason = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, type } = req.body;
        const companyId = req.user.companyId;

        if (!name) {
            return res.status(400).json({ success: false, message: 'Name is required' });
        }

        const reason = await Reasons.findOne({ 
            where: { 
                id: id,
                companyId: companyId 
            } 
        });

        if (!reason) {
            return res.status(404).json({ success: false, message: 'Reason not found' });
        }

        const formattedTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
        
        await reason.update({
            name,
            type,
            updatedAt: formattedTime,
        });

        res.json({ success: true, data: reason });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Error updating reason' });
    }
};

exports.deleteReason = async (req, res) => {
    try {
        const { id } = req.params;
        const companyId = req.user.companyId;

        const reason = await Reasons.findOne({ 
            where: { 
                id: id,
                companyId: companyId 
            } 
        });

        if (!reason) {
            return res.status(404).json({ success: false, message: 'Reason not found' });
        }

        await reason.destroy();

        res.json({ success: true, message: 'Reason deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Error deleting reason' });
    }
};
