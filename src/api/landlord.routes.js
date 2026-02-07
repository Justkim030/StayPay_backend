const express = require('express');
const router = express.Router();
const landlordController = require('../controllers/landlord.controller');
const { authenticate, isLandlord } = require('../middleware/auth.middleware');

// --- Standard Routes ---
router.get('/tenants', [authenticate, isLandlord], landlordController.listTenants);
router.post('/tenancies', [authenticate, isLandlord], landlordController.createTenancy);
router.get('/properties/count', [authenticate, isLandlord], landlordController.getPropertiesCount);
router.put('/properties/setup', [authenticate, isLandlord], landlordController.setupProperty);

// ** NEW: Route to delete a tenant **
router.delete('/tenants/:id', [authenticate, isLandlord], landlordController.deleteTenant);


// --- FOR DEVELOPMENT ONLY ---
router.delete('/_dev/clear-all-data', [authenticate, isLandlord], landlordController.clearData);


module.exports = router;
