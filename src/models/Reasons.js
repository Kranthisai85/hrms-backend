module.exports = (sequelize, DataTypes) => {
    const Reasons = sequelize.define('Reasons', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        type: {
            type: DataTypes.ENUM('resignation', 'termination', 'other'),
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
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
        tableName: 'reasons',
        timestamps: false, // because we're manually defining created_at and updated_at
        underscored: true, // makes field names use snake_case
    });

    return Reasons;
};