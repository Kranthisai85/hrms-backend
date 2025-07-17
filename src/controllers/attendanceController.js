const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const User = require('../models/User');
const XLSX = require('xlsx');
const { Op } = require('sequelize');

exports.checkIn = async (req, res) => {
  try {
    const attendance = await Attendance.create({
      employeeId: req.user.employeeId,
      date: new Date(),
      checkIn: new Date(),
      status: 'Present'
    });
    res.status(201).json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error in checking in' });
  }
};

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
      return res.status(404).json({ success: false, message: 'No active check-in found' });
    }
    attendance.checkOut = new Date();
    await attendance.save();
    res.json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error in checking out' });
  }
};

exports.getAttendanceHistory = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const attendance = await Attendance.findAll({
      where: {
        employeeId: req.user.employeeId,
        date: { [Op.between]: [startDate, endDate] }
      }
    });
    res.json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error in fetching attendance history' });
  }
};

exports.getAttendanceStats = async (req, res) => {
  try {
    const { month, year } = req.query;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    const stats = await Attendance.findAll({
      where: { date: { [Op.between]: [startDate, endDate] } },
      include: [{ model: Employee, include: [{ model: User, attributes: ['firstName', 'lastName'] }] }]
    });
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error in fetching attendance stats' });
  }
};

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
    res.status(201).json({ success: true, count: attendanceRecords.length, data: attendanceRecords });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error in marking bulk attendance' });
  }
};

exports.lockAttendance = async (req, res) => {
  try {
    const { month, year } = req.params;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    await Attendance.update(
      { isLocked: true },
      { where: { date: { [Op.between]: [startDate, endDate] } } }
    );
    res.json({ success: true, message: `Attendance locked for ${month}/${year}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error in locking attendance' });
  }
};

exports.unlockAttendance = async (req, res) => {
  try {
    const { month, year } = req.params;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    await Attendance.update(
      { isLocked: false },
      { where: { date: { [Op.between]: [startDate, endDate] } } }
    );
    res.json({ success: true, message: `Attendance unlocked for ${month}/${year}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error in unlocking attendance' });
  }
};
