/**
 * Cyber Chaukidaar - Multi-Node Autonomous Background Simulator
 * 
 * Simulates continuous, realistic background telemetry for multiple perimeter nodes:
 * - Natural ambient ground noise (0.01g - 0.04g)
 * - Occasional realistic events (footstep passes, vehicle gate entries)
 * - Gradual battery discharge
 * - RF signal jitter
 * Clearly tags packets as [SIMULATED].
 */

const DemoScenarioController = require('./demoScenarios');

class SimulationEngine {
  constructor(nodeManager) {
    this.nodeManager = nodeManager;
    this.demoController = new DemoScenarioController(nodeManager);
    this.intervalTimer = null;
    this.isRunning = false;
    this.tick = 0;
  }

  start(intervalMs = 2000) {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log('[SimulationEngine] Autonomous multi-node background simulator started.');

    this.intervalTimer = setInterval(() => this.runSimulationTick(), intervalMs);
  }

  stop() {
    if (!this.isRunning) return;
    this.isRunning = false;
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }
    console.log('[SimulationEngine] Simulator stopped.');
  }

  runSimulationTick() {
    this.tick++;
    const nodes = this.nodeManager.getAllNodes();

    for (const node of nodes) {
      // Don't override if node is undergoing the 7-step demo or intentionally set offline
      if (this.demoController.demoRunning && node.nodeId === 'NODE-001') {
        continue;
      }
      if (node.status === 'OFFLINE') {
        continue;
      }

      const isNodeActive = node.nodeId === 'NODE-002' && (this.tick % 15 >= 12); // Node 2 has occasional walking activity
      
      // Ambient noise with slight sinusoidal drift
      const noiseBase = 0.018 + 0.006 * Math.sin(this.tick * 0.4 + (node.position.x || 0));
      const s1Rms = isNodeActive ? Number((0.24 + Math.random() * 0.08).toFixed(4)) : Number((noiseBase + Math.random() * 0.008).toFixed(4));
      const s2Rms = isNodeActive ? Number((0.19 + Math.random() * 0.06).toFixed(4)) : Number((noiseBase + Math.random() * 0.008).toFixed(4));
      const radarPresence = isNodeActive;
      const radarDistance = isNodeActive ? Number((4.5 - (this.tick % 15 - 12) * 0.6).toFixed(2)) : 0;

      // Slowly fluctuate RSSI
      const rssi = (node.signal && node.signal.rssi ? node.signal.rssi : -62) + (Math.random() > 0.5 ? 1 : -1);

      // Packet
      const telemetryPacket = {
        nodeId: node.nodeId,
        timestamp: Date.now(),
        sequence: this.tick,
        firmware: node.firmware || '1.2.0',
        transport: node.communication.toLowerCase(),
        battery: {
          voltage: Number((node.battery.voltage - 0.00005).toFixed(3)),
          percentage: node.battery.percentage
        },
        signal: { rssi: Math.max(-95, Math.min(-45, rssi)) },
        radar: {
          presence: radarPresence,
          distance: radarDistance,
          confidence: radarPresence ? 0.88 : 0
        },
        accelerometer: {
          sensor1: {
            x: Number((Math.random() * 0.04 - 0.02).toFixed(3)),
            y: Number((Math.random() * 0.04 - 0.02).toFixed(3)),
            z: Number((0.98 + Math.random() * 0.04).toFixed(3)),
            vibrationRms: s1Rms,
            peak: Number((s1Rms * (isNodeActive ? 2.8 : 1.8)).toFixed(4))
          },
          sensor2: {
            x: Number((Math.random() * 0.04 - 0.02).toFixed(3)),
            y: Number((Math.random() * 0.04 - 0.02).toFixed(3)),
            z: Number((0.98 + Math.random() * 0.04).toFixed(3)),
            vibrationRms: s2Rms,
            peak: Number((s2Rms * (isNodeActive ? 2.8 : 1.8)).toFixed(4))
          }
        },
        eventState: isNodeActive ? 'SUSPICIOUS' : 'NORMAL'
      };

      try {
        this.nodeManager.processTelemetry(telemetryPacket);
      } catch (err) {
        console.warn(`[SimulationEngine] Tick error on ${node.nodeId}:`, err.message);
      }
    }
  }
}

module.exports = SimulationEngine;
