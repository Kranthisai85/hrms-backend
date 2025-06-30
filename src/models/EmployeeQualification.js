// models/EmployeeQualification.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const EmployeeQualification = sequelize.define('EmployeeQualification', {
 id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
           autoIncrement: true
         },
       employeeId:{
         type: DataTypes.STRING(50),
         allowNull: false
        },
        qualification: {
         type: DataTypes.STRING(255)
       },
          yearOfPassing: {
        type: DataTypes.INTEGER
       },
        institution:{
             type: DataTypes.STRING(255)
          }
    },{
        tableName:'EmployeeQualifications' //specify explicit table name as table might get added in Plural naming by Sequelize by default
  }
);
   module.exports = EmployeeQualification;