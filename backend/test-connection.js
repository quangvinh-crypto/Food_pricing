require('dotenv').config();
const { Sequelize } = require('sequelize');

console.log('Testing SQL Server connection...\n');
console.log('Config:');
console.log('  Server:', process.env.DB_SERVER);
console.log('  Port:', process.env.DB_PORT);
console.log('  Database:', process.env.DB_DATABASE);
console.log('  User:', process.env.DB_USER);
console.log('  Password:', process.env.DB_PASSWORD ? '***' : 'NOT SET');
console.log('  Encrypt:', process.env.DB_ENCRYPT);
console.log('  Trust Cert:', process.env.DB_TRUST_SERVER_CERTIFICATE);
console.log('\n');

// Try different authentication methods
const configs = [
  {
    name: 'Method 1: Windows Auth + SQL Auth',
    config: {
      host: process.env.DB_SERVER,
      port: parseInt(process.env.DB_PORT) || 1433,
      dialect: 'mssql',
      dialectOptions: {
        options: {
          encrypt: process.env.DB_ENCRYPT === 'true',
          trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
          enableArithAbort: true,
        },
        authentication: {
          type: 'default',
          options: {
            userName: process.env.DB_USER,
            password: process.env.DB_PASSWORD
          }
        }
      },
      logging: false
    }
  },
  {
    name: 'Method 2: Standard Config',
    config: {
      host: process.env.DB_SERVER,
      port: parseInt(process.env.DB_PORT) || 1433,
      dialect: 'mssql',
      dialectOptions: {
        options: {
          encrypt: process.env.DB_ENCRYPT === 'true',
          trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
          enableArithAbort: true,
          requestTimeout: 30000
        }
      },
      logging: false
    }
  },
  {
    name: 'Method 3: Instance Name',
    config: {
      host: process.env.DB_SERVER,
      port: parseInt(process.env.DB_PORT) || 1433,
      dialect: 'mssql',
      dialectOptions: {
        instanceName: 'SQLEXPRESS',
        options: {
          encrypt: process.env.DB_ENCRYPT === 'true',
          trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
          enableArithAbort: true
        }
      },
      logging: false
    }
  }
];

async function testConfigs() {
  for (const { name, config } of configs) {
    console.log(`\nTesting ${name}...`);
    const sequelize = new Sequelize(
      process.env.DB_DATABASE,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      config
    );
    
    try {
      await sequelize.authenticate();
      console.log(`✅ ${name} - SUCCESS!`);
      await sequelize.close();
      return { name, config };
    } catch (error) {
      console.log(`❌ ${name} - FAILED`);
      console.log(`   Error: ${error.message}`);
      if (error.original) {
        console.log(`   Original: ${error.original.message}`);
      }
      await sequelize.close();
    }
  }
  
  return null;
}

testConfigs().then(result => {
  if (result) {
    console.log('\n' + '='.repeat(60));
    console.log('✅ SOLUTION FOUND!');
    console.log('Use this configuration:', result.name);
    console.log('='.repeat(60));
  } else {
    console.log('\n' + '='.repeat(60));
    console.log('❌ No working configuration found.');
    console.log('Please check:');
    console.log('1. SQL Server is running');
    console.log('2. SQL Server Authentication is enabled');
    console.log('3. User sa password is correct');
    console.log('4. Firewall allows port 1433');
    console.log('='.repeat(60));
  }
  process.exit(result ? 0 : 1);
});
