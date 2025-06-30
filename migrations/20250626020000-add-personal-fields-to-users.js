'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Step 1: Add the new columns to the Users table
        await queryInterface.addColumn('Users', 'date_of_birth', {
            type: Sequelize.DataTypes.DATEONLY,
            allowNull: true,
        });
        await queryInterface.addColumn('Users', 'gender', {
            type: Sequelize.DataTypes.ENUM('Male', 'Female', 'Other'),
            allowNull: true,
        });
    },

    down: async (queryInterface, Sequelize) => {
        // Step 1: Remove the added columns from the Users table
        await queryInterface.removeColumn('Users', 'gender');
        await queryInterface.removeColumn('Users', 'date_of_birth');
        await queryInterface.removeColumn('Users', 'phone');
    },
};