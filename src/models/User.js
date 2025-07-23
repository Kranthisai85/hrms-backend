const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = async (sequelize) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'name',
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
        field: 'last_name',
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      role: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'employee',
        validate: {
          isIn: [['employee', 'admin', 'super_admin']],
        },
      },
      dateOfBirth: {
        type: DataTypes.DATEONLY,
        field: 'date_of_birth',
        allowNull: true,
      },
      gender: {
        type: DataTypes.ENUM('Male', 'Female', 'Other'),
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      bloodGroup: {
        type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
        field: 'blood_group',
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'Active',
        validate: {
          isIn: [['Active', 'Inactive', 'Suspended']],
        },
      },
  
      // ✅ Add company_id as a foreign key
      companyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'company_id',
        references: {
          model: 'companies', // table name
          key: 'id',
        },
      },
  
      // ✅ Add created_at and updated_at
      createdAt: {
        type: DataTypes.DATE,
        field: 'created_at',
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: 'updated_at',
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      timestamps: true,
      tableName: 'users',
      underscored: true,
      hooks: {
        beforeCreate: async (user) => {
          if (user.password) {
            user.password = await bcrypt.hash(user.password, 10);
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed('password') && user.password) {
            user.password = await bcrypt.hash(user.password, 10);
          }
        },
      },
    }
  );

  // Instance method to check password
  User.prototype.checkPassword = async function (password) {
    if (!this.password) {
      throw new Error('No password set for this user');
    }
    // No logging of passwords for security
    return await bcrypt.compare(password, this.password);
  };

  // Add findByCredentials method
  User.findByCredentials = async function (email, password) {
    // No logging of credentials for security
    const user = await this.findOne({ where: { email } });
    if (!user) {
      throw new Error('Invalid credentials');
    }
    const isMatch = await user.checkPassword(password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }
    if (user.status !== 'Active') {
      throw new Error('Account is not active');
    }
    return user;
  };

  // Define associations
  User.associate = (models) => {
    User.hasOne(models.Employee, {
      foreignKey: 'userId',
      as: 'employee',
    });
  };

  return User;
};