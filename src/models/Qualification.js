// models/Qualification.js
module.exports = (sequelize, DataTypes) => {
    const Qualification = sequelize.define('Qualification', {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      employee_id: { type: DataTypes.INTEGER, allowNull: false },
      qualification: DataTypes.STRING,
      yearOfPassing: DataTypes.INTEGER,
      institution: DataTypes.STRING,
    }, {
      tableName: 'qualifications',
      timestamps: true,
    });
  
    Qualification.associate = (models) => {
      Qualification.belongsTo(models.Employee, { foreignKey: 'employee_id', as: 'employee' });
    };
  
    return Qualification;
  };