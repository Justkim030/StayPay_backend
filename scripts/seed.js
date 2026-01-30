const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function main() {
  const DATABASE_URL = process.env.DATABASE_URL;
  let conn;
  if (DATABASE_URL) {
    conn = await mysql.createConnection({ uri: DATABASE_URL });
  } else {
    conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'database',
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    });
  }

  console.log('Seeding database...');

  const landlordPass = process.env.SEED_LANDLORD_PASS || 'Landlord123!';
  const tenantPass = process.env.SEED_TENANT_PASS || 'Tenant123!';
  const landlordHash = await bcrypt.hash(landlordPass, 10);
  const tenantHash = await bcrypt.hash(tenantPass, 10);

  // Insert landlord
  const [r1] = await conn.execute(
    'INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)',
    ['Admin Landlord', 'landlord@example.com', '+254700000000', landlordHash, 'Landlord']
  );
  const landlordId = r1.insertId;

  // Insert tenant
  const [r2] = await conn.execute(
    'INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)',
    ['Sample Tenant', 'tenant@example.com', '+254700000001', tenantHash, 'Tenant']
  );
  const tenantId = r2.insertId;

  // Insert property
  const [r3] = await conn.execute(
    'INSERT INTO properties (landlord_id, name) VALUES (?, ?)',
    [landlordId, 'Sample Property']
  );
  const propertyId = r3.insertId;

  // Insert tenancy
  const [r4] = await conn.execute(
    'INSERT INTO tenancies (property_id, tenant_id, house_number, monthly_rent, status) VALUES (?, ?, ?, ?, ?)',
    [propertyId, tenantId, 'A1', '500.00', 'Active']
  );
  const tenancyId = r4.insertId;

  // Insert payment
  await conn.execute(
    'INSERT INTO payments (tenancy_id, amount, status) VALUES (?, ?, ?)',
    [tenancyId, '500.00', 'Pending']
  );

  console.log('Seed complete. Landlord id:', landlordId, 'Tenant id:', tenantId);
  await conn.end();
}

main().catch(err => { console.error(err); process.exit(1); });
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User, Property, Tenancy, Payment, MpesaTransaction } = require('../src/models');

async function seed() {
  try {
    // Ensure DB connection
    await sequelize.authenticate();
    console.log('DB connected');

    // Create tables if they don't exist (use with care)
    await sequelize.sync({ alter: false });

    // Create landlord
    const landlordEmail = process.env.SEED_LANDLORD_EMAIL || 'landlord@example.com';
    const tenantEmail = process.env.SEED_TENANT_EMAIL || 'tenant@example.com';

    let landlord = await User.findOne({ where: { email: landlordEmail } });
    if (!landlord) {
      const hashed = await bcrypt.hash(process.env.SEED_LANDLORD_PASSWORD || 'password', 10);
      landlord = await User.create({ name: 'Sample Landlord', email: landlordEmail, phone: '0700000001', password_hash: hashed, role: 'Landlord' });
      console.log('Landlord created:', landlord.id);
    }

    // Create tenant
    let tenant = await User.findOne({ where: { email: tenantEmail } });
    if (!tenant) {
      const hashed = await bcrypt.hash(process.env.SEED_TENANT_PASSWORD || 'password', 10);
      tenant = await User.create({ name: 'Sample Tenant', email: tenantEmail, phone: '0700000002', password_hash: hashed, role: 'Tenant' });
      console.log('Tenant created:', tenant.id);
    }

    // Create property
    let property = await Property.findOne({ where: { landlord_id: landlord.id } });
    if (!property) {
      property = await Property.create({ landlord_id: landlord.id, name: 'Sample Property' });
      console.log('Property created:', property.id);
    }

    // Create tenancy
    let tenancy = await Tenancy.findOne({ where: { property_id: property.id, tenant_id: tenant.id } });
    if (!tenancy) {
      tenancy = await Tenancy.create({ property_id: property.id, tenant_id: tenant.id, house_number: 'A1', monthly_rent: 1000.00 });
      console.log('Tenancy created:', tenancy.id);
    }

    // Create a pending payment (sample)
    let payment = await Payment.findOne({ where: { tenancy_id: tenancy.id, amount: 1000.00 } });
    if (!payment) {
      payment = await Payment.create({ tenancy_id: tenancy.id, amount: 1000.00 });
      console.log('Payment created:', payment.id);
    }

    console.log('Seeding complete.');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
