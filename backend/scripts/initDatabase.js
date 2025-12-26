require('dotenv').config();
const { testConnection, syncDatabase } = require('../config/database');
const seedCategories = require('../utils/seedCategories');

const initDatabase = async () => {
  try {
    console.log('🚀 Starting database initialization...\n');

    // Test connection
    await testConnection();

    // Sync database (create tables)
    console.log('📊 Creating database tables...');
    await syncDatabase();

    // Seed categories
    await seedCategories();

    console.log('\n✅ Database initialization completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Start the server: npm run dev');
    console.log('   2. Test API: http://localhost:5000');
    console.log('   3. Create products via API\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database initialization failed:', error);
    process.exit(1);
  }
};

initDatabase();
