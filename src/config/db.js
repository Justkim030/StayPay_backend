const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false,

    // ** NEW: Added a connection pool for performance and stability **
    pool: {
      max: 5,   // Maximum number of connections in pool
      min: 0,   // Minimum number of connections in pool
      acquire: 30000, // The maximum time, in milliseconds, that pool will try to get connection before throwing error
      idle: 10000    // The maximum time, in milliseconds, that a connection can be idle before being released
    },

    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Use this for initial connection testing
      }
    }
  }
);

module.exports = { sequelize };
