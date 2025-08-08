const bcrypt = require('bcryptjs');
const XLSX = require('xlsx');
const { Op } = require('sequelize');

// Helper function to check unique constraints
const checkUniqueConstraints = async (User, Employee, data, excludeId = null, excludeUserId = null) => {
  const errors = {};
  
  // Check email uniqueness in User table
  if (data.personalEmail) {
    const userWhere = { email: data.personalEmail };
    if (excludeUserId) {
      userWhere.id = { [Op.ne]:  excludeUserId };
    }
    const existingUser = await User.findOne({ 
      where: userWhere,
      include: [{
        model: Employee,
        as: 'employee',
        attributes: ['empCode']
      }]
    });
    if (existingUser) {
      const empCode = existingUser.employee?.empCode || 'N/A';
      const userName = existingUser.name || 'Unknown';
      errors.personalEmail = `Email already exists to ${empCode} - ${userName}`;
    }
  }
  
  // Check phone uniqueness in User table
  if (data.phone) {
    const userWhere = { phone: data.phone };
    if (excludeId || excludeUserId) {
      userWhere.id = { [Op.ne]:  excludeUserId };
    }
    console.log("userWhere");
    console.log(userWhere);
    console.log("excludeId");
    console.log(excludeId);
    console.log("excludeUserId");
    console.log(excludeUserId);
    const existingUser = await User.findOne({ 
      where: userWhere,
      include: [{
        model: Employee,
        as: 'employee',
        attributes: ['empCode']
      }]
    });
    if (existingUser) {
      const empCode = existingUser.employee?.empCode || 'N/A';
      const userName = existingUser.name || 'Unknown';
      errors.phone = `Phone number already exists to ${empCode} - ${userName}`;
    }
  }
  
  // Check empCode uniqueness in Employee table
  if (data.empCode) {
    const empWhere = { empCode: data.empCode };
    if (excludeId) {
      empWhere.id = { [Op.ne]: excludeId };
    }
    const existingEmployee = await Employee.findOne({ 
      where: empWhere,
      include: [{
        model: User,
        as: 'user',
        attributes: ['name']
      }]
    });
    if (existingEmployee) {
      const empCode = existingEmployee.empCode;
      const userName = existingEmployee.user?.name || 'Unknown';
      errors.empCode = `Employee code already exists to ${empCode} - ${userName}`;
    }
  }
  
  // Check official email uniqueness in Employee table
  if (data.officialEmail) {
    const empWhere = { email: data.officialEmail };
    if (excludeId) {
      empWhere.id = { [Op.ne]: excludeId };
    }
    const existingEmployee = await Employee.findOne({ 
      where: empWhere,
      include: [{
        model: User,
        as: 'user',
        attributes: ['name']
      }]
    });
    if (existingEmployee) {
      const empCode = existingEmployee.empCode;
      const userName = existingEmployee.user?.name || 'Unknown';
      errors.officialEmail = `Official email already exists to ${empCode} - ${userName}`;
    }
  }
  
  // Check PAN number uniqueness in Employee table
  if (data.panNumber) {
    const empWhere = { panNumber: data.panNumber };
    if (excludeId) {
      empWhere.id = { [Op.ne]: excludeId };
    }
    const existingEmployee = await Employee.findOne({ 
      where: empWhere,
      include: [{
        model: User,
        as: 'user',
        attributes: ['name']
      }]
    });
    if (existingEmployee) {
      const empCode = existingEmployee.empCode;
      const userName = existingEmployee.user?.name || 'Unknown';
      errors.panNumber = `PAN number already exists to ${empCode} - ${userName}`;
    }
  }
  
  // Check Aadhaar number uniqueness in Employee table
  if (data.aadharNumber) {
    const empWhere = { aadharNumber: data.aadharNumber };
    if (excludeId) {
      empWhere.id = { [Op.ne]: excludeId };
    }
    const existingEmployee = await Employee.findOne({ 
      where: empWhere,
      include: [{
        model: User,
        as: 'user',
        attributes: ['name']
      }]
    });
    if (existingEmployee) {
      const empCode = existingEmployee.empCode;
      const userName = existingEmployee.user?.name || 'Unknown';
      errors.aadharNumber = `Aadhaar number already exists to ${empCode} - ${userName}`;
    }
  }
  
  return errors;
};

// @desc    Create new employee
// @route   POST /api/employees
// @access  Private/Admin
exports.createEmployee = async (req, res) => {
  try {
    const {
      empCode,
      name, // Map 'name' to 'name' for User model
      gender,
      dateOfBirth, // Direct field from frontend
      branchId,
      designationId,
      departmentId,
      subDepartmentId,
      gradeId,
      categoryId,
      reportingManagerId,
      employmentType,
      employmentStatus,
      joiningDate,
      phone, // Direct field from frontend
      personalEmail, // Not stored, using officialEmail as email
      officialEmail,
      inviteSent,
      confirmationDate,
      resignationDate,
      relievedDate,
      reason,
      bloodGroup, // Direct field from frontend
      aadharNumber,
      panNumber,
      ctc, // Added CTC field
      // Handle nested user data from frontend
      user
    } = req.body;

    const { User, Employee, sequelize } = global.db;
    if (!User || !Employee || !sequelize) {
      return res.status(500).json({ success: false, message: 'Models not initialized' });
    }

    const companyId = req.user.companyId;

    // Extract user data from nested structure or direct fields
    const userName = name || user?.name;
    const userGender = gender || user?.gender;
    const userDateOfBirth = dateOfBirth || user?.date_of_birth || user?.dateOfBirth;
    const userPhone = phone || user?.phone;
    const userBloodGroup = bloodGroup || user?.blood_group;
    const userEmail = personalEmail || user?.email;

    if (!officialEmail || !branchId || !designationId || !departmentId || !joiningDate || !employmentType || !panNumber || !aadharNumber || !companyId) {
      return res.status(400).json({ success: false, message: 'Missing required fields: officialEmail, branchId, designationId, departmentId, joiningDate, employmentType, panNumber, aadharNumber, or companyId' });
    }

    // Check unique constraints before creating
    const uniqueErrors = await checkUniqueConstraints(User, Employee, {
      email: userEmail,
      phone: userPhone,
      empCode: empCode,
      officialEmail: officialEmail,
      panNumber: panNumber,
      aadharNumber: aadharNumber
    });
    console.log("uniqueErrors");
    console.log(uniqueErrors);
    if (Object.keys(uniqueErrors).length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors: uniqueErrors
      });
    }
    
    const result = await sequelize.transaction(async (t) => {
      const userRecord = await User.create(
        {
          name: userName,
          last_name: null,
          email: userEmail,
          password: null,
          role: 'employee',
          status: 'Active',
          phone: userPhone,
          dateOfBirth: userDateOfBirth,
          gender: userGender,
          bloodGroup: userBloodGroup,
          companyId: companyId
        },
        { transaction: t }
      );
      console.log("userRecord");
      console.log(userRecord);
      const employeeId = empCode || `EMP${String(userRecord.id).padStart(5, '0')}`;
      const employee = await Employee.create(
        {
          userId: userRecord.id,
          empCode: employeeId,
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
          ctc: ctc || null, // Added CTC field
          email: officialEmail,
          invite_sent: inviteSent,
          confirmationDate: confirmationDate || null,
          resignationDate: resignationDate || null,
          relievedDate: relievedDate || null,
          reason: reason ? parseInt(reason) : null,
        },
        { transaction: t }
      );

      // Create address record if address data is provided
      const { Address } = global.db;
      if (Address) {
        const addressFields = [
          'address', 'city', 'state', 'country', 'pincode',
          'permanentAddress', 'permanentCity', 'permanentState', 'permanentCountry', 'permanentPincode'
        ];
        const addressData = {};
        addressFields.forEach(field => {
          if (req.body[field]) {
            addressData[field] = req.body[field];
          }
        });
        
        if (Object.keys(addressData).length > 0) {
          await Address.create({
            user_id: userRecord.id,
            ...addressData
          }, { transaction: t });
        }
      }

      const employeeWithUser = await Employee.findOne({
        where: { id: employee.id },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'lastName', 'email', 'role', 'status', 'phone', 'dateOfBirth', 'gender', 'bloodGroup', 'companyId'],
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
    console.log("error");
    console.log(error.message);
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
        attributes: ['id', 'name', 'lastName', 'email', 'role', 'status', 'phone', 'dateOfBirth', 'gender', 'bloodGroup', 'companyId'],
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
          attributes: ['id', 'name', 'lastName', 'email', 'role', 'status', 'phone', 'dateOfBirth', 'gender', 'bloodGroup', 'companyId']
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
          attributes: ['id', 'empCode', 'email'],
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'lastName']
          }]
        },
      ],
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
        where: { user_id: employee.userId }
      });
    }

    // Get qualifications
    let qualifications = [];
    if (Qualification) {
      qualifications = await Qualification.findAll({
        where: { user_id: employee.userId }
      });
    }

    // Get experiences
    let experiences = [];
    if (Experience) {
      experiences = await Experience.findAll({
        where: { user_id: employee.userId }
      });
    }

    // Get documents
    let documents = [];
    if (Document) {
      documents = await Document.findAll({
        where: { user_id: employee.userId }
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

      // Check unique constraints before updating
      const uniqueErrors = await checkUniqueConstraints(User, Employee, {
        personalEmail: req.body.personalEmail,
        phone: req.body.phone || req.body.user?.phone,
        empCode: req.body.empCode,
        officialEmail: req.body.officialEmail,
        panNumber: req.body.panNumber,
        aadharNumber: req.body.aadharNumber
      }, employee.id, employee.userId);

      if (Object.keys(uniqueErrors).length > 0) {
        throw new Error(JSON.stringify({
          message: 'Validation failed',
          errors: uniqueErrors
        }));
      }

      // Update user details if provided
      const userUpdateData = {};
      const userFields = ['name', 'phone', 'dateOfBirth', 'gender', 'bloodGroup'];
      
      // Handle nested user data from frontend
      if (req.body.user) {
        userFields.forEach(field => {
          if (req.body.user[field] !== undefined) {
            userUpdateData[field] = req.body.user[field];
          }
        });
      } else {
        // Handle direct fields
        userFields.forEach(field => {
          if (req.body[field] !== undefined) {
            userUpdateData[field] = req.body[field];
          }
        });
      }
      
      // Handle personal email specifically - this goes to User table's email field
      if (req.body.personalEmail !== undefined) {
        userUpdateData.email = req.body.personalEmail;
      }
      
      if (Object.keys(userUpdateData).length > 0) {
        await employee.user.update(userUpdateData, { transaction: t });
      }

      // Update employee details (excluding address fields which are handled separately)
      const updateData = {};
      const employeeFields = [
        'empCode', 'departmentId', 'designationId', 'branchId', 'subDepartmentId',
        'gradeId', 'categoryId', 'reportingManagerId', 'employmentType', 'employmentStatus',
        'joiningDate', 'confirmationDate', 'resignationDate', 'relievedDate', 'reason',
        'panNumber', 'aadharNumber', 'ctc', 'invite_sent', 'inviteSent',
        // Additional fields (excluding address fields)
        'phoneNumber', 'workSchedule', 'basicSalary', 'bankName', 'accountNumber', 'ifscCode',
        'emergencyContactName', 'emergencyContactPhone', 'emergencyContactRelation',
        'isOrphan', 'lessThanPrimary', 'isFresher', 'photo',"bankBranch"
      ];
      
      employeeFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });
      
      // Handle official email specifically - this goes to Employee table's email field
      if (req.body.officialEmail !== undefined) {
        updateData.email = req.body.officialEmail;
      }
      
      console.log("updateData");
      console.log(updateData);
      await employee.update(updateData, { transaction: t });

      // --- Address Section ---
      const addressFields = [
        'address', 'city', 'state', 'country', 'pincode',
        'permanentAddress', 'permanentCity', 'permanentState', 'permanentCountry', 'permanentPincode'
      ];
      const addressUpdate = {};
      addressFields.forEach(f => { 
        if (req.body[f] !== undefined) {
          addressUpdate[f] = req.body[f];
        }
      });
      
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
        await FamilyMember.destroy({ where: { user_id: employee.userId }, transaction: t });
        for (const member of req.body.familyMembers) {
          await FamilyMember.create({ user_id: employee.userId, employee_id: employee.id, ...member }, { transaction: t });
        }
      }

      // --- Qualifications Section ---
      if (Array.isArray(req.body.qualifications) && Qualification) {
        await Qualification.destroy({ where: { user_id: employee.userId }, transaction: t });
        for (const qual of req.body.qualifications) {
          await Qualification.create({ user_id: employee.userId, employee_id: employee.id, ...qual }, { transaction: t });
        }
      }

      // --- Experiences Section ---
      if (Array.isArray(req.body.experiences) && Experience) {
        await Experience.destroy({ where: { user_id: employee.userId }, transaction: t });
        for (const exp of req.body.experiences) {
          await Experience.create({ user_id: employee.userId, employee_id: employee.id, ...exp }, { transaction: t });
        }
      }

      // --- Documents Section ---
      if (Array.isArray(req.body.documents) && Document) {
        await Document.destroy({ where: { user_id: employee.userId }, transaction: t });
        for (const doc of req.body.documents) {
          await Document.create({ user_id: employee.userId, employee_id: employee.id, ...doc }, { transaction: t });
        }
      }

      // Get updated employee with user details
      return await Employee.findByPk(employee.id, {
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'lastName', 'email', 'role', 'status', 'phone', 'dateOfBirth', 'gender', 'bloodGroup']
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
    
    // Handle unique constraint validation errors
    if (error.message.includes('Validation failed')) {
      try {
        const errorData = JSON.parse(error.message);
        return res.status(400).json({
          success: false,
          message: errorData.message,
          errors: errorData.errors
        });
      } catch (parseError) {
        // If JSON parsing fails, return generic error
        return res.status(400).json({
          success: false,
          message: 'Validation failed'
        });
      }
    }
    
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
        const empCode = `EMP${String(user.id).padStart(5, '0')}`;

        // Create employee with user association
        const employee = await Employee.create({
          userId: user.id,
          empCode,
          ...row,
          status: 'Active'
        }, { transaction: t });

        const employeeWithUser = await Employee.findOne({
          where: { id: employee.id },
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'lastName', 'email', 'role', 'status', 'phone', 'dateOfBirth', 'gender', 'bloodGroup', 'companyId'],
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
        attributes: ['id', 'name', 'lastName', 'email', 'role', 'status', 'phone', 'dateOfBirth', 'gender', 'bloodGroup']
      }]
    });

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(employees.map(emp => ({
      'Employee ID': emp.empCode,
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
