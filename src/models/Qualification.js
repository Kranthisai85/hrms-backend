// models/Qualification.js
module.exports = (sequelize, DataTypes) => {
    const Qualification = sequelize.define('Qualification', {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      employee_id: { type: DataTypes.INTEGER, allowNull: false },
      user_id: { type: DataTypes.INTEGER, allowNull: false },
      degree: DataTypes.STRING,
      yearOfPassing: DataTypes.INTEGER,
      institution: DataTypes.STRING,
      percentage: DataTypes.BIGINT,
      specialization: DataTypes.STRING,
    }, {
      tableName: 'qualifications',
      timestamps: true,
    });
  
    Qualification.associate = (models) => {
      Qualification.belongsTo(models.Employee, { foreignKey: 'employee_id', as: 'employee' });
      Qualification.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    };
  
    return Qualification;
  };