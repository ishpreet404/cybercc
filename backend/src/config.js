/**
 * Cyber Chaukidaar - Server Configuration
 */

module.exports = {
  PORT: process.env.PORT || 8787,
  HOST: process.env.HOST || '0.0.0.0',
  NODE_HEARTBEAT_TIMEOUT_MS: 30000, // 30s before WARNING
  NODE_OFFLINE_TIMEOUT_MS: 60000,    // 60s before OFFLINE
  SEISMIC_SAMPLING_RATE_HZ: 100,
  FUSION_CONFIDENCE_THRESHOLD_ALERT: 0.70,
  FUSION_CONFIDENCE_THRESHOLD_CRITICAL: 0.88,
  DEFAULT_NODES: [
    {
      nodeId: 'NODE-001',
      name: 'North Perimeter Gate',
      position: { x: 22, y: 18 }, // Relative coordinates (0-100%)
      sensorSpacing: 1.5, // meters between ADXL345 #1 and #2
      communication: 'LoRa',
      firmware: '1.2.0',
      battery: { voltage: 4.12, percentage: 95 },
      signal: { rssi: -58 },
      status: 'ONLINE'
    },
    {
      nodeId: 'NODE-002',
      name: 'East Fence Boundary',
      position: { x: 80, y: 35 },
      sensorSpacing: 1.5,
      communication: 'WiFi',
      firmware: '1.2.0',
      battery: { voltage: 3.88, percentage: 72 },
      signal: { rssi: -67 },
      status: 'ONLINE'
    },
    {
      nodeId: 'NODE-003',
      name: 'South Forest Approach',
      position: { x: 50, y: 82 },
      sensorSpacing: 2.0,
      communication: 'LoRa',
      firmware: '1.2.0',
      battery: { voltage: 3.65, percentage: 42 },
      signal: { rssi: -79 },
      status: 'ONLINE'
    },
    {
      nodeId: 'NODE-004',
      name: 'West Driveway Access',
      position: { x: 18, y: 68 },
      sensorSpacing: 1.8,
      communication: 'BLE',
      firmware: '1.2.0',
      battery: { voltage: 3.42, percentage: 16 }, // Low battery scenario
      signal: { rssi: -72 },
      status: 'WARNING'
    }
  ]
};
