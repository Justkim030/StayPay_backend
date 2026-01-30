const { User, Property } = require('../models');

// This script ensures every landlord has at least one property.
const ensureProperties = async () => {
  try {
    const landlords = await User.findAll({ where: { role: 'Landlord' } });

    for (const landlord of landlords) {
      const count = await Property.count({ where: { landlord_id: landlord.id } });
      if (count === 0) {
        await Property.create({
          landlord_id: landlord.id,
          name: 'Default Property',
          address: 'N/A',
        });
        console.log(`Created default property for landlord ID: ${landlord.id}`);
      }
    }
  } catch (error) {
    console.error('Error ensuring properties exist:', error);
  }
};

module.exports = ensureProperties;
