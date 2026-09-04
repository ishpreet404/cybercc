/**
 * Cyber Chaukidaar - Telemetry Packet Model & Validator
 */

class Telemetry {
  constructor(data) {
    this.id = data.id || `TEL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    this.nodeId = data.nodeId;
    this.timestamp = data.timestamp || Date.now();
    this.sequence = data.sequence || 0;
    this.firmware = data.firmware || '1.0.0';
    this.transport = data.transport || 'wifi'; // wifi, lora, ble

    this.battery = {
      voltage: Number(((data.battery && data.battery.voltage) || 4.0).toFixed(2)),
      percentage: Math.round((data.battery && data.battery.percentage) || 85)
    };

    this.signal = {
      rssi: (data.signal && data.signal.rssi) || -65
    };

    this.radar = {
      presence: Boolean(data.radar && data.radar.presence),
      distance: Number(((data.radar && data.radar.distance) || 0).toFixed(2)),
      confidence: Number(((data.radar && data.radar.confidence) || (data.radar && data.radar.presence ? 0.9 : 0)).toFixed(2))
    };

    const s1 = (data.accelerometer && data.accelerometer.sensor1) || {};
    const s2 = (data.accelerometer && data.accelerometer.sensor2) || {};

    this.accelerometer = {
      sensor1: {
        x: Number((s1.x || 0).toFixed(3)),
        y: Number((s1.y || 0).toFixed(3)),
        z: Number((s1.z !== undefined ? s1.z : 1.0).toFixed(3)),
        vibrationRms: Number((s1.vibrationRms || 0.02).toFixed(4)),
        peak: Number((s1.peak || s1.vibrationRms * 2.5 || 0.05).toFixed(4)),
        features: s1.features || null
      },
      sensor2: {
        x: Number((s2.x || 0).toFixed(3)),
        y: Number((s2.y || 0).toFixed(3)),
        z: Number((s2.z !== undefined ? s2.z : 1.0).toFixed(3)),
        vibrationRms: Number((s2.vibrationRms || 0.02).toFixed(4)),
        peak: Number((s2.peak || s2.vibrationRms * 2.5 || 0.05).toFixed(4)),
        features: s2.features || null
      }
    };

    this.eventState = data.eventState || 'NORMAL'; // NORMAL, SUSPICIOUS, ALERT
  }

  static validate(data) {
    if (!data || typeof data !== 'object') {
      return { valid: false, error: 'Telemetry body must be a valid JSON object' };
    }
    if (!data.nodeId || typeof data.nodeId !== 'string') {
      return { valid: false, error: 'Missing or invalid required field: nodeId' };
    }
    return { valid: true };
  }
}

module.exports = Telemetry;
