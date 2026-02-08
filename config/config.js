require('dotenv').config();

module.exports = {
  production: {
    url: process.env.DATABASE_URL,
    dialect: 'mysql', // Corrected typo
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
};
