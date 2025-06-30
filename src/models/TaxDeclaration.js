const { DataTypes } = require('sequelize');

module.exports = async (sequelize) => {
  const TaxDeclaration = sequelize.define('TaxDeclaration', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'employee_id',
      references: {
        model: 'Employees',
        key: 'id'
      }
    },
    financialYear: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'financial_year',
      validate: {
        is: /^\d{4}-\d{2}$/ // Format: 2023-24
      }
    },
    regime: {
      type: DataTypes.STRING(10),
      allowNull: false,
      validate: {
        isIn: [['old', 'new']]
      }
    },
    investments: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
      comment: 'Section 80C, 80D, etc. investments'
    },
    rentDetails: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'rent_details',
      defaultValue: {},
      comment: 'HRA exemption details'
    },
    otherIncome: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'other_income',
      defaultValue: {},
      comment: 'Income from other sources'
    },
    proofs: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {},
      comment: 'Uploaded proof documents'
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'Draft',
      validate: {
        isIn: [['Draft', 'Pending', 'Approved', 'Rejected']]
      }
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    submittedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'submitted_at'
    },
    reviewedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'reviewed_by',
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'reviewed_at'
    }
  }, {
    timestamps: true,
    tableName: 'TaxDeclarations',
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['employee_id', 'financial_year'],
        name: 'tax_declaration_unique_year'
      }
    ]
  });

  // Setup associations
  const setupAssociations = async () => {
    const Employee = await require('./Employee')(sequelize);
    TaxDeclaration.belongsTo(Employee, { 
      foreignKey: 'employee_id',
      onDelete: 'CASCADE'
    });
  };

  await setupAssociations();

  return TaxDeclaration;
};
