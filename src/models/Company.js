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
            field: 'code',
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'name',
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isEmail: true,
            },
            field: 'email',
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'phone',
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'password',
        },
        contactPerson: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'contact_person',
        },
        address: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'address',
        },
        website: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'website',
        },
        domainName: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'domain_name',
        },
        superAdminID: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'super_admin_id',
        },
        logo: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'logo',
        },
        pfCode: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'pf_code',
        },
        esiCode: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'esi_code',
        },
        labourLicense: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'labour_license',
        },
        inviteAdmin: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'invite_admin',
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
            field: 'created_at',
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
            field: 'updated_at',
        },
    }, {
        tableName: 'companies',
        timestamps: true,
        underscored: true,
    });

    return Company;
};
