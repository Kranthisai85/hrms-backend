const { DataTypes } = require('sequelize');

module.exports = async (sequelize) => {
  const Attendance = sequelize.define('Attendance', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'employee_id',  // Explicitly define the column name
      references: {
        model: 'Employees',
        key: 'id'
      }
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'Present',
      validate: {
        isIn: [['Present', 'Absent', 'Half Day', 'Leave', 'Holiday', 'Weekend']]
      }
    },
    checkIn: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'check_in'
    },
    checkOut: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'check_out'
    },
    remarks: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isLocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_locked'
    },
    lockedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'locked_by',
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    lockedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'locked_at'
    }
  }, {
    timestamps: true,
    tableName: 'Attendances',
    underscored: true,  // Use snake_case for column names
    indexes: [
      {
        unique: true,
        fields: ['employee_id', 'date'],
        name: 'attendance_employee_date_unique'
      }
    ]
  });

  // Setup associations
  const setupAssociations = async () => {
    const Employee = await require('./Employee')(sequelize);
    Attendance.belongsTo(Employee, { 
      foreignKey: 'employee_id',
      onDelete: 'CASCADE'
    });
  };

  await setupAssociations();

  return Attendance;
};
