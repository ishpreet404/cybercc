/**
 * Cyber Chaukidaar - Real-Time WebSocket Service
 * Handles live event broadcasting to connected frontend dashboards
 */

const { WebSocketServer } = require('ws');

class RealtimeService {
  constructor() {
    this.wss = null;
    this.clients = new Set();
  }

  init(server) {
    this.wss = new WebSocketServer({ server });

    this.wss.on('connection', (ws, req) => {
      this.clients.add(ws);
      console.log(`[WebSocket] Client connected from ${req.socket.remoteAddress}. Total clients: ${this.clients.size}`);

      // Send immediate welcome packet with server time
      this.sendToClient(ws, {
        type: 'CONNECTION_ESTABLISHED',
        data: {
          timestamp: Date.now(),
          system: 'CYBER_CHAUKIDAAR_DEFENSE_GRID',
          status: 'OPERATIONAL'
        }
      });

      ws.on('message', (message) => {
        try {
          const parsed = JSON.parse(message);
          if (parsed.type === 'PING') {
            this.sendToClient(ws, { type: 'PONG', timestamp: Date.now() });
          }
        } catch (err) {
          // ignore malformed ping
        }
      });

      ws.on('close', () => {
        this.clients.delete(ws);
        console.log(`[WebSocket] Client disconnected. Active clients: ${this.clients.size}`);
      });

      ws.on('error', (err) => {
        console.error('[WebSocket] Client error:', err.message);
        this.clients.delete(ws);
      });
    });
  }

  broadcast(eventType, payload) {
    if (!this.wss || this.clients.size === 0) return;

    const message = JSON.stringify({
      type: eventType,
      data: payload,
      timestamp: Date.now()
    });

    for (const client of this.clients) {
      if (client.readyState === 1) { // 1 = OPEN
        try {
          client.send(message);
        } catch (err) {
          console.warn('[WebSocket] Broadcast error:', err.message);
          this.clients.delete(client);
        }
      }
    }
  }

  sendToClient(ws, data) {
    if (ws.readyState === 1) {
      ws.send(JSON.stringify(data));
    }
  }
}

module.exports = new RealtimeService();
