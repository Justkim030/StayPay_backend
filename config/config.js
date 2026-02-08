require('dotenv').config();

// This explicit configuration is the most robust way to ensure
// the CLI connects correctly in any environment.
module.exports = {
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql', // Explicitly set to mysql
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
};
