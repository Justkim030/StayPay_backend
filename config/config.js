require('dotenv').config();

// This is the most robust configuration for a hosted environment like Railway.
// It relies on a single, complete DATABASE_URL connection string.
module.exports = {
  // This key MUST be 'production' to match the NODE_ENV in the Dockerfile.
  production: {
    // The 'url' property tells Sequelize CLI to use the full connection string.
    // The dialect (mysql) is automatically inferred from the URL scheme.
    url: process.env.DATABASE_URL,
    dialect: 'mysql', // Explicitly setting for clarity and safety
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Required for Railway's public proxy
      }
    }
  }
};
