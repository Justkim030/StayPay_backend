const express = require('express');
const router = express.Router();
const tenantController = require('../controllers/tenant.controller');
const { authenticate, isTenant } = require('../middleware/auth.middleware');

// ** NEW: Route for the tenant's main dashboard **
router.get('/dashboard', [authenticate, isTenant], tenantController.getDashboardDetails);

// Route for a tenant to initiate a rent payment
router.post('/pay', [authenticate, isTenant], tenantController.initiatePayment);

module.exports = router;
