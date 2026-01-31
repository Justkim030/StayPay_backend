const { WebSocketServer } = require('ws');

// This Map will store WebSocket connections for each user ID.
const clients = new Map();

// This function initializes the WebSocket server on the main HTTP server.
const initWebSocket = (server) => {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws, req) => {
    // When a client connects, we get their user ID from the URL.
    // e.g., ws://your-api.com/ws/123
    const userId = req.url.split('/').pop();

    if (userId) {
      clients.set(userId, ws);
      console.log(`WebSocket Client ${userId} connected`);

      ws.on('close', () => {
        clients.delete(userId);
        console.log(`WebSocket Client ${userId} disconnected`);
      });

      ws.on('error', (error) => {
        console.error(`WebSocket error for client ${userId}:`, error);
        clients.delete(userId);
      });
    }
  });

  console.log('WebSocket server initialized.');
};

// We export the init function and the clients Map so other files can use it.
module.exports = { initWebSocket, clients };
