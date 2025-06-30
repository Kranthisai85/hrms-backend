// models/company.js

module.exports = (sequelize, DataTypes) => {
    const Company = sequelize.define('Company', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        code: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        address: {
            type: DataTypes.TEXT,
        },
        email: {
            type: DataTypes.STRING,
            validate: {
                isEmail: true,
            },
        },
        phone: {
            type: DataTypes.STRING,
        },
        password: {
            type: DataTypes.STRING,
        },
        pfCode: {
            type: DataTypes.STRING,
            field: 'pfCode',
        },
        esiCode: {
            type: DataTypes.STRING,
            field: 'esiCode',
        },
        labourLicense: {
            type: DataTypes.STRING,
        },
        domainName: {
            type: DataTypes.STRING,
        },
        contactPerson: {
            type: DataTypes.STRING,
        },
        website: {
            type: DataTypes.STRING,
        },
        superAdminID: {
            type: DataTypes.STRING,
        },
        logo: {
            type: DataTypes.STRING,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        },
        inviteAdmin: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    }, {
        tableName: 'companies',
        timestamps: true,
        underscored: false,
    });

    return Company;
};
