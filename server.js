require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { sequelize } = require('./src/config/db');
const { initWebSocket } = require('./src/websocket');

// API routes
const authRoutes = require('./src/api/auth.routes.js');
const landlordRoutes = require('./src/api/landlord.routes.js');
const tenantRoutes = require('./src/api/tenant.routes.js');
const mpesaRoutes = require('./src/api/mpesa.routes.js');

const app = express();
const server = http.createServer(app);

initWebSocket(server);

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/landlord', landlordRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/mpesa', mpesaRoutes);

app.get('/', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    if (process.env.DB_SYNC_ALTER === 'true') {
      await sequelize.sync({ alter: true });
      console.log('Models synchronized with alter:true');
    }

    // ** The redundant ensureProperties() call has been removed **

    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server or connect to DB:', error);
    process.exit(1);
  }
};

startServer();
