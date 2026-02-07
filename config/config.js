require('dotenv').config();

// This single configuration is used for all environments.
// It relies on the DATABASE_URL environment variable, which is the standard for hosting providers.
module.exports = {
  // We define the 'production' key because NODE_ENV is set to production.
  production: {
    url: process.env.DATABASE_URL,
    dialect: 'mysql',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Required for Railway and other cloud DBs
      }
    },
    // Add a logging function to see the exact error if it fails again
    logging: (msg) => console.log('[Sequelize]', msg)
  }
};
