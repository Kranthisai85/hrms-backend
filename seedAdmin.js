const initializeDatabase = require('./src/config/database');

const seedAdmin = async () => {
  try {
    console.log('Connecting to database...');
    const sequelize = await initializeDatabase;
    const User = await require('./src/models/User')(sequelize);
    await sequelize.sync();
    console.log('✓ Database synced');

    const existingAdmin = await User.findOne({ where: { email: 'admin@test.com' } });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      return;
    }

    const adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@test.com',
      password: 'admin123',
      role: 'admin',
      status: 'Active'
    });
    console.log('✓ Admin user created:', adminUser.email);
    console.log('Admin Credentials:');
    console.log('Email: admin@test.com');
    console.log('Password: admin123');
  } catch (error) {
    console.error('Error seeding admin user:', error.message);
    process.exit(1);
  }
};

seedAdmin();
