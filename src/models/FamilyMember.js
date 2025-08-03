// models/FamilyMember.js
module.exports = (sequelize, DataTypes) => {
    const FamilyMember = sequelize.define('FamilyMember', {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      employee_id: { type: DataTypes.INTEGER, allowNull: false },
      user_id: { type: DataTypes.INTEGER, allowNull: false },
      name: DataTypes.STRING,
      dateOfBirth: DataTypes.DATEONLY,
      relationship: DataTypes.STRING,
      gender: DataTypes.STRING,
      nominee: DataTypes.BOOLEAN,
      sharePercentage: DataTypes.INTEGER,
    }, {
      tableName: 'family_members',
      timestamps: true,
    });
  
    FamilyMember.associate = (models) => {
      FamilyMember.belongsTo(models.Employee, { foreignKey: 'employee_id', as: 'employee' });
      FamilyMember.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    };
  
    return FamilyMember;
  };