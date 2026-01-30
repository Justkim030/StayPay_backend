const bcrypt = require('bcryptjs');
const { User, Property, Tenancy, Payment } = require('../models');

exports.listTenants = async (req, res) => {
  const landlordId = req.user.id;
  try {
    const tenancies = await Tenancy.findAll({
      include: [
        {
          model: Property,
          as: 'property',
          where: { landlord_id: landlordId },
          attributes: [] // We don't need property details in the list
        },
        {
          model: User,
          as: 'tenant',
          attributes: ['id', 'name', 'email', 'phone', 'createdAt']
        }
      ],
      attributes: ['id', 'house_number', 'monthly_rent', 'status'],
    });

    const formattedTenants = tenancies.map(t => ({
      id: t.tenant.id,
      name: t.tenant.name,
      email: t.tenant.email,
      phone: t.tenant.phone,
      houseNumber: t.house_number,
      monthlyRent: t.monthly_rent,
      paymentStatus: 'Pending',
      status: t.status,
      createdAt: t.tenant.createdAt,
    }));

    res.status(200).json(formattedTenants);

  } catch (error) {
    console.error('Error fetching tenants:', error);
    res.status(500).json({ message: 'An internal server error occurred while fetching tenants.' });
  }
};

exports.createTenancy = async (req, res) => {
  const landlordId = req.user.id;
  const { name, email, phone, password, house_number, monthly_rent } = req.body;

  if (!name || !email || !phone || !password || !house_number || !monthly_rent) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const property = await Property.findOne({ where: { landlord_id: landlordId } });
    if (!property) {
      return res.status(404).json({ message: 'No properties found for this landlord. Please create a property first.' });
    }

    let tenant = await User.findOne({ where: { email } });
    if (tenant && tenant.role !== 'Tenant') {
      return res.status(409).json({ message: 'Email is registered to a non-tenant account.' });
    } else if (!tenant) {
      const hashedPassword = await bcrypt.hash(password, 12);
      tenant = await User.create({
        name,
        email,
        phone,
        password_hash: hashedPassword,
        role: 'Tenant',
      });
    }

    const newTenancy = await Tenancy.create({
      property_id: property.id,
      tenant_id: tenant.id,
      house_number,
      monthly_rent,
    });

    res.status(201).json({ message: 'Tenancy created successfully', tenancy: newTenancy });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'This house/apartment number is already occupied.' });
    }
    console.error('Error creating tenancy:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// --- FOR DEVELOPMENT ONLY: A function to clear data ---
exports.clearData = async (req, res) => {
  // ** DANGER: This will delete all users, properties, and tenants. **
  // ** DO NOT USE IN PRODUCTION. **
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ message: 'This function is disabled in production.' });
  }
  try {
    // Delete in an order that respects foreign key constraints
    await Tenancy.destroy({ truncate: true, cascade: true });
    await Property.destroy({ truncate: true, cascade: true });
    await User.destroy({ truncate: true, cascade: true });

    res.status(200).json({ message: 'All data has been cleared successfully.' });

  } catch (error) {
    console.error('Error clearing data:', error);
    res.status(500).json({ message: 'Failed to clear data.' });
  }
};
