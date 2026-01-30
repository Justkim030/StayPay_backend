const { Tenancy, Payment, User } = require('../models');
const { initiateSTKPush } = require('../services/mpesa.service');

exports.getDashboard = async (req, res) => {
  const tenantId = req.user.id;
  try {
    const tenancy = await Tenancy.findOne({
      where: { tenant_id: tenantId },
      include: [
        { model: User, as: 'tenant', attributes: ['name', 'email', 'phone'] },
        {
          model: Payment,
          as: 'payments',
          required: false, // **THE FIX IS HERE: Use LEFT JOIN**
          order: [['createdAt', 'DESC']],
        },
      ],
    });

    if (!tenancy) {
      return res.status(404).json({ message: 'No tenancy found for this user.' });
    }

    const dashboardData = {
      houseNumber: tenancy.house_number,
      monthlyRent: tenancy.monthly_rent,
      status: tenancy.status,
      payments: tenancy.payments || [], // Ensure payments is always an array
      tenantInfo: tenancy.tenant,
    };

    res.status(200).json(dashboardData);
  } catch (error) {
    console.error('Error fetching tenant dashboard:', error);
    res.status(500).json({ message: 'An internal server error occurred' });
  }
};

exports.pay = async (req, res) => {
  const tenantId = req.user.id;
  try {
    const tenancy = await Tenancy.findOne({
      where: { tenant_id: tenantId, status: 'Active' },
      include: [{ model: User, as: 'tenant', attributes: ['phone'] }],
    });

    if (!tenancy) {
      return res.status(404).json({ message: 'No active tenancy found for this user.' });
    }

    const payment = await Payment.create({
      tenancy_id: tenancy.id,
      amount: tenancy.monthly_rent,
      status: 'Pending',
    });

    await initiateSTKPush({
      phoneNumber: tenancy.tenant.phone,
      amount: tenancy.monthly_rent,
      accountReference: `T-${tenancy.id}`,
      transactionDesc: `Rent payment for House ${tenancy.house_number}`,
      paymentId: payment.id,
    });

    res.status(200).json({ message: 'Payment initiated. Please check your phone to complete the transaction.' });
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({ message: 'Failed to initiate payment.', error: error.message });
  }
};
