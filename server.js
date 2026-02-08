require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { sequelize } = require('./src/config/db');
const { initWebSocket } = require('./src/websocket');

const authRoutes = require('./src/api/auth.routes.js');
const landlordRoutes = require('./src/api/landlord.routes.js');
const tenantRoutes = require('./src/api/tenant.routes.js');
const mpesaRoutes = require('./src/api/mpesa.routes.js');

const app = express();
const server = http.createServer(app);

initWebSocket(server);

app.use(cors());
app.use(express.json());

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

    // ** EXECUTING OPTION 1: Using sequelize.sync() **
    // This will create the tables if they do not exist.
    await sequelize.sync({ alter: true });
    console.log('All models were synchronized successfully.');

    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server or connect to DB:', error);
    process.exit(1);
  }
};

startServer();
