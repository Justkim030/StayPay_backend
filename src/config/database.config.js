const { Sequelize } = require('sequelize');

// Prefer a single DATABASE_URL (used by Railway/PlanetScale) but fall back to individual vars
if (process.env.DATABASE_URL) {
  // DATABASE_URL example: mysql://user:pass@host:3306/dbname
  const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'mysql',
    dialectOptions: {
      // PlanetScale & some providers require SSL but disable strict verification
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    },
    logging: false,
  });
  module.exports = sequelize;
} else {
  const DB_HOST = process.env.DB_HOST || 'localhost';
  const DB_NAME = process.env.DB_NAME || 'database';
  const DB_USER = process.env.DB_USER || 'root';
  const DB_PASS = process.env.DB_PASS || '';
  const DB_PORT = process.env.DB_PORT || 3306;

  const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
    host: DB_HOST,
    port: DB_PORT,
    dialect: 'mysql',
    logging: false,
  });

  module.exports = sequelize;
}
