// models/EmployeeExperience.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
    
const EmployeeExperience = sequelize.define('EmployeeExperience', {
      id:{
          type: DataTypes.INTEGER,
           primaryKey: true,
          autoIncrement: true
        },
   employeeId:{
      type: DataTypes.STRING(50),
       allowNull: false
    },
       companyName: {
          type: DataTypes.STRING(255)
          },
    designation: {
     type: DataTypes.STRING(255)
      },
       fromDate:{
           type: DataTypes.DATE
          },
     toDate: {
     type: DataTypes.DATE
        },
    },  {
       tableName: 'EmployeeExperiences' //specify explicit table name as table might get added in Plural naming by Sequelize by default
        }
  );
    
    module.exports = EmployeeExperience;