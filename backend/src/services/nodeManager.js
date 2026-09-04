/**
 * Cyber Chaukidaar - Central Node Manager Service
 * 
 * Orchestrates multi-node registry, telemetry buffering, ML feature extraction,
 * vibration classification, sensor fusion, and alert triggering.
 */

const Node = require('../models/node');
const Telemetry = require('../models/telemetry');
const config = require('../config');
const realtimeService = require('./realtime');
const sensorFusion = require('./sensorFusion');
const alertManager = require('./alertManager');
const cameraService = require('./cameraService');
const FeatureExtractor = require('../../../ml/features/extractor');
const VibrationClassifier = require('../../../ml/classifier/vibrationClassifier');

class NodeManager {
  constructor() {
    this.nodes = new Map(); // nodeId -> Node
    this.telemetryHistory = new Map(); // nodeId -> Telemetry[] (recent 60)
    this.vibrationBuffers = new Map(); // nodeId -> { s1: [], s2: [] } (recent 100 raw samples)

    this.featureExtractor = new FeatureExtractor({ samplingRate: config.SEISMIC_SAMPLING_RATE_HZ });
    this.vibrationClassifier = new VibrationClassifier();

    // Initialize default perimeter nodes
    this.initDefaultNodes();

    // Start background node health check timer (every 5 seconds)
    setInterval(() => this.checkNodeHealth(), 5000);
  }

  initDefaultNodes() {
    for (const nodeData of config.DEFAULT_NODES) {
      this.nodes.set(nodeData.nodeId, new Node(nodeData));
      this.telemetryHistory.set(nodeData.nodeId, []);
      this.vibrationBuffers.set(nodeData.nodeId, { s1: [], s2: [] });
    }
  }

  getAllNodes() {
    return Array.from(this.nodes.values()).map(n => n.toJSON());
  }

  getNode(nodeId) {
    const node = this.nodes.get(nodeId);
    return node ? node.toJSON() : null;
  }

  registerNode(data) {
    if (!data.nodeId) throw new Error('nodeId is required for registration');
    
    let node = this.nodes.get(data.nodeId);
    if (!node) {
      node = new Node(data);
      this.nodes.set(data.nodeId, node);
      this.telemetryHistory.set(data.nodeId, []);
      this.vibrationBuffers.set(data.nodeId, { s1: [], s2: [] });
    } else {
      node.name = data.name || node.name;
      node.position = data.position || node.position;
      node.sensorSpacing = data.sensorSpacing || node.sensorSpacing;
      node.communication = data.communication || node.communication;
      node.firmware = data.firmware || node.firmware;
      node.updateHeartbeat(data);
    }

    realtimeService.broadcast('NODE_ONLINE', node.toJSON());
    return node.toJSON();
  }

  /**
   * Process incoming telemetry packet from ESP32 or Simulator
   */
  processTelemetry(data) {
    const validation = Telemetry.validate(data);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const telemetry = new Telemetry(data);
    let node = this.nodes.get(telemetry.nodeId);
    if (!node) {
      node = new Node({ nodeId: telemetry.nodeId });
      this.nodes.set(telemetry.nodeId, node);
      this.telemetryHistory.set(telemetry.nodeId, []);
      this.vibrationBuffers.set(telemetry.nodeId, { s1: [], s2: [] });
    }

    // 1. Update node state & heartbeat
    node.updateHeartbeat({
      battery: telemetry.battery,
      signal: telemetry.signal,
      communication: telemetry.transport,
      firmware: telemetry.firmware
    });

    // 2. Buffer raw accelerometer samples for live waveform & feature analysis
    const vBuf = this.vibrationBuffers.get(telemetry.nodeId);
    vBuf.s1.push({
      x: telemetry.accelerometer.sensor1.x,
      y: telemetry.accelerometer.sensor1.y,
      z: telemetry.accelerometer.sensor1.z,
      rms: telemetry.accelerometer.sensor1.vibrationRms,
      timestamp: telemetry.timestamp
    });
    vBuf.s2.push({
      x: telemetry.accelerometer.sensor2.x,
      y: telemetry.accelerometer.sensor2.y,
      z: telemetry.accelerometer.sensor2.z,
      rms: telemetry.accelerometer.sensor2.vibrationRms,
      timestamp: telemetry.timestamp
    });

    // Keep buffers capped at 100 samples
    if (vBuf.s1.length > 100) vBuf.s1.shift();
    if (vBuf.s2.length > 100) vBuf.s2.shift();

    // 3. Extract 8 seismic features from recent window if not provided directly by node
    let featuresS1 = telemetry.accelerometer.sensor1.features;
    if (!featuresS1 && vBuf.s1.length >= 8) {
      featuresS1 = this.featureExtractor.extract(vBuf.s1);
      telemetry.accelerometer.sensor1.features = featuresS1;
    }

    // 4. Run Machine Learning Vibration Classifier
    let mlResult = null;
    if (featuresS1) {
      mlResult = this.vibrationClassifier.classify(featuresS1);
    } else {
      mlResult = { classification: 'NORMAL', confidence: 0.9, mode: 'REAL_MODEL' };
    }

    // 5. Query Camera Verification Modality if activity is elevated
    let cameraResult = null;
    if (telemetry.radar.presence || telemetry.accelerometer.sensor1.vibrationRms > 0.12) {
      cameraResult = cameraService.verifyTarget(telemetry.nodeId);
    }

    // 6. Execute Multi-Modal Sensor Fusion Engine
    const fusionResult = sensorFusion.evaluate({
      nodeId: telemetry.nodeId,
      radar: telemetry.radar,
      sensor1: telemetry.accelerometer.sensor1,
      sensor2: telemetry.accelerometer.sensor2,
      mlClassification: mlResult,
      camera: cameraResult,
      sensorSpacing: node.sensorSpacing
    });

    // Update node sensor state
    node.sensors.radar = {
      status: 'OK',
      presence: telemetry.radar.presence,
      distance: telemetry.radar.distance,
      confidence: telemetry.radar.confidence
    };
    node.sensors.adxl1 = {
      status: 'OK',
      x: telemetry.accelerometer.sensor1.x,
      y: telemetry.accelerometer.sensor1.y,
      z: telemetry.accelerometer.sensor1.z,
      vibrationRms: telemetry.accelerometer.sensor1.vibrationRms,
      level: telemetry.accelerometer.sensor1.vibrationRms > 0.20 ? 'HIGH' : (telemetry.accelerometer.sensor1.vibrationRms > 0.08 ? 'ELEVATED' : 'NORMAL'),
      features: featuresS1
    };
    node.sensors.adxl2 = {
      status: 'OK',
      x: telemetry.accelerometer.sensor2.x,
      y: telemetry.accelerometer.sensor2.y,
      z: telemetry.accelerometer.sensor2.z,
      vibrationRms: telemetry.accelerometer.sensor2.vibrationRms,
      level: telemetry.accelerometer.sensor2.vibrationRms > 0.20 ? 'HIGH' : (telemetry.accelerometer.sensor2.vibrationRms > 0.08 ? 'ELEVATED' : 'NORMAL')
    };
    node.sensors.camera = {
      status: 'OK',
      verified: cameraResult ? cameraResult.verified : false,
      label: cameraResult ? cameraResult.label : 'NONE'
    };

    // 7. Check if fusion candidate requires raising an operator alert
    if (fusionResult.isAlertCandidate) {
      alertManager.createAlertFromFusion(node, fusionResult);
      realtimeService.broadcast('DETECTION_EVENT', fusionResult);
    } else {
      // Normal monitoring or gradual decay
      if (node.status === 'ALERT' && Date.now() - (node.activeEvent ? node.activeEvent.timestamp : 0) > 8000) {
        node.status = 'ONLINE';
        node.activeEvent = null;
      }
    }

    // 8. Store telemetry in circular history
    const history = this.telemetryHistory.get(telemetry.nodeId);
    history.push({
      ...telemetry,
      fusion: fusionResult
    });
    if (history.length > 60) history.shift();

    // 9. Real-time WebSocket broadcasts
    realtimeService.broadcast('TELEMETRY_UPDATE', {
      telemetry,
      node: node.toJSON(),
      fusion: fusionResult
    });

    return {
      telemetry,
      fusion: fusionResult
    };
  }

  getRecentVibrations(nodeId) {
    const vBuf = this.vibrationBuffers.get(nodeId);
    return vBuf ? vBuf : { s1: [], s2: [] };
  }

  getTelemetryHistory(nodeId, limit = 50) {
    const hist = this.telemetryHistory.get(nodeId) || [];
    return hist.slice(-limit);
  }

  updateNodeConfig(nodeId, updates) {
    const node = this.nodes.get(nodeId);
    if (!node) return null;

    if (updates.name) node.name = updates.name;
    if (updates.position) node.position = updates.position;
    if (updates.sensorSpacing) node.sensorSpacing = updates.sensorSpacing;
    if (updates.communication) node.communication = updates.communication;

    realtimeService.broadcast('NODE_CONFIG_UPDATED', node.toJSON());
    return node.toJSON();
  }

  checkNodeHealth() {
    const now = Date.now();
    for (const [nodeId, node] of this.nodes.entries()) {
      const elapsed = now - node.lastSeen;

      if (elapsed > config.NODE_OFFLINE_TIMEOUT_MS) {
        if (node.status !== 'OFFLINE') {
          node.status = 'OFFLINE';
          console.warn(`[NodeHealth] Node ${nodeId} has transitioned to OFFLINE (last seen ${Math.round(elapsed / 1000)}s ago)`);
          realtimeService.broadcast('NODE_OFFLINE', { nodeId, lastSeen: node.lastSeen });
        }
      } else if (elapsed > config.NODE_HEARTBEAT_TIMEOUT_MS) {
        if (node.status === 'ONLINE') {
          node.status = 'WARNING';
          console.warn(`[NodeHealth] Node ${nodeId} missed heartbeats, state set to WARNING`);
          realtimeService.broadcast('NODE_WARNING', { nodeId, elapsed });
        }
      }
    }
  }
}

module.exports = new NodeManager();
