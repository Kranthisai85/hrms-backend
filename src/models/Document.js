// models/Document.js
module.exports = (sequelize, DataTypes) => {
   const Document = sequelize.define('Document', {
     id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
     employee_id: { type: DataTypes.INTEGER, allowNull: false },
     documentName: DataTypes.STRING,
     fileName: DataTypes.STRING,
     size: DataTypes.INTEGER,
     lastUpdated: DataTypes.DATE,
     comment: DataTypes.TEXT,
   }, {
     tableName: 'documents',
     timestamps: true,
   });
 
   Document.associate = (models) => {
     Document.belongsTo(models.Employee, { foreignKey: 'employee_id', as: 'employee' });
   };
 
   return Document;
 };