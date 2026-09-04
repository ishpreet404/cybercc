/**
 * Cyber Chaukidaar - Hackathon 7-Step Demo Controller & Scenarios
 * 
 * Provides deterministic, verifiable scenarios for live jury demonstration.
 * Labels all outputs clearly with [DEMO_MODE].
 */

class DemoScenarioController {
  constructor(nodeManager) {
    this.nodeManager = nodeManager;
    this.activeDemoTimer = null;
    this.currentStep = null;
    this.demoRunning = false;
  }

  /**
   * Execute the 7-step Hackathon live demo sequence on NODE-001 (or targetNode)
   * T+00: Radar detects movement
   * T+01: ADXL #1 detects vibration
   * T+02: ADXL #2 detects vibration
   * T+03: Random Forest classification
   * T+04: Camera verification
   * T+05: Fusion confidence increases
   * T+06: Alert transmitted
   * T+07: Dashboard shows HIGH-CONFIDENCE EVENT
   */
  start7StepDemo(targetNodeId = 'NODE-001', onStepCallback = null) {
    if (this.demoRunning) {
      this.stopDemo();
    }

    this.demoRunning = true;
    console.log(`[HACKATHON DEMO] Starting 7-step live sequence on ${targetNodeId}...`);

    const steps = [
      {
        step: 0,
        t: 'T+00s',
        name: 'RADAR_DETECTS_MOVEMENT',
        description: '24GHz mmWave radar acquires target moving at 4.8m perimeter distance',
        payload: {
          nodeId: targetNodeId,
          radar: { presence: true, distance: 4.8, confidence: 0.88 },
          accelerometer: {
            sensor1: { x: 0.02, y: 0.01, z: 1.0, vibrationRms: 0.03, peak: 0.05 },
            sensor2: { x: 0.01, y: 0.02, z: 1.0, vibrationRms: 0.03, peak: 0.04 }
          },
          eventState: 'SUSPICIOUS'
        }
      },
      {
        step: 1,
        t: 'T+01s',
        name: 'ADXL1_DETECTS_VIBRATION',
        description: 'ADXL345 #1 (ground probe A) registers first mechanical foot shockwave (RMS 0.22g)',
        payload: {
          nodeId: targetNodeId,
          radar: { presence: true, distance: 4.5, confidence: 0.90 },
          accelerometer: {
            sensor1: { x: 0.18, y: 0.09, z: 0.96, vibrationRms: 0.22, peak: 0.48 },
            sensor2: { x: 0.03, y: 0.02, z: 1.0, vibrationRms: 0.05, peak: 0.08 }
          },
          eventState: 'SUSPICIOUS'
        }
      },
      {
        step: 2,
        t: 'T+02s',
        name: 'ADXL2_DETECTS_VIBRATION',
        description: 'ADXL345 #2 (ground probe B) registers delayed shockwave (RMS 0.18g), confirming dual-seismic spatial wave',
        payload: {
          nodeId: targetNodeId,
          radar: { presence: true, distance: 4.2, confidence: 0.92 },
          accelerometer: {
            sensor1: { x: 0.24, y: 0.11, z: 0.94, vibrationRms: 0.29, peak: 0.58 },
            sensor2: { x: 0.15, y: 0.08, z: 0.97, vibrationRms: 0.21, peak: 0.42 }
          },
          eventState: 'VERIFYING'
        }
      },
      {
        step: 3,
        t: 'T+03s',
        name: 'RANDOM_FOREST_CLASSIFICATION',
        description: 'Feature extractor computes 8 spectral features (cadence 520ms, 8.4Hz). Local RF model classifies: FOOTSTEP_HUMAN (91% conf)',
        payload: {
          nodeId: targetNodeId,
          radar: { presence: true, distance: 3.9, confidence: 0.92 },
          accelerometer: {
            sensor1: {
              x: 0.28, y: 0.14, z: 0.93, vibrationRms: 0.34, peak: 0.65,
              features: {
                rms: 0.34, peak: 0.65, peakToPeak: 0.98, variance: 0.0115,
                dominantFrequency: 8.4, spectralEnergy: 0.28, spectralCentroid: 11.2, interPeakInterval: 520
              }
            },
            sensor2: {
              x: 0.20, y: 0.10, z: 0.95, vibrationRms: 0.26, peak: 0.52,
              features: {
                rms: 0.26, peak: 0.52, peakToPeak: 0.82, variance: 0.0078,
                dominantFrequency: 8.4, spectralEnergy: 0.21, spectralCentroid: 11.0, interPeakInterval: 520
              }
            }
          },
          eventState: 'CLASSIFIED'
        }
      },
      {
        step: 4,
        t: 'T+04s',
        name: 'CAMERA_VERIFICATION',
        description: 'Optical camera verification modality triggers: target classified as HUMAN_PEDESTRIAN with bounding box',
        payload: {
          nodeId: targetNodeId,
          radar: { presence: true, distance: 3.6, confidence: 0.94 },
          accelerometer: {
            sensor1: { x: 0.31, y: 0.15, z: 0.92, vibrationRms: 0.36, peak: 0.70 },
            sensor2: { x: 0.22, y: 0.12, z: 0.94, vibrationRms: 0.28, peak: 0.56 }
          },
          eventState: 'CAMERA_CONFIRMED'
        }
      },
      {
        step: 5,
        t: 'T+05s',
        name: 'FUSION_CONFIDENCE_SURGE',
        description: 'Multi-modal fusion engine aggregates Radar (0.35) + Dual ADXL (0.30) + RF ML (0.14) + Camera (0.18) -> 94% confidence',
        payload: {
          nodeId: targetNodeId,
          radar: { presence: true, distance: 3.4, confidence: 0.95 },
          accelerometer: {
            sensor1: { x: 0.35, y: 0.18, z: 0.91, vibrationRms: 0.38, peak: 0.76 },
            sensor2: { x: 0.26, y: 0.14, z: 0.93, vibrationRms: 0.31, peak: 0.62 }
          },
          eventState: 'FUSION_HIGH_CONFIDENCE'
        }
      },
      {
        step: 6,
        t: 'T+06s',
        name: 'ALERT_TRANSMITTED',
        description: 'Node initiates priority transport transmission; central server generates CRITICAL operator alert',
        payload: {
          nodeId: targetNodeId,
          radar: { presence: true, distance: 3.2, confidence: 0.96 },
          accelerometer: {
            sensor1: { x: 0.33, y: 0.16, z: 0.92, vibrationRms: 0.35, peak: 0.72 },
            sensor2: { x: 0.25, y: 0.13, z: 0.94, vibrationRms: 0.29, peak: 0.58 }
          },
          eventState: 'ALERT'
        }
      },
      {
        step: 7,
        t: 'T+07s',
        name: 'HIGH_CONFIDENCE_EVENT',
        description: 'Tactical command center triggers perimeter alarm siren, marks intruder 2D location on map, and displays evidence breakdown',
        payload: {
          nodeId: targetNodeId,
          radar: { presence: true, distance: 3.0, confidence: 0.96 },
          accelerometer: {
            sensor1: { x: 0.32, y: 0.15, z: 0.92, vibrationRms: 0.33, peak: 0.68 },
            sensor2: { x: 0.24, y: 0.12, z: 0.94, vibrationRms: 0.27, peak: 0.54 }
          },
          eventState: 'ALERT'
        }
      }
    ];

    let currentStepIndex = 0;

    const executeNextStep = () => {
      if (!this.demoRunning || currentStepIndex >= steps.length) {
        this.demoRunning = false;
        console.log('[HACKATHON DEMO] Sequence completed successfully.');
        return;
      }

      const step = steps[currentStepIndex];
      this.currentStep = step;

      console.log(`[DEMO STEP ${step.step}] ${step.t}: ${step.name} - ${step.description}`);

      try {
        const result = this.nodeManager.processTelemetry(step.payload);
        if (onStepCallback) {
          onStepCallback({ step, result });
        }
      } catch (err) {
        console.error('[DEMO ERROR] Step execution failed:', err.message);
      }

      currentStepIndex++;
      this.activeDemoTimer = setTimeout(executeNextStep, 1500); // 1.5s per step for clear viewing
    };

    executeNextStep();
  }

  stopDemo() {
    this.demoRunning = false;
    if (this.activeDemoTimer) {
      clearTimeout(this.activeDemoTimer);
      this.activeDemoTimer = null;
    }
    this.currentStep = null;
    console.log('[HACKATHON DEMO] Demo sequence stopped.');
  }

  /**
   * Apply one of the 6 standard deterministic scenarios
   */
  applyScenario(scenarioId, targetNodeId = 'NODE-001') {
    console.log(`[DEMO SCENARIOS] Applying scenario ${scenarioId} on ${targetNodeId}`);

    switch (scenarioId) {
      case 'SCENARIO_1_NORMAL':
        // Normal ambient environment
        return this.nodeManager.processTelemetry({
          nodeId: targetNodeId,
          radar: { presence: false, distance: 0, confidence: 0 },
          accelerometer: {
            sensor1: { x: 0.01, y: 0.01, z: 1.0, vibrationRms: 0.02, peak: 0.04 },
            sensor2: { x: 0.01, y: 0.01, z: 1.0, vibrationRms: 0.02, peak: 0.04 }
          },
          eventState: 'NORMAL'
        });

      case 'SCENARIO_2_ENVIRONMENTAL':
        // Environmental vibration (wind / distant seismic rumble, no radar)
        return this.nodeManager.processTelemetry({
          nodeId: targetNodeId,
          radar: { presence: false, distance: 0, confidence: 0 },
          accelerometer: {
            sensor1: {
              x: 0.12, y: 0.15, z: 0.95, vibrationRms: 0.18, peak: 0.35,
              features: {
                rms: 0.18, peak: 0.35, peakToPeak: 0.55, variance: 0.0035,
                dominantFrequency: 22.0, spectralEnergy: 0.15, spectralCentroid: 28.5, interPeakInterval: 80.0
              }
            },
            sensor2: {
              x: 0.10, y: 0.14, z: 0.96, vibrationRms: 0.16, peak: 0.32,
              features: {
                rms: 0.16, peak: 0.32, peakToPeak: 0.50, variance: 0.0028,
                dominantFrequency: 22.0, spectralEnergy: 0.12, spectralCentroid: 28.0, interPeakInterval: 80.0
              }
            }
          },
          eventState: 'ENVIRONMENTAL'
        });

      case 'SCENARIO_3_HUMAN_MOVEMENT':
        // Suspicious human movement (radar active + sensor 1 high)
        return this.nodeManager.processTelemetry({
          nodeId: targetNodeId,
          radar: { presence: true, distance: 5.2, confidence: 0.85 },
          accelerometer: {
            sensor1: { x: 0.22, y: 0.11, z: 0.95, vibrationRms: 0.24, peak: 0.51 },
            sensor2: { x: 0.08, y: 0.04, z: 0.99, vibrationRms: 0.09, peak: 0.18 }
          },
          eventState: 'SUSPICIOUS'
        });

      case 'SCENARIO_4_HIGH_CONFIDENCE':
        // High confidence dual-sensor + radar + camera verification
        return this.nodeManager.processTelemetry({
          nodeId: targetNodeId,
          radar: { presence: true, distance: 4.1, confidence: 0.95 },
          accelerometer: {
            sensor1: {
              x: 0.35, y: 0.18, z: 0.92, vibrationRms: 0.38, peak: 0.75,
              features: {
                rms: 0.38, peak: 0.75, peakToPeak: 1.12, variance: 0.0145,
                dominantFrequency: 7.8, spectralEnergy: 0.34, spectralCentroid: 10.8, interPeakInterval: 540
              }
            },
            sensor2: {
              x: 0.28, y: 0.14, z: 0.93, vibrationRms: 0.30, peak: 0.60,
              features: {
                rms: 0.30, peak: 0.60, peakToPeak: 0.92, variance: 0.0095,
                dominantFrequency: 7.8, spectralEnergy: 0.26, spectralCentroid: 10.5, interPeakInterval: 540
              }
            }
          },
          eventState: 'ALERT'
        });

      case 'SCENARIO_5_NODE_OFFLINE':
        // Force node offline
        const node = this.nodeManager.nodes.get(targetNodeId);
        if (node) {
          node.status = 'OFFLINE';
          node.lastSeen = Date.now() - 120000; // 2 minutes ago
        }
        return { success: true, message: `Node ${targetNodeId} forced to OFFLINE` };

      case 'SCENARIO_6_LOW_BATTERY':
        // Low battery alert
        return this.nodeManager.processTelemetry({
          nodeId: targetNodeId,
          battery: { voltage: 3.35, percentage: 11 }, // Critical battery
          radar: { presence: false, distance: 0, confidence: 0 },
          accelerometer: {
            sensor1: { x: 0.01, y: 0.01, z: 1.0, vibrationRms: 0.02, peak: 0.04 },
            sensor2: { x: 0.01, y: 0.01, z: 1.0, vibrationRms: 0.02, peak: 0.04 }
          },
          eventState: 'NORMAL'
        });

      default:
        throw new Error(`Unknown scenario: ${scenarioId}`);
    }
  }

  getStatus() {
    return {
      demoRunning: this.demoRunning,
      currentStep: this.currentStep,
      mode: 'DEMO_MODE'
    };
  }
}

module.exports = DemoScenarioController;
