require('dotenv').config();

module.exports = {
  // This key MUST be 'production' to match the NODE_ENV in the Dockerfile
  production: {
    // This tells Sequelize CLI to use the connection string from the environment
    url: process.env.DATABASE_URL,
    dialect: 'mysql',

    // ** THE FIX IS HERE: SSL is required for all public connections **
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
};
