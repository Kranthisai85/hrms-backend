// models/SubDepartment.js
module.exports = (sequelize, DataTypes) => {
  const SubDepartment = sequelize.define('SubDepartment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    departmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'department_id',
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
  }, {
    tableName: 'SubDepartments',
    timestamps: false,
  });

  // Add association here
  SubDepartment.associate = (models) => {
    SubDepartment.belongsTo(models.Department, {
      foreignKey: 'departmentId',
      as: 'department',
    });
    SubDepartment.hasMany(models.Employee, {
      foreignKey: 'subDepartmentId',
      as: 'employees',
    });
  };

  return SubDepartment;
};
