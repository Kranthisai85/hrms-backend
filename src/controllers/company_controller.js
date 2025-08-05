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

// @desc    Test domain validation
// @route   GET /api/companies/test-domain
// @access  Public
exports.testDomain = async (req, res) => {
  try {
    // Get frontend host from headers (sent by frontend)
    const frontendHost = req.headers['x-frontend-host'] || req.headers['origin']?.replace(/^https?:\/\//, '') || req.get('host');
    const { Company } = global.db;
    
    if (!Company) {
      return res.status(500).json({ 
        success: false, 
        message: 'Database models not initialized' 
      });
    }

    const company = await Company.findOne({
      where: { domainName: frontendHost }
    });

    res.json({
      success: true,
      message: 'Domain validation test',
      data: {
        frontendHost: frontendHost,
        backendHost: req.get('host'),
        companyFound: !!company,
        company: company ? {
          id: company.id,
          name: company.name,
          domain: company.domainName
        } : null
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error testing domain validation'
    });
  }
};
