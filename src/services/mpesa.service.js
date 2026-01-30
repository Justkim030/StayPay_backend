const axios = require('axios');
const { MpesaTransaction } = require('../models'); // Corrected: index.js handles model imports

// M-Pesa API credentials from .env file
const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET;
const SHORTCODE = process.env.MPESA_SHORTCODE;
const PASSKEY = process.env.MPESA_PASSKEY;

// Determine API environment
const MPESA_ENV = process.env.MPESA_ENV || 'sandbox';
const authUrl = MPESA_ENV === 'live'
  ? 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
  : 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

const stkPushUrl = MPESA_ENV === 'live'
  ? 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
  : 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

// --- 1. Get M-Pesa Access Token ---
const getAccessToken = async () => {
  const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
  try {
    const response = await axios.get(authUrl, { headers: { Authorization: `Basic ${auth}` } });
    return response.data.access_token;
  } catch (error) {
    console.error('M-Pesa auth error:', error.response ? error.response.data : error.message);
    throw new Error('Could not authenticate with M-Pesa');
  }
};

// --- 2. Initiate STK Push ---
const initiateSTKPush = async ({ phoneNumber, amount, accountReference, transactionDesc, paymentId }) => {
  const accessToken = await getAccessToken();
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
  const password = Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString('base64');

  const payload = {
    BusinessShortCode: SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: Math.round(amount), // Amount must be an integer
    PartyA: phoneNumber, // The user's phone number
    PartyB: SHORTCODE,
    PhoneNumber: phoneNumber,
    CallBackURL: `${process.env.BACKEND_URL}/api/mpesa/callback`,
    AccountReference: accountReference,
    TransactionDesc: transactionDesc,
  };

  try {
    const response = await axios.post(stkPushUrl, payload, { headers: { Authorization: `Bearer ${accessToken}` } });

    // Log the M-Pesa transaction request for tracking
    await MpesaTransaction.create({
      payment_id: paymentId,
      MerchantRequestID: response.data.MerchantRequestID,
      CheckoutRequestID: response.data.CheckoutRequestID,
    });

    return response.data;
  } catch (error) {
    console.error('STK Push initiation error:', error.response ? error.response.data : error.message);
    throw new Error('Failed to initiate STK push');
  }
};

module.exports = { initiateSTKPush };
