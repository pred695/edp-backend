const { Pool } = require('pg');

// Determine if SSL should be used based on environment
const isProduction = process.env.NODE_ENV === 'production';

// Create connection configuration
let poolConfig;

if (isProduction) {
  // Use SSL in production
  poolConfig = {
    connectionString: process.env.DB_URL,
    ssl: {
      rejectUnauthorized: false
    }
  };
} else {
  // Don't use SSL in development
  poolConfig = {
    connectionString: process.env.DB_URL
  };
}

const pool = new Pool(poolConfig);

// Test the connection
pool.connect()
  .then(() => console.log('Database connected successfully'))
  .catch(err => console.error('Database connection error:', err));

module.exports = pool;