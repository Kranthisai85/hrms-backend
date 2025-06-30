const { DataTypes } = require('sequelize');

module.exports = async (sequelize) => {
    const Employee = sequelize.define(
        'Employee',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'user_id',
            },
            employeeId: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                field: 'employee_id',
            },
            departmentId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'department_id',
            },
            designationId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'designation_id',
            },
            branchId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'branch_id',
            },
            subDepartmentId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                field: 'sub_department_id',
            },
            gradeId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                field: 'grade_id',
            },
            categoryId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                field: 'category_id',
            },
            reportingManagerId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                field: 'reporting_manager_id',
            },
            joiningDate: {
                type: DataTypes.DATEONLY,
                allowNull: false,
                field: 'joining_date',
            },
            employmentStatus: {
                type: DataTypes.ENUM('Active', 'Inactive', 'On Leave', 'Terminated', 'Probation', 'Confirmed'),
                allowNull: false,
                defaultValue: 'Probation',
                field: 'employment_status',
            },
            employmentType: {
                type: DataTypes.ENUM('Full-time', 'Part-time', 'Contract', 'Intern'),
                allowNull: false,
                field: 'employment_type',
            },
            workSchedule: {
                type: DataTypes.ENUM('Regular', 'Shift', 'Flexible'),
                allowNull: true,
                defaultValue: 'Regular',
                field: 'work_schedule',
            },
            basicSalary: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: true,
                defaultValue: 0.0,
                field: 'basic_salary',
            },
            bankName: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'bank_name',
            },
            accountNumber: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'account_number',
            },
            ifscCode: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'ifsc_code',
            },
            panNumber: {
                type: DataTypes.STRING,
                allowNull: false,
                field: 'pan_number',
            },
            aadharNumber: {
                type: DataTypes.STRING,
                allowNull: false,
                field: 'aadhar_number',
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                validate: {
                    isEmail: true,
                },
            },
            inviteSent: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                field: 'invite_sent',
            },
            confirmationDate: {
                type: DataTypes.DATEONLY,
                allowNull: true,
                field: 'confirmation_date',
            },
            resignationDate: {
                type: DataTypes.DATEONLY,
                allowNull: true,
                field: 'resignation_date',
            },
            relievedDate: {
                type: DataTypes.DATEONLY,
                allowNull: true,
                field: 'relieved_date',
            },
            reason: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
        },
        {
            timestamps: true,
            tableName: 'Employees',
            underscored: true,
        }
    );

    Employee.associate = (models) => {
        Employee.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
        Employee.belongsTo(models.Department, { foreignKey: 'department_id', as: 'department' });
        Employee.belongsTo(models.Designation, { foreignKey: 'designation_id', as: 'designation' });
        Employee.belongsTo(models.Branch, { foreignKey: 'branch_id', as: 'branch' });
        Employee.belongsTo(models.SubDepartment, { foreignKey: 'sub_department_id', as: 'subDepartment' });
        Employee.belongsTo(models.Grade, { foreignKey: 'grade_id', as: 'grade' });
        Employee.belongsTo(models.Category, { foreignKey: 'category_id', as: 'category' });
        Employee.belongsTo(models.Employee, { foreignKey: 'reporting_manager_id', as: 'reportingManager' });
    };

    return Employee;
};