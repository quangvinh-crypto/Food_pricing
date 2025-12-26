const { Sequelize } = require('sequelize');

// SQL Server configuration
const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_SERVER,
    port: parseInt(process.env.DB_PORT) || 1433,
    dialect: 'mssql',
    dialectOptions: {
      options: {
        encrypt: process.env.DB_ENCRYPT === 'true',
        trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
        enableArithAbort: true,
        requestTimeout: 30000,
        // Explicitly disable Windows Authentication
        useUTC: false,
        dateFirst: 1,
      }
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  }
);

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ SQL Server connection established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to SQL Server:', error.message);
    throw error;
  }
};

// Sync database (create tables if not exist)
const syncDatabase = async () => {
  try {
    // In production, use migrations instead of sync
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: false }); // Don't drop tables
      console.log('✅ Database synchronized successfully.');
    }
  } catch (error) {
    console.error('❌ Database sync error:', error.message);
    throw error;
  }
};

module.exports = {
  sequelize,
  testConnection,
  syncDatabase,
};
