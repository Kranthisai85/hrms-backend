const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const User = require('../models/User');
const XLSX = require('xlsx');
const { Op } = require('sequelize');

// @desc    Check in
// @route   POST /api/attendance/check-in
// @access  Private
exports.checkIn = async (req, res) => {
  try {
    const attendance = await Attendance.create({
      employeeId: req.user.employeeId,
      date: new Date(),
      checkIn: new Date(),
      status: 'Present'
    });

    res.status(201).json({
      success: true,
      data: attendance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error in checking in'
    });
  }
};

// @desc    Check out
// @route   PUT /api/attendance/check-out
// @access  Private
exports.checkOut = async (req, res) => {
  try {
    const attendance = await Attendance.findOne({
      where: {
        employeeId: req.user.employeeId,
        date: new Date(),
        checkOut: null
      }
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'No active check-in found'
      });
    }

    attendance.checkOut = new Date();
    await attendance.save();

    res.json({
      success: true,
      data: attendance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error in checking out'
    });
  }
};

// @desc    Get attendance history
// @route   GET /api/attendance/history
// @access  Private
exports.getAttendanceHistory = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const attendance = await Attendance.findAll({
      where: {
        employeeId: req.user.employeeId,
        date: {
          [Op.between]: [startDate, endDate]
        }
      }
    });

    res.json({
      success: true,
      data: attendance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error in fetching attendance history'
    });
  }
};

// @desc    Get attendance stats
// @route   GET /api/attendance/stats
// @access  Private/Admin
exports.getAttendanceStats = async (req, res) => {
  try {
    const { month, year } = req.query;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const stats = await Attendance.findAll({
      where: {
        date: {
          [Op.between]: [startDate, endDate]
        }
      },
      include: [{
        model: Employee,
        include: [{
          model: User,
          attributes: ['firstName', 'lastName']
        }]
      }]
    });

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error in fetching attendance stats'
    });
  }
};

// @desc    Bulk mark attendance
// @route   POST /api/attendance/bulk-mark
// @access  Private/Admin
exports.bulkMarkAttendance = async (req, res) => {
  try {
    const { date, employeeAttendance } = req.body;
    
    const attendanceRecords = await Promise.all(
      employeeAttendance.map(async (record) => {
        return await Attendance.create({
          employeeId: record.employeeId,
          date,
          status: record.status,
          remarks: record.remarks || ''
        });
      })
    );

    res.status(201).json({
      success: true,
      count: attendanceRecords.length,
      data: attendanceRecords
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error in marking bulk attendance'
    });
  }
};

// @desc    Lock attendance for a month
// @route   PUT /api/attendance/lock/:month/:year
// @access  Private/Admin
exports.lockAttendance = async (req, res) => {
  try {
    const { month, year } = req.params;
    
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    await Attendance.update(
      { isLocked: true },
      {
        where: {
          date: {
            [Op.between]: [startDate, endDate]
          }
        }
      }
    );

    res.json({
      success: true,
      message: `Attendance locked for ${month}/${year}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error in locking attendance'
    });
  }
};

// @desc    Unlock attendance for a month
// @route   PUT /api/attendance/unlock/:month/:year
// @access  Private/Super Admin
exports.unlockAttendance = async (req, res) => {
  try {
    const { month, year } = req.params;
    
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    await Attendance.update(
      { isLocked: false },
      {
        where: {
          date: {
            [Op.between]: [startDate, endDate]
          }
        }
      }
    );

    res.json({
      success: true,
      message: `Attendance unlocked for ${month}/${year}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error in unlocking attendance'
    });
  }
};

// @desc    Import attendance from Excel
// @route   POST /api/attendance/import
// @access  Private/Admin
exports.importAttendance = async (req, res) => {
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

    const attendanceRecords = await Promise.all(
      data.map(async (row) => {
        return await Attendance.create({
          employeeId: row.employeeId,
          date: new Date(row.date),
          status: row.status,
          remarks: row.remarks || '',
          checkIn: row.checkIn ? new Date(row.checkIn) : null,
          checkOut: row.checkOut ? new Date(row.checkOut) : null
        });
      })
    );

    res.status(201).json({
      success: true,
      count: attendanceRecords.length,
      data: attendanceRecords
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error in importing attendance'
    });
  }
};

// @desc    Export attendance to Excel
// @route   GET /api/attendance/export/:month/:year
// @access  Private/Admin
exports.exportAttendance = async (req, res) => {
  try {
    const { month, year } = req.params;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const attendance = await Attendance.findAll({
      where: {
        date: {
          [Op.between]: [startDate, endDate]
        }
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
      attendance.map(record => ({
        'Date': record.date,
        'Employee ID': record.employeeId,
        'Employee Name': `${record.Employee.User.firstName} ${record.Employee.User.lastName}`,
        'Status': record.status,
        'Check In': record.checkIn,
        'Check Out': record.checkOut,
        'Remarks': record.remarks
      }))
    );

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
    
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=attendance_${month}_${year}.xlsx`);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error in exporting attendance'
    });
  }
};

// @desc    Download attendance template
// @route   GET /api/attendance/template
// @access  Private/Admin
exports.downloadTemplate = async (req, res) => {
  try {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet([{
      'Employee ID': '',
      'Date': '',
      'Status': '',
      'Check In': '',
      'Check Out': '',
      'Remarks': ''
    }]);

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
    
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=attendance_template.xlsx');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error in downloading template'
    });
  }
};
