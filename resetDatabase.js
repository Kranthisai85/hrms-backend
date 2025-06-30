const initializeDatabase = require('./src/config/database');

const resetDatabase = async () => {
  try {
    console.log('Initializing database connection...');
    const sequelize = await initializeDatabase;

    console.log('Dropping all tables...');
    await sequelize.getQueryInterface().dropAllTables();
    console.log('✓ All tables dropped');

    console.log('Syncing database with force...');
    await sequelize.sync({ force: true });
    console.log('✓ Database synced');

    console.log('\nDatabase has been reset successfully!');
  } catch (error) {
    console.error('Error resetting database:', error);
  }
};

// Run the reset
resetDatabase();
