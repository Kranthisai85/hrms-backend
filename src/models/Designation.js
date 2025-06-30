module.exports = (sequelize, DataTypes) => {
  const Designation = sequelize.define('Designation', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    departmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'department_id', // Map to the database column
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'company_id', // Map to the database column
    },
  }, {
    tableName: 'designations', // Ensure this matches the table name in the database
    timestamps: true, // Automatically manage createdAt and updatedAt
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return Designation;
};