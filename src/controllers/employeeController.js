const bcrypt = require('bcryptjs');
const XLSX = require('xlsx');

// @desc    Create new employee
// @route   POST /api/employees
// @access  Private/Admin
exports.createEmployee = async (req, res) => {
  try {
    const {
      empCode,
      name, // Map 'name' to 'firstName' for User model
      gender,
      dateOfBirth,
      branch: branchId,
      designation: designationId,
      department: departmentId,
      subDepartment: subDepartmentId,
      grade: gradeId,
      category: categoryId,
      reportingManager: reportingManagerId,
      employeeType: employmentType,
      employmentStatus,
      dateOfJoin: joiningDate,
      mobileNumber: phone, // Map to 'phone' for User model
      personalEmail, // Not stored, using officialEmail as email
      officialEmail,
      inviteSent,
      confirmationDate,
      resignationDate,
      relievedDate,
      reason,
      bloodGroup,
      aadhaarNo: aadharNumber,
      pan: panNumber,
    } = req.body;

    const { User, Employee, sequelize } = global.db;
    if (!User || !Employee || !sequelize) {
      return res.status(500).json({ success: false, message: 'Models not initialized' });
    }

    const companyId = req.user.companyId;
    if (!officialEmail || !branchId || !designationId || !departmentId || !joiningDate || !employmentType || !panNumber || !aadharNumber || !companyId) {
      return res.status(400).json({ success: false, message: 'Missing required fields: email, branchId, designationId, departmentId, joiningDate, employmentType, panNumber, aadharNumber, or companyId' });
    }

    const result = await sequelize.transaction(async (t) => {
      const user = await User.create(
        {
          name,
          last_name: null,
          email: personalEmail,
          password: null,
          role: 'employee',
          status: 'Active',
          phone,
          dateOfBirth,
          gender,
          bloodGroup,
          companyId: companyId
        },
        { transaction: t }
      );

      const employeeId = empCode || `EMP${String(user.id).padStart(5, '0')}`;
      const employee = await Employee.create(
        {
          userId: user.id,
          employeeId: employeeId,
          departmentId: departmentId,
          designationId: designationId,
          branchId: branchId,
          subDepartmentId: subDepartmentId,
          gradeId: gradeId,
          categoryId: categoryId,
          reportingManagerId: reportingManagerId || 2,
          joiningDate: joiningDate,
          employmentStatus: employmentStatus,
          employmentType: employmentType,
          panNumber: panNumber,
          aadharNumber: aadharNumber,
          email: officialEmail,
          invite_sent: inviteSent,
          confirmationDate: confirmationDate || null,
          resignationDate: resignationDate || null,
          relievedDate: relievedDate || null,
          reason: reason ? parseInt(reason) : null,
        },
        { transaction: t }
      );

      const employeeWithUser = await Employee.findOne({
        where: { id: employee.id },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'last_name', 'email', 'role', 'status', 'phone', 'dateOfBirth', 'gender', 'blood_group', 'companyId'],
            where: { companyId: req.user.companyId }
          },
        ],
        transaction: t,
      });

      return employeeWithUser;
    });

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating employee',
    });
  }
};

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private/Admin
exports.getEmployees = async (req, res) => {
  try {
    const { Employee, User } = global.db;
    if (!Employee || !User) {
      return res.status(500).json({ success: false, message: 'Models not initialized' });
    }

    const employees = await Employee.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'lastName', 'email', 'role', 'status', 'phone', 'date_of_birth', 'gender', 'blood_group', 'companyId'],
        where: { companyId: req.user.companyId }
      }]
    });

    res.json({
      success: true,
      data: employees
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error retrieving employees'
    });
  }
};

// @desc    Get single employee
// @route   GET /api/employees/:id
// @access  Private/Admin
exports.getEmployee = async (req, res) => {
  try {
    const { 
      Employee, 
      User, 
      Address, 
      FamilyMember, 
      Qualification, 
      Experience, 
      Document, 
      Department, 
      Designation, 
      Branch, 
      SubDepartment, 
      Grade, 
      Category,
    } = global.db;
    
    if (!Employee || !User) {
      return res.status(500).json({ success: false, message: 'Models not initialized' });
    }

    const employee = await Employee.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'lastName', 'email', 'role', 'status', 'phone', 'date_of_birth', 'gender', 'blood_group', 'companyId']
        },
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name', 'description']
        },
        {
          model: Designation,
          as: 'designation',
          attributes: ['id', 'name']
        },
        {
          model: Branch,
          as: 'branch',
          attributes: ['id', 'name', 'address']
        },
        {
          model: SubDepartment,
          as: 'subDepartment',
          attributes: ['id', 'name', 'description']
        },
        {
          model: Grade,
          as: 'grade',
          attributes: ['id', 'name']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        },
        {
          model: Employee,
          as: 'reportingManager',
          attributes: ['id', 'employeeId', 'email'],
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'lastName']
          }]
        },
      ]
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Get address information
    let address = null;
    if (Address) {
      address = await Address.findOne({
        where: { user_id: employee.userId }
      });
    }

    // Get family members
    let familyMembers = [];
    if (FamilyMember) {
      familyMembers = await FamilyMember.findAll({
        where: { employee_id: employee.userId }
      });
    }

    // Get qualifications
    let qualifications = [];
    if (Qualification) {
      qualifications = await Qualification.findAll({
        where: { employee_id: employee.userId }
      });
    }

    // Get experiences
    let experiences = [];
    if (Experience) {
      experiences = await Experience.findAll({
        where: { employee_id: employee.userId }
      });
    }

    // Get documents
    let documents = [];
    if (Document) {
      documents = await Document.findAll({
        where: { employee_id: employee.userId }
      });
    }


    // Combine all data
    const employeeData = {
      ...employee.toJSON(),
      address,
      familyMembers,
      qualifications,
      experiences,
      documents,
    };

    res.json({
      success: true,
      data: employeeData
    });
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error retrieving employee'
    });
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private/Admin
exports.updateEmployee = async (req, res) => {
  try {
    const { Employee, User, Address, FamilyMember, Qualification, Experience, Document, sequelize } = global.db;
    if (!Employee || !User || !sequelize) {
      throw new Error('Models not initialized');
    }

    const result = await sequelize.transaction(async (t) => {
      const employee = await Employee.findByPk(req.params.id, {
        include: [{
          model: User,
          as: 'user'
        }],
        transaction: t
      });

      if (!employee) {
        throw new Error('Employee not found');
      }

      // Update user details if provided
      if (req.body.firstName || req.body.lastName || req.body.email) {
        await employee.user.update({
          firstName: req.body.firstName || employee.user.firstName,
          lastName: req.body.lastName || employee.user.lastName,
          email: req.body.email || employee.user.email
        }, { transaction: t });
      }

      // Update employee details
      const updateData = {};
      const employeeFields = [
        'phoneNumber', 'dateOfBirth', 'gender', 'address', 'city', 'state',
        'country', 'pinCode', 'departmentId', 'designationId', 'branchId',
        'employmentType', 'workSchedule', 'basicSalary', 'bankName',
        'accountNumber', 'ifscCode', 'panNumber', 'aadharNumber',
        'emergencyContactName', 'emergencyContactPhone', 'emergencyContactRelation',
        // Add new fields as needed (isOrphan, lessThanPrimary, isFresher, photo, etc.)
        'isOrphan', 'lessThanPrimary', 'isFresher', 'photo',
      ];
      employeeFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });
      await employee.update(updateData, { transaction: t });

      // --- Address Section ---
      const addressFields = [
        'address', 'city', 'state', 'country', 'pincode',
        'permanentAddress', 'permanentCity', 'permanentState', 'permanentCountry', 'permanentPincode'
      ];
      const addressUpdate = {};
      addressFields.forEach(f => { if (req.body[f] !== undefined) addressUpdate[f] = req.body[f]; });
      if (Object.keys(addressUpdate).length && Address) {
        const [address, created] = await Address.findOrCreate({
          where: { user_id: employee.userId },
          defaults: { user_id: employee.userId, ...addressUpdate },
          transaction: t
        });
        
        if (!created) {
          // Update existing address
          await address.update(addressUpdate, { transaction: t });
        }
      }

      // --- Family Members Section ---
      if (Array.isArray(req.body.familyMembers) && FamilyMember) {
        await FamilyMember.destroy({ where: { employee_id: employee.id }, transaction: t });
        for (const member of req.body.familyMembers) {
          await FamilyMember.create({ employee_id: employee.id, ...member }, { transaction: t });
        }
      }

      // --- Qualifications Section ---
      if (Array.isArray(req.body.qualifications) && Qualification) {
        await Qualification.destroy({ where: { employee_id: employee.id }, transaction: t });
        for (const qual of req.body.qualifications) {
          await Qualification.create({ employee_id: employee.id, ...qual }, { transaction: t });
        }
      }

      // --- Experiences Section ---
      if (Array.isArray(req.body.experiences) && Experience) {
        await Experience.destroy({ where: { employee_id: employee.id }, transaction: t });
        for (const exp of req.body.experiences) {
          await Experience.create({ employee_id: employee.id, ...exp }, { transaction: t });
        }
      }

      // --- Documents Section ---
      if (Array.isArray(req.body.documents) && Document) {
        await Document.destroy({ where: { employee_id: employee.id }, transaction: t });
        for (const doc of req.body.documents) {
          await Document.create({ employee_id: employee.id, ...doc }, { transaction: t });
        }
      }

      // Get updated employee with user details
      return await Employee.findByPk(employee.id, {
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'lastName', 'email', 'role', 'status', 'phone', 'date_of_birth', 'gender', 'blood_group']
        }],
        transaction: t
      });
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({
      success: false,
      message: error.message === 'Employee not found' ? error.message : 'Error updating employee'
    });
  }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private/Admin
exports.deleteEmployee = async (req, res) => {
  try {
    const { Employee, User, sequelize } = global.db;
    if (!Employee || !User || !sequelize) {
      throw new Error('Models not initialized');
    }

    await sequelize.transaction(async (t) => {
      const employee = await Employee.findByPk(req.params.id, {
        include: [{
          model: User,
          as: 'user'
        }],
        transaction: t
      });

      if (!employee) {
        throw new Error('Employee not found');
      }

      // Delete employee and associated user
      await employee.destroy({ transaction: t });
      await employee.user.destroy({ transaction: t });
    });

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({
      success: false,
      message: error.message === 'Employee not found' ? error.message : 'Error deleting employee'
    });
  }
};

// @desc    Import employees from Excel
// @route   POST /api/employees/import
// @access  Private/Admin
exports.importEmployees = async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    const { Employee, User, sequelize } = global.db;
    if (!Employee || !User || !sequelize) {
      throw new Error('Models not initialized');
    }

    const companyId = req.user.companyId;
    const file = req.files.file;
    const workbook = XLSX.read(file.data);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    const results = await sequelize.transaction(async (t) => {
      const createdEmployees = [];

      for (const row of data) {
        // Create user first
        const user = await User.create({
          firstName: row.firstName,
          lastName: row.lastName,
          email: row.email,
          password: await bcrypt.hash(row.password || 'defaultPassword123', 10),
          role: 'employee',
          status: 'Active',
          companyId: companyId
        }, { transaction: t });

        // Generate employee ID
        const employeeId = `EMP${String(user.id).padStart(5, '0')}`;

        // Create employee with user association
        const employee = await Employee.create({
          userId: user.id,
          employeeId,
          ...row,
          status: 'Active'
        }, { transaction: t });

        const employeeWithUser = await Employee.findOne({
          where: { id: employee.id },
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'lastName', 'email', 'role', 'status', 'phone', 'date_of_birth', 'gender', 'blood_group', 'companyId'],
            where: { companyId: req.user.companyId }
          }],
          transaction: t
        });

        createdEmployees.push(employeeWithUser);
      }

      return createdEmployees;
    });

    res.status(201).json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('Import employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Error importing employees',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Export employees to Excel
// @route   GET /api/employees/export
// @access  Private/Admin
exports.exportEmployees = async (req, res) => {
  try {
    const { Employee, User } = global.db;
    if (!Employee || !User) {
      throw new Error('Models not initialized');
    }

    const employees = await Employee.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'lastName', 'email', 'role', 'status', 'phone', 'date_of_birth', 'gender', 'blood_group']
      }]
    });

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(employees.map(emp => ({
      'Employee ID': emp.employeeId,
      'First Name': emp.firstName,
      'Last Name': emp.lastName,
      'Email': emp.email,
      'Phone Number': emp.phoneNumber,
      'Date of Birth': emp.dateOfBirth,
      'Gender': emp.gender,
      'Address': emp.address,
      'City': emp.city,
      'State': emp.state,
      'Country': emp.country,
      'Pin Code': emp.pinCode,
      'Department ID': emp.departmentId,
      'Designation ID': emp.designationId,
      'Branch ID': emp.branchId,
      'Joining Date': emp.joiningDate,
      'Employment Type': emp.employmentType,
      'Work Schedule': emp.workSchedule,
      'Basic Salary': emp.basicSalary,
      'Bank Name': emp.bankName,
      'Account Number': emp.accountNumber,
      'IFSC Code': emp.ifscCode,
      'PAN Number': emp.panNumber,
      'Aadhar Number': emp.aadharNumber,
      'Emergency Contact Name': emp.emergencyContactName,
      'Emergency Contact Phone': emp.emergencyContactPhone,
      'Emergency Contact Relation': emp.emergencyContactRelation,
      'Status': emp.employmentStatus
    })));

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=employees.xlsx');
    res.send(buffer);

  } catch (error) {
    console.error('Export employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting employees',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
