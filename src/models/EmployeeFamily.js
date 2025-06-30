// models/EmployeeFamily.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const EmployeeFamily = sequelize.define('EmployeeFamily', {
  id: {
    type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
   employeeId: {
      type: DataTypes.STRING(50),
         allowNull: false
   },
      name: {
        type: DataTypes.STRING(255)
        },
       relationship: {
            type: DataTypes.STRING(100)
         },
     dateOfBirth:{
         type: DataTypes.DATE,
        },
     nominee: {
         type: DataTypes.BOOLEAN,
     defaultValue: false
        },
      sharePercentage: {
         type: DataTypes.INTEGER
       },
        gender:{
             type: DataTypes.ENUM('male', 'female', 'other')
           }
  },{
    tableName:'EmployeeFamily'  //specify explicit table name as table might get added in Plural naming by Sequelize by default
}
);

module.exports = EmployeeFamily;