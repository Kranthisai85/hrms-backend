const { DataTypes } = require('sequelize');

module.exports = async (sequelize) => {
  const Payroll = sequelize.define('Payroll', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Employees',
        key: 'id'
      }
    },
    month: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 12
      }
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    basicSalary: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    hra: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    conveyanceAllowance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    medicalAllowance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    otherAllowances: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    grossSalary: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    pf: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    esi: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    tds: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    otherDeductions: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    netSalary: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'Draft',
      validate: {
        isIn: [['Draft', 'Generated', 'Approved', 'Paid']]
      }
    },
    paymentDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    paymentReference: {
      type: DataTypes.STRING,
      allowNull: true
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    generatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    approvedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    timestamps: true,
    tableName: 'Payrolls'
  });

  // Define associations after all models are defined
  const setupAssociations = async () => {
    const Employee = await require('./Employee')(sequelize);
    Payroll.belongsTo(Employee, { 
      foreignKey: 'employeeId',
      onDelete: 'CASCADE'
    });
  };

  await setupAssociations();

  return Payroll;
};
