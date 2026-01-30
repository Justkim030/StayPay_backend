const express = require('express');
const router = express.Router();
const mpesaController = require('../controllers/mpesa.controller');

// This is the public callback URL that Safaricom will post to
router.post('/callback', mpesaController.handleCallback);

module.exports = router;
