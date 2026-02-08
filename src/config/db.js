const { Sequelize } = require('sequelize');
require('dotenv').config();

// This single, clean configuration works for both local dev (from .env)
// and Railway production (from Railway's environment variables).
const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'mysql',
    logging: false, // Can be set to console.log for debugging

    // ** THE FIX IS HERE: SSL is required for all public connections **
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Required for Railway's proxy
      }
    },

    // Connection pool for performance and stability
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

module.exports = { sequelize };
