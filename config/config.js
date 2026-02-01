require('dotenv').config();

const productionConfig = {
  url: process.env.DATABASE_URL,
  dialect: 'mysql',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
};

const developmentConfig = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  dialect: 'mysql'
};

module.exports = {
  development: developmentConfig,
  test: developmentConfig, // Use development config for tests
  production: productionConfig
};
