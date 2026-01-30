const express = require('express');
const router = express.Router();
const tenantController = require('../controllers/tenant.controller');
const { authenticate, isTenant } = require('../middleware/auth.middleware');

// Route for a tenant to get their specific dashboard information
router.get('/dashboard', [authenticate, isTenant], tenantController.getDashboard);

// Route for a tenant to initiate a rent payment
router.post('/pay', [authenticate, isTenant], tenantController.pay);

module.exports = router;
