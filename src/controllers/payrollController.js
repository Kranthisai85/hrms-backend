const Payroll = require('../models/Payroll');
const TaxDeclaration = require('../models/TaxDeclaration');
const Employee = require('../models/Employee');
const User = require('../models/User');
const XLSX = require('xlsx');
const { Op } = require('sequelize');

// @desc    Generate payslip
// @route   POST /api/payroll/generate
// @access  Private/Admin
exports.generatePayslip = async (req, res) => {
  try {
    const { employeeId, month, year } = req.body;

    const employee = await Employee.findByPk(employeeId, {
      include: [{ model: User }]
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Calculate salary components
    const payslip = await Payroll.create({
      employeeId,
      month,
      year,
      basicSalary: employee.salary,
      hra: employee.salary * 0.4, // 40% of basic as HRA
      conveyanceAllowance: 1600,
      medicalAllowance: 1250,
      otherAllowances: 0,
      grossSalary: employee.salary * 1.4 + 2850, // Basic + HRA + Allowances
      // Add deductions and other calculations as needed
    });

    res.status(201).json({
      success: true,
      data: payslip
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error in generating payslip'
    });
  }
};

// @desc    Get employee payslips
// @route   GET /api/payroll/payslips/:employeeId
// @access  Private
exports.getPayslips = async (req, res) => {
  try {
    const payslips = await Payroll.findAll({
      where: {
        employeeId: req.params.employeeId
      },
      order: [['year', 'DESC'], ['month', 'DESC']]
    });

    res.json({
      success: true,
      data: payslips
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error in fetching payslips'
    });
  }
};

// @desc    Submit tax declaration
// @route   POST /api/payroll/tax-declaration
// @access  Private
exports.submitTaxDeclaration = async (req, res) => {
  try {
    const {
      employeeId,
      financialYear,
      regime,
      investments,
      rentDetails,
      otherIncome
    } = req.body;

    const declaration = await TaxDeclaration.create({
      employeeId,
      financialYear,
      regime,
      investments,
      rentDetails,
      otherIncome,
      status: 'Pending'
    });

    res.status(201).json({
      success: true,
      data: declaration
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error in submitting tax declaration'
    });
  }
};

// @desc    Get tax declaration
// @route   GET /api/payroll/tax-declaration/:employeeId
// @access  Private
exports.getTaxDeclaration = async (req, res) => {
  try {
    const declaration = await TaxDeclaration.findOne({
      where: {
        employeeId: req.params.employeeId,
        financialYear: req.query.financialYear
      }
    });

    if (!declaration) {
      return res.status(404).json({
        success: false,
        message: 'Tax declaration not found'
      });
    }

    res.json({
      success: true,
      data: declaration
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error in fetching tax declaration'
    });
  }
};

// @desc    Update tax declaration status
// @route   PUT /api/payroll/tax-declaration/:id
// @access  Private/Admin
exports.updateTaxDeclarationStatus = async (req, res) => {
  try {
    const { status, remarks } = req.body;

    const declaration = await TaxDeclaration.findByPk(req.params.id);

    if (!declaration) {
      return res.status(404).json({
        success: false,
        message: 'Tax declaration not found'
      });
    }

    declaration.status = status;
    declaration.remarks = remarks;
    declaration.reviewedBy = req.user.id;
    declaration.reviewedAt = new Date();

    await declaration.save();

    res.json({
      success: true,
      data: declaration
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error in updating tax declaration status'
    });
  }
};

// @desc    Bulk import tax declarations
// @route   POST /api/payroll/declarations/bulk-import
// @access  Private/Admin
exports.bulkImportDeclarations = async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    const file = req.files.file;
    const workbook = XLSX.read(file.data);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    const declarations = await Promise.all(
      data.map(async (row) => {
        return await TaxDeclaration.create({
          employeeId: row.employeeId,
          financialYear: row.financialYear,
          regime: row.regime,
          investments: row.investments,
          rentDetails: row.rentDetails,
          otherIncome: row.otherIncome,
          status: 'Pending'
        });
      })
    );

    res.status(201).json({
      success: true,
      count: declarations.length,
      data: declarations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error in importing declarations'
    });
  }
};

// @desc    Export tax declarations
// @route   GET /api/payroll/declarations/export
// @access  Private/Admin
exports.exportDeclarations = async (req, res) => {
  try {
    const { financialYear } = req.query;

    const declarations = await TaxDeclaration.findAll({
      where: {
        financialYear
      },
      include: [{
        model: Employee,
        include: [{
          model: User,
          attributes: ['firstName', 'lastName']
        }]
      }]
    });

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(
      declarations.map(dec => ({
        'Employee ID': dec.employeeId,
        'Employee Name': `${dec.Employee.User.firstName} ${dec.Employee.User.lastName}`,
        'Financial Year': dec.financialYear,
        'Tax Regime': dec.regime,
        'Investments': dec.investments,
        'Rent Details': dec.rentDetails,
        'Other Income': dec.otherIncome,
        'Status': dec.status,
        'Submitted Date': dec.createdAt
      }))
    );

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Declarations');
    
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=declarations_${financialYear}.xlsx`);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error in exporting declarations'
    });
  }
};

// @desc    Bulk approve tax declarations
// @route   PUT /api/payroll/declarations/bulk-approve
// @access  Private/Admin
exports.bulkApproveDeclarations = async (req, res) => {
  try {
    const { declarationIds } = req.body;

    await TaxDeclaration.update(
      {
        status: 'Approved',
        reviewedBy: req.user.id,
        reviewedAt: new Date()
      },
      {
        where: {
          id: {
            [Op.in]: declarationIds
          }
        }
      }
    );

    res.json({
      success: true,
      message: `${declarationIds.length} declarations approved successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error in bulk approving declarations'
    });
  }
};

// @desc    Download declaration template
// @route   GET /api/payroll/declarations/template
// @access  Private/Admin
exports.downloadTemplate = async (req, res) => {
  try {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet([{
      'Employee ID': '',
      'Financial Year': '',
      'Tax Regime': '',
      'Investments': '',
      'Rent Details': '',
      'Other Income': ''
    }]);

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
    
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=declaration_template.xlsx');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error in downloading template'
    });
  }
};
