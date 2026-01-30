const express = require('express');
const router = express.Router();
const landlordController = require('../controllers/landlord.controller');
const { authenticate, isLandlord } = require('../middleware/auth.middleware');

// --- Standard Routes ---
router.get('/tenants', [authenticate, isLandlord], landlordController.listTenants);
router.post('/tenancies', [authenticate, isLandlord], landlordController.createTenancy);


// --- FOR DEVELOPMENT ONLY: A route to clear all data ---
// ** DANGER: This will delete all users, properties, and tenants. **
// ** DO NOT USE IN PRODUCTION. **
router.delete('/_dev/clear-all-data', [authenticate, isLandlord], landlordController.clearData);


module.exports = router;
