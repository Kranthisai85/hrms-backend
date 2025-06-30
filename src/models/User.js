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
        allowNull: true, // Changed to allow null
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
        allowNull: true, // Moved from Employee
      },
      gender: {
        type: DataTypes.ENUM('Male', 'Female', 'Other'),
        allowNull: true, // Moved from Employee
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
    },
    {
      timestamps: true,
      tableName: 'Users',
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
    console.log('Checking password:', {
      provided: password,
      stored: this.password,
      userId: this.id,
      email: this.email,
    });
    const isMatch = await bcrypt.compare(password, this.password);
    console.log('Password match result:', isMatch);
    return isMatch;
  };

  // Add findByCredentials method
  User.findByCredentials = async function (email, password) {
    console.log('Finding user by credentials:', { email });
    const user = await this.findOne({ where: { email } });
    if (!user) {
      console.log('User not found:', email);
      throw new Error('Invalid credentials');
    }
    const isMatch = await user.checkPassword(password);
    if (!isMatch) {
      console.log('Invalid password for user:', email);
      throw new Error('Invalid credentials');
    }
    if (user.status !== 'Active') {
      console.log('Inactive user attempted login:', email);
      throw new Error('Account is not active');
    }
    console.log('User authenticated successfully:', {
      id: user.id,
      email: user.email,
      role: user.role,
    });
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