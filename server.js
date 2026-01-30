require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { WebSocketServer } = require('ws');
const { sequelize } = require('./src/config/db');
const ensureProperties = require('./src/scripts/ensure-properties'); // Import the script

// API routes
const authRoutes = require('./src/api/auth.routes.js');
const landlordRoutes = require('./src/api/landlord.routes.js');
const tenantRoutes = require('./src/api/tenant.routes.js');
const mpesaRoutes = require('./src/api/mpesa.routes.js');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/landlord', landlordRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/mpesa', mpesaRoutes);

app.get('/', (req, res) => res.json({ status: 'ok' }));

// WebSocket Setup
const wss = new WebSocketServer({ server });
const clients = new Map();

wss.on('connection', (ws, req) => {
  const userId = req.url.split('/').pop();
  if (userId) {
    clients.set(userId, ws);
    console.log(`Client ${userId} connected`);
  }
  ws.on('close', () => {
    if (userId) {
      clients.delete(userId);
      console.log(`Client ${userId} disconnected`);
    }
  });
});

module.exports.clients = clients;

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    const syncAlter = process.env.DB_SYNC_ALTER === 'true';
    if (syncAlter) {
      await sequelize.sync({ alter: true });
      console.log('Models synchronized with alter:true');
    }

    // Run the script to ensure default properties exist for landlords
    await ensureProperties();

    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server or connect to DB:', error);
    process.exit(1);
  }
};

startServer();
