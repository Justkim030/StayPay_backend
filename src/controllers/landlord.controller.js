const { Op } = require('sequelize');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { User, Property, Tenancy, Payment } = require('../models');

// --- List all tenants for a landlord ---
exports.listTenants = async (req, res) => {
  const landlordId = req.user.id;
  try {
    const tenancies = await Tenancy.findAll({
      include: [
        {
          model: Property,
          as: 'property',
          where: { landlord_id: landlordId },
          attributes: []
        },
        {
          model: User,
          as: 'tenant',
          attributes: ['id', 'name', 'email', 'phone', 'createdAt']
        },
        {
          model: Payment,
          as: 'payments',
          required: false,
          attributes: ['status', 'createdAt'],
        },
      ],
      attributes: ['id', 'house_number', 'monthly_rent', 'status'],
    });

    const formattedTenants = tenancies.map(t => {
      const latestPayment = t.payments?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
      return {
        id: t.tenant.id,
        name: t.tenant.name,
        email: t.tenant.email,
        phone: t.tenant.phone,
        houseNumber: t.house_number,
        monthlyRent: t.monthly_rent,
        paymentStatus: latestPayment?.status ?? 'Pending',
        status: t.status,
        createdAt: t.tenant.createdAt,
      };
    });

    res.status(200).json(formattedTenants);
  } catch (error) {
    console.error('Error fetching tenants:', error);
    res.status(500).json({ message: 'An internal server error occurred while fetching tenants.' });
  }
};

// --- Create a new Tenancy ---
exports.createTenancy = async (req, res) => {
  const landlordId = req.user.id;
  const { name, email, phone, house_number, monthly_rent, property_id } = req.body;

  if (!name || !email || !phone || !house_number || !monthly_rent || !property_id) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const property = await Property.findOne({ where: { id: property_id, landlord_id: landlordId } });
    if (!property) {
      return res.status(403).json({ message: 'You do not own this property or it does not exist.' });
    }

    let tenant = await User.findOne({ where: { [Op.or]: [{ email }, { phone }] } });
    if (tenant) {
      return res.status(409).json({ message: 'A user with this email or phone already exists.' });
    }

    const generatedPassword = crypto.randomBytes(4).toString('hex');
    const hashedPassword = await bcrypt.hash(generatedPassword, 12);

    tenant = await User.create({
      name,
      email,
      phone,
      password_hash: hashedPassword,
      role: 'Tenant',
    });

    const newTenancy = await Tenancy.create({
      property_id: property.id,
      tenant_id: tenant.id,
      house_number,
      monthly_rent,
    });

    res.status(201).json({
      message: 'Tenancy created successfully',
      tenancy: newTenancy,
      password: generatedPassword
    });

  } catch (error) {
    console.error('Error creating tenancy:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// --- Count properties for a landlord ---
exports.getPropertiesCount = async (req, res) => {
  try {
    const count = await Property.count({ where: { landlord_id: req.user.id } });
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// --- Update property details from the setup screen ---
exports.setupProperty = async (req, res) => {
  const { name, caretaker_name, caretaker_phone, total_rooms } = req.body;
  try {
    const property = await Property.findOne({ where: { landlord_id: req.user.id } });
    if (!property) {
      return res.status(404).json({ message: 'Property not found.' });
    }
    await property.update({ name, caretaker_name, caretaker_phone, total_rooms: parseInt(total_rooms, 10) });
    res.status(200).json({ message: 'Property updated successfully', property });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// --- Delete a tenant ---
exports.deleteTenant = async (req, res) => {
  const landlordId = req.user.id;
  const tenantUserId = req.params.id;
  try {
    const tenancy = await Tenancy.findOne({
      where: { tenant_id: tenantUserId },
      include: { model: Property, as: 'property', where: { landlord_id: landlordId } }
    });
    if (!tenancy) {
      return res.status(404).json({ message: 'Tenant not found for this landlord.' });
    }
    await User.destroy({ where: { id: tenantUserId } });
    res.status(200).json({ message: 'Tenant deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// --- DEV ONLY: Clear Data ---
exports.clearData = async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ message: 'This function is disabled in production.' });
  }
  try {
    await Payment.destroy({ truncate: true, cascade: true });
    await Tenancy.destroy({ truncate: true, cascade: true });
    await Property.destroy({ truncate: true, cascade: true });
    await User.destroy({ truncate: true, cascade: true });
    res.status(200).json({ message: 'All data cleared.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to clear data.' });
  }
};
