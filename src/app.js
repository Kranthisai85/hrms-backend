const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const initializeDatabase = require('./config/database');
const { Sequelize, DataTypes } = require('sequelize'); // Import DataTypes

// Import routes
const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employee');
const attendanceRoutes = require('./routes/attendance');
const payrollRoutes = require('./routes/payroll');
const branchRoutes = require('./routes/branch');
const departmentRoutes = require('./routes/department');
const designationRoutes = require('./routes/designation'); // Import designation routes
const subDepartmentRoutes = require('./routes/subDepartment');
const gradesRoutes = require('./routes/grades');
const categoryRoutes = require('./routes/category');
const companyRoutes = require('./routes/company');
const reasonsRoutes = require('./routes/reasons');

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://82.112.236.201', 'http://localhost:3001', 'https://pss.pacehrm.com']
}));

app.use(express.json());
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file size
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const initializeModels = async (sequelize) => {
  console.log('Initializing User model...');
  const User = await require('./models/User')(sequelize, DataTypes);

  console.log('Initializing Employee model...');
  const Employee = await require('./models/Employee')(sequelize, DataTypes);

  console.log('Initializing Attendance model...');
  const Attendance = await require('./models/Attendance')(sequelize, DataTypes);

  console.log('Initializing Payroll model...');
  const Payroll = await require('./models/Payroll')(sequelize, DataTypes);

  console.log('Initializing TaxDeclaration model...');
  const TaxDeclaration = await require('./models/TaxDeclaration')(sequelize, DataTypes);

  console.log('Initializing Branch model...');
  const Branch = await require('./models/Branch')(sequelize, DataTypes);

  console.log('Initializing Department model...');
  const Department = await require('./models/Department')(sequelize, DataTypes);

  console.log('Initializing Designation model...');
  const Designation = await require('./models/Designation')(sequelize, DataTypes);

  console.log('Initializing SubDepartment model...');
  const SubDepartment = await require('./models/SubDepartment')(sequelize, DataTypes);

  console.log('Initializing Grade model...');
  const Grade = await require('./models/Grade')(sequelize, DataTypes);

  console.log('Initializing Category model...');
  const Category = await require('./models/Category')(sequelize, DataTypes);

  // Create models object
  const models = {
    sequelize,
    User,
    Employee,
    Attendance,
    Payroll,
    TaxDeclaration,
    Branch,
    Department,
    Designation,
    SubDepartment,
    Grade,
    Category
  };

  // Initialize associations
  Object.keys(models).forEach((modelName) => {
    if (models[modelName].associate) {
      models[modelName].associate(models);
    }
  });

  // Make models available globally
  global.db = models;

  return models;
};

const startServer = async () => {
  try {
    // Initialize database
    console.log('Initializing database...');
    const sequelize = await initializeDatabase();
    console.log('Database connection established.');

    // Initialize models
    console.log('Initializing models...');
    const models = await initializeModels(sequelize);
    console.log('Models initialized successfully.');

    // Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/employees', employeeRoutes);
    app.use('/api/attendance', attendanceRoutes);
    app.use('/api/payroll', payrollRoutes);
    app.use('/api/branches', branchRoutes);
    app.use('/api/departments', departmentRoutes);
    app.use('/api/designations', designationRoutes); // Register designation routes
    app.use('/api/sub-departments', subDepartmentRoutes);
    app.use('/api/grades', gradesRoutes);
    app.use('/api/categories', categoryRoutes);
    app.use('/api/companies', companyRoutes);
    app.use('/api/reasons', reasonsRoutes);


    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error('Error:', err.stack);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    });

    // Sync database
    console.log('Syncing database...');
    await sequelize.sync();
    console.log('Database synced successfully');

    // Start server with port fallback
    const tryPort = (port) => {
      app.listen(port)
        .on('listening', () => {
          console.log(`Server is running on port ${port}`);
          console.log(`Health check: http://localhost:${port}/api/health`);
          console.log('\nAPI Routes:');
          console.log('POST /api/auth/login - Login');
          console.log('GET  /api/auth/me    - Get current user');
          console.log('POST /api/employees  - Create employee');
          console.log('GET  /api/employees  - Get all employees');
        })
        .on('error', (err) => {
          if (err.code === 'EADDRINUSE') {
            console.log(`Port ${port} is busy, trying ${port + 1}`);
            tryPort(port + 1);
          } else {
            console.error('Server error:', err);
          }
        });
    };

    // Start with initial port
    const initialPort = process.env.PORT || 3001;
    tryPort(initialPort);

  } catch (error) {
    console.error('Unable to start server:', error);
    console.error('Error details:', error.stack);
    process.exit(1);
  }
};

startServer();

module.exports = app;
