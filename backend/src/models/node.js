/**
 * Cyber Chaukidaar - Node Model
 */

class Node {
  constructor(data) {
    this.nodeId = data.nodeId;
    this.name = data.name || `Perimeter Node ${data.nodeId}`;
    this.position = data.position || { x: 50, y: 50 }; // Relative 0-100 property grid
    this.sensorSpacing = data.sensorSpacing || 1.5; // meters
    this.communication = data.communication || 'WiFi'; // WiFi, LoRa, BLE
    this.firmware = data.firmware || '1.0.0';
    this.status = data.status || 'ONLINE'; // ONLINE, WARNING, ALERT, OFFLINE
    this.battery = {
      voltage: (data.battery && data.battery.voltage) || 4.10,
      percentage: (data.battery && data.battery.percentage) || 90
    };
    this.signal = {
      rssi: (data.signal && data.signal.rssi) || -60
    };
    this.sensors = {
      radar: { status: 'OK', presence: false, distance: 0, confidence: 0 },
      adxl1: { status: 'OK', x: 0, y: 0, z: 1.0, vibrationRms: 0.02, level: 'NORMAL' },
      adxl2: { status: 'OK', x: 0, y: 0, z: 1.0, vibrationRms: 0.02, level: 'NORMAL' },
      camera: { status: 'OK', verified: false, label: 'NONE' }
    };
    this.activeEvent = null;
    this.lastSeen = Date.now();
    this.uptimeSeconds = data.uptimeSeconds || 3600;
  }

  updateHeartbeat(data = {}) {
    this.lastSeen = Date.now();
    if (data.battery) this.battery = { ...this.battery, ...data.battery };
    if (data.signal) this.signal = { ...this.signal, ...data.signal };
    if (data.communication) this.communication = data.communication;
    if (data.firmware) this.firmware = data.firmware;
    if (data.uptimeSeconds) this.uptimeSeconds = data.uptimeSeconds;
    
    // Auto-update status if was offline
    if (this.status === 'OFFLINE' || this.status === 'WARNING') {
      this.status = 'ONLINE';
    }
  }

  toJSON() {
    return {
      nodeId: this.nodeId,
      name: this.name,
      position: this.position,
      sensorSpacing: this.sensorSpacing,
      communication: this.communication,
      firmware: this.firmware,
      status: this.status,
      battery: this.battery,
      signal: this.signal,
      sensors: this.sensors,
      activeEvent: this.activeEvent,
      lastSeen: this.lastSeen,
      lastSeenSecondsAgo: Math.round((Date.now() - this.lastSeen) / 1000),
      uptimeSeconds: this.uptimeSeconds
    };
  }
}

module.exports = Node;
