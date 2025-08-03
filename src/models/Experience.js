// models/Experience.js
module.exports = (sequelize, DataTypes) => {
    const Experience = sequelize.define('Experience', {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      employee_id: { type: DataTypes.INTEGER, allowNull: false },
      user_id: { type: DataTypes.INTEGER, allowNull: false },
      companyName: DataTypes.STRING,
      designation: DataTypes.STRING,
      fromDate: DataTypes.DATEONLY,
      toDate: DataTypes.DATEONLY,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    }, {
      tableName: 'experiences',
      timestamps: true,
    });
  
    Experience.associate = (models) => {
      Experience.belongsTo(models.Employee, { foreignKey: 'employee_id', as: 'employee' });
      Experience.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    };
  
    return Experience;
  };