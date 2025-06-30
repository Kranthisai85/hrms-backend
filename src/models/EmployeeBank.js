// models/EmployeeBank.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
    
const EmployeeBank = sequelize.define('EmployeeBank', {
       id: {
        type: DataTypes.INTEGER,
           primaryKey: true,
         autoIncrement: true
       },
     employeeId:{
        type: DataTypes.STRING(50),
          allowNull: false
        },
  bankName: {
            type: DataTypes.STRING(255)
         },
      bankAccountNo: {
         type: DataTypes.STRING(255)
        },
       ifscCode: {
          type: DataTypes.STRING(255)
          }
 }, {
     tableName:'EmployeeBank'  //specify explicit table name as table might get added in Plural naming by Sequelize by default
}
 );

module.exports = EmployeeBank;