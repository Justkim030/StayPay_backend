const { Payment, MpesaTransaction, Tenancy } = require('../models');
const { clients } = require('../../server'); // To send WebSocket messages

exports.handleCallback = async (req, res) => {
  console.log('--- M-Pesa Callback Received ---');
  console.log(JSON.stringify(req.body, null, 2));

  const callbackData = req.body.Body.stkCallback;
  const merchantRequestID = callbackData.MerchantRequestID;
  const checkoutRequestID = callbackData.CheckoutRequestID;
  const resultCode = callbackData.ResultCode;

  try {
    // Find the transaction in our database
    const transaction = await MpesaTransaction.findOne({ where: { CheckoutRequestID: checkoutRequestID } });
    if (!transaction) {
      console.error('Transaction not found for CheckoutRequestID:', checkoutRequestID);
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Update the transaction with the result from Safaricom
    transaction.ResultCode = resultCode;
    transaction.ResultDesc = callbackData.ResultDesc;
    if (resultCode === 0) {
      // Payment was successful
      const metadata = callbackData.CallbackMetadata.Item;
      const amount = metadata.find(item => item.Name === 'Amount').Value;
      const mpesaReceiptNumber = metadata.find(item => item.Name === 'MpesaReceiptNumber').Value;
      const transactionDate = metadata.find(item => item.Name === 'TransactionDate').Value;

      transaction.CallbackMetadata = metadata;

      // Update our internal payment record
      await Payment.update(
        { status: 'Successful', mpesaReceiptNumber: mpesaReceiptNumber, paidAt: new Date() },
        { where: { id: transaction.payment_id } }
      );
    } else {
      // Payment failed or was cancelled
      await Payment.update({ status: 'Failed' }, { where: { id: transaction.payment_id } });
    }

    await transaction.save();

    // --- Real-Time Notification via WebSocket ---
    const payment = await Payment.findByPk(transaction.payment_id, {
      include: { model: Tenancy, as: 'tenancy', attributes: ['tenant_id', 'property_id'], include: [{model: Property, as: 'property', attributes: ['landlord_id']}] },
    });

    if (payment && payment.tenancy) {
      const tenantId = payment.tenancy.tenant_id.toString();
      const landlordId = payment.tenancy.property.landlord_id.toString();

      const updateMessage = JSON.stringify({ type: 'PAYMENT_UPDATE', paymentId: payment.id, status: resultCode === 0 ? 'Successful' : 'Failed' });

      // Send message to tenant if they are connected
      if (clients.has(tenantId)) {
        clients.get(tenantId).send(updateMessage);
      }
      // Send message to landlord if they are connected
      if (clients.has(landlordId)) {
        clients.get(landlordId).send(updateMessage);
      }
    }

    res.status(200).json({ message: 'Callback handled successfully' });
  } catch (error) {
    console.error('Error handling M-Pesa callback:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
