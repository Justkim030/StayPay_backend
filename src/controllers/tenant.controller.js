const { Tenancy, Payment, User, Property } = require('../models');
const { initiateSTKPush } = require('../services/mpesa.service');

exports.getDashboardDetails = async (req, res) => {
  // ... (existing, correct code)
};

exports.initiatePayment = async (req, res) => {
  const tenantId = req.user.id;
  const { amount, phoneNumber } = req.body;

  if (!amount || !phoneNumber) {
    return res.status(400).json({ message: 'Amount and phone number are required.' });
  }

  try {
    const tenancy = await Tenancy.findOne({
      where: { tenant_id: tenantId },
      include: [{ model: Payment, as: 'payments', required: false, order: [['createdAt', 'DESC']] }]
    });

    if (!tenancy) {
      return res.status(404).json({ message: 'No active tenancy found.' });
    }

    // ** IMPROVEMENT: Prevent payment if rent is already paid **
    const latestPayment = tenancy.payments[0];
    if (latestPayment && latestPayment.status === 'Successful') {
      // This logic should be refined based on monthly due dates in a real app
      return res.status(400).json({ message: 'Your rent for the current period has already been paid.' });
    }

    const payment = await Payment.create({
      tenancy_id: tenancy.id,
      amount: amount,
      status: 'Pending',
    });

    await initiateSTKPush({
      phoneNumber: phoneNumber,
      amount: amount,
      accountReference: `T-${tenancy.id}`,
      transactionDesc: `Rent for ${tenancy.house_number}`,
      paymentId: payment.id,
    });

    res.status(200).json({ message: 'Payment initiated. Please check your phone.' });
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({ message: 'Failed to initiate payment.', error: error.message });
  }
};
