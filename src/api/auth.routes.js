const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller.js');

// Existing routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// ** NEW: Route for Tenant Login **
router.post('/tenant-login', authController.tenantLogin);

module.exports = router;
