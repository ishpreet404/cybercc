/**
 * Cyber Chaukidaar - Real-time WebSocket Client Hook
 */

const WS_URL = (import.meta.env.VITE_APP_API_BASE_URL || 'http://localhost:8787')
  .replace(/^http/, 'ws')
  .replace(/\/+$/, '');

export class RealtimeClient {
  constructor() {
    this.ws = null;
    this.listeners = new Map(); // eventType -> Set of callbacks
    this.reconnectTimer = null;
    this.isConnected = false;
    this.statusListeners = new Set();
  }

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      this.ws = new WebSocket(WS_URL);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.notifyStatus(true);
        console.log('[WS] Connected to Cyber Chaukidaar Gateway');
      };

      this.ws.onmessage = (event) => {
        try {
          const packet = JSON.parse(event.data);
          this.emit(packet.type, packet.data);
          this.emit('*', packet); // Wildcard listener
        } catch (e) {
          console.warn('[WS] Parse error:', e);
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.notifyStatus(false);
        this.scheduleReconnect();
      };

      this.ws.onerror = (err) => {
        console.warn('[WS] Error:', err);
        this.ws.close();
      };
    } catch (e) {
      this.scheduleReconnect();
    }
  }

  scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 3000);
  }

  on(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType).add(callback);

    return () => {
      const set = this.listeners.get(eventType);
      if (set) set.delete(callback);
    };
  }

  onStatusChange(callback) {
    this.statusListeners.add(callback);
    callback(this.isConnected);
    return () => this.statusListeners.delete(callback);
  }

  notifyStatus(status) {
    for (const cb of this.statusListeners) {
      cb(status);
    }
  }

  emit(eventType, data) {
    const set = this.listeners.get(eventType);
    if (set) {
      for (const cb of set) {
        try { cb(data); } catch (e) { console.error(e); }
      }
    }
  }
}

export const realtimeClient = new RealtimeClient();
export default realtimeClient;
