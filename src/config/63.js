const { Sequelize } = require('sequelize');
require('dotenv').config();

// Primary database
const primaryDB = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT || 'mysql',
  }
);

// Secondary database
const secondaryDB = new Sequelize(
  process.env.SECONDARY_DB_NAME,
  process.env.SECONDARY_DB_USER,
  process.env.SECONDARY_DB_PASS,
  {
    host: process.env.SECONDARY_DB_HOST,
    dialect: process.env.SECONDARY_DB_DIALECT || 'mysql',
  }
);

// Function to initialize both databases
const initializeDatabase = async () => {
  try {
    await primaryDB.authenticate();
    console.log('Primary database connected successfully.');

    await secondaryDB.authenticate();
    console.log('Secondary database connected successfully.');
  } catch (error) {
    console.error('Unable to connect to the databases:', error);
    throw error;
  }
};

module.exports = { primaryDB, secondaryDB, initializeDatabase };