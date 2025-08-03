// models/Address.js
module.exports = (sequelize, DataTypes) => {
    const Address = sequelize.define('Address', {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      user_id: { 
        type: DataTypes.INTEGER, 
        allowNull: false,
        unique: true
      },
      address: DataTypes.STRING,
      city: DataTypes.STRING,
      state: DataTypes.STRING,
      country: DataTypes.STRING,
      pincode: DataTypes.STRING,
      permanentAddress: DataTypes.STRING,
      permanentCity: DataTypes.STRING,
      permanentState: DataTypes.STRING,
      permanentCountry: DataTypes.STRING,
      permanentPincode: DataTypes.STRING,
    }, {
      tableName: 'address',
      timestamps: true,
    });
  
    Address.associate = (models) => {
      Address.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    };
  
    return Address;
  };