const jwt = require('jsonwebtoken');

// Middleware to verify JWT and attach user to the request
exports.authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication token required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user payload (id, email, role) to the request
    next(); // Proceed to the next middleware or controller
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Middleware to check if the authenticated user is a Landlord
exports.isLandlord = (req, res, next) => {
  if (req.user && req.user.role === 'Landlord') {
    next();
  } else {
    return res.status(403).json({ message: 'Forbidden: Access restricted to Landlords' });
  }
};

// Middleware to check if the authenticated user is a Tenant
exports.isTenant = (req, res, next) => {
  if (req.user && req.user.role === 'Tenant') {
    next();
  } else {
    return res.status(403).json({ message: 'Forbidden: Access restricted to Tenants' });
  }
};
