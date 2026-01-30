const fs = require('fs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  const sql = fs.readFileSync('migrations/001-create-schema.sql', 'utf8');
  const DATABASE_URL = process.env.DATABASE_URL;
  let conn;
  if (DATABASE_URL) {
    conn = await mysql.createConnection({ uri: DATABASE_URL, multipleStatements: true });
  } else {
    conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'database',
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
      multipleStatements: true,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    });
  }

  console.log('Running migration...');
  await conn.query(sql);
  console.log('Migration applied.');
  await conn.end();
}

run().catch(err => { console.error(err); process.exit(1); });
