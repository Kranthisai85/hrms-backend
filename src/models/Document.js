// models/Document.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
    
const Document = sequelize.define('Document', {
      id:{
            type:DataTypes.INTEGER,
           primaryKey: true,
           autoIncrement: true
           },
    reference_table:{
       type: DataTypes.STRING(50),
         allowNull: false
         },
        reference_id:{
          type: DataTypes.INTEGER,
           allowNull: false
         },
     documentName:{
            type: DataTypes.STRING(255)
         },
      fileName:{
       type: DataTypes.STRING(255)
       },
       comment:{
          type: DataTypes.STRING(500)
            },
    lastUpdated:{
            type: DataTypes.DATE,
                defaultValue: DataTypes.NOW
            },
           fileSize:{
              type: DataTypes.INTEGER
           }
        },  {
     tableName:'documents'  //specify explicit table name as table might get added in Plural naming by Sequelize by default
        }
    );

  module.exports = Document;