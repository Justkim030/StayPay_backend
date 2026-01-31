const { Payment, MpesaTransaction, Tenancy, Property } = require('../models');
const { clients } = require('../websocket'); // Corrected import path

exports.handleCallback = async (req, res) => {
  console.log('--- M-Pesa Callback Received ---');
  console.log(JSON.stringify(req.body, null, 2));

  // Check for the correct callback structure
  if (!req.body.Body || !req.body.Body.stkCallback) {
    return res.status(400).json({ message: 'Invalid M-Pesa callback format' });
  }

  const callbackData = req.body.Body.stkCallback;
  const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = callbackData;

  try {
    const transaction = await MpesaTransaction.findOne({ where: { CheckoutRequestID } });
    if (!transaction) {
      console.error('Transaction not found for CheckoutRequestID:', CheckoutRequestID);
      return res.status(404).json({ message: 'Transaction not found' });
    }

    transaction.ResultCode = ResultCode;
    transaction.ResultDesc = ResultDesc;

    if (ResultCode === 0) {
      const metadata = CallbackMetadata.Item;
      const mpesaReceiptNumber = metadata.find(item => item.Name === 'MpesaReceiptNumber').Value;
      transaction.CallbackMetadata = metadata;

      await Payment.update(
        { status: 'Successful', mpesaReceiptNumber, paidAt: new Date() },
        { where: { id: transaction.payment_id } }
      );
    } else {
      await Payment.update({ status: 'Failed' }, { where: { id: transaction.payment_id } });
    }

    await transaction.save();

    const payment = await Payment.findByPk(transaction.payment_id, {
      include: {
        model: Tenancy,
        as: 'tenancy',
        attributes: ['tenant_id'],
        include: [{ model: Property, as: 'property', attributes: ['landlord_id'] }]
      },
    });

    if (payment && payment.tenancy && payment.tenancy.property) {
      const tenantId = payment.tenancy.tenant_id.toString();
      const landlordId = payment.tenancy.property.landlord_id.toString();
      const updateMessage = JSON.stringify({ type: 'PAYMENT_UPDATE', paymentId: payment.id, status: ResultCode === 0 ? 'Successful' : 'Failed' });

      if (clients.has(tenantId)) {
        clients.get(tenantId).send(updateMessage);
        console.log(`Sent WebSocket update to tenant: ${tenantId}`);
      }
      if (clients.has(landlordId)) {
        clients.get(landlordId).send(updateMessage);
        console.log(`Sent WebSocket update to landlord: ${landlordId}`);
      }
    }

    res.status(200).json({ message: 'Callback handled successfully' });

  } catch (error) {
    console.error('Error handling M-Pesa callback:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
