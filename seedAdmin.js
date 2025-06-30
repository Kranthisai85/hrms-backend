const initializeDatabase = require('./src/config/database');

const seedAdmin = async () => {
  try {
    console.log('Initializing database connection...');
    const sequelize = await initializeDatabase;

    console.log('Initializing User model...');
    const User = await require('./src/models/User')(sequelize);

    console.log('Syncing database...');
    await sequelize.sync();
    console.log('✓ Database synced');

    // Check if admin already exists
    console.log('Checking for existing admin...');
    const existingAdmin = await User.findOne({
      where: { email: 'admin@test.com' }
    });

    if (existingAdmin) {
      console.log('Admin user found:', {
        id: existingAdmin.id,
        email: existingAdmin.email,
        role: existingAdmin.role,
        status: existingAdmin.status
      });
      return;
    }

    // Create admin user
    console.log('Creating admin user...');
    const adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@test.com',
      password: 'admin123',  // Will be hashed by model hooks
      role: 'admin',
      status: 'Active'
    });

    console.log('✓ Admin user created successfully:', {
      id: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
      status: adminUser.status
    });

    console.log('\nAdmin Credentials:');
    console.log('Email: admin@test.com');
    console.log('Password: admin123');

  } catch (error) {
    console.error('Error seeding admin user:', error);
    console.error('Full error:', error.stack);
    process.exit(1);
  }
};

// Run the seeder
seedAdmin();
