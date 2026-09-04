/**
 * Cyber Chaukidaar - Multi-Modal Sensor Fusion Engine
 * 
 * Fuses 3 physical sensing modalities:
 *   1. 24GHz mmWave Radar (Presence, Radial Distance, Motion Energy)
 *   2. ADXL345 #1 Seismic Accelerometer (RMS, Peak, 8-feature spectral signatures)
 *   3. ADXL345 #2 Seismic Accelerometer (Attenuation baseline & cross-correlation)
 *   4. Machine Learning Classification (Random Forest inference on vibration)
 *   5. Optional Camera Visual Verification (Person/vehicle detection bounding box)
 * 
 * Provides a transparent, explainable decision tree with itemized evidence breakdown.
 */

const localizationEngine = require('./localization');

class SensorFusionEngine {
  constructor(options = {}) {
    this.vibrationThresholdNormal = options.vibrationThresholdNormal || 0.08;
    this.vibrationThresholdElevated = options.vibrationThresholdElevated || 0.15;
    this.vibrationThresholdHigh = options.vibrationThresholdHigh || 0.25;
  }

  /**
   * Evaluate multi-modal evidence and synthesize confidence score & alert decision
   * @param {Object} input
   * @param {string} input.nodeId
   * @param {Object} input.radar - { presence, distance, confidence }
   * @param {Object} input.sensor1 - { vibrationRms, peak, features }
   * @param {Object} input.sensor2 - { vibrationRms, peak, features }
   * @param {Object} [input.mlClassification] - { classification, confidence, explanation }
   * @param {Object} [input.camera] - { verified, confidence, label }
   * @param {number} [input.sensorSpacing=1.5]
   * @returns {Object} Fused event assessment
   */
  evaluate(input) {
    const radar = input.radar || { presence: false, distance: 0, confidence: 0 };
    const s1 = input.sensor1 || { vibrationRms: 0.02, peak: 0.03 };
    const s2 = input.sensor2 || { vibrationRms: 0.02, peak: 0.03 };
    const ml = input.mlClassification || { classification: 'NORMAL', confidence: 0.5 };
    const camera = input.camera || { verified: false, confidence: 0, label: 'NONE' };

    // 1. Evidence Extraction
    const radarActive = Boolean(radar.presence && radar.distance > 0 && radar.distance <= 8.5);
    const s1Elevated = s1.vibrationRms >= this.vibrationThresholdNormal;
    const s2Elevated = s2.vibrationRms >= this.vibrationThresholdNormal;
    const s1High = s1.vibrationRms >= this.vibrationThresholdElevated;
    const s2High = s2.vibrationRms >= this.vibrationThresholdElevated;
    
    // Cross-sensor seismic correlation (both probes felt the wave)
    const seismicDualConfirmation = s1Elevated && s2Elevated;
    const mlHumanOrVehicle = ml.classification === 'FOOTSTEP_HUMAN' || ml.classification === 'VEHICLE';
    const cameraVerified = Boolean(camera.verified && camera.confidence > 0.6);

    // 2. Multi-point Evidence Scoring (Non-linear Bayesian-style belief accumulation)
    let score = 0.0;
    const evidenceList = [];

    // Radar evidence (Max +0.35)
    if (radarActive) {
      const radarWeight = Math.min(0.35, 0.20 + (radar.confidence || 0.8) * 0.15);
      score += radarWeight;
      evidenceList.push(`Radar confirmed presence at ${radar.distance}m`);
    }

    // Seismic Sensor #1 evidence (Max +0.15)
    if (s1High) {
      score += 0.15;
      evidenceList.push(`ADXL #1 registered strong vibration (RMS: ${s1.vibrationRms.toFixed(3)}g)`);
    } else if (s1Elevated) {
      score += 0.08;
      evidenceList.push(`ADXL #1 registered elevated vibration (RMS: ${s1.vibrationRms.toFixed(3)}g)`);
    }

    // Seismic Sensor #2 evidence (Max +0.15)
    if (s2High) {
      score += 0.15;
      evidenceList.push(`ADXL #2 registered strong vibration (RMS: ${s2.vibrationRms.toFixed(3)}g)`);
    } else if (s2Elevated) {
      score += 0.08;
      evidenceList.push(`ADXL #2 registered elevated vibration (RMS: ${s2.vibrationRms.toFixed(3)}g)`);
    }

    // 3-Point Dual Ground Synergy Bonus (+0.12 if both seismic sensors corroborate)
    if (seismicDualConfirmation) {
      score += 0.12;
      evidenceList.push('Dual-seismic cross-sensor spatial corroboration confirmed');
    }

    // ML Classification Evidence (Max +0.15)
    if (mlHumanOrVehicle) {
      const mlWeight = (ml.confidence || 0.8) * 0.15;
      score += mlWeight;
      evidenceList.push(`Local Random Forest identified ${ml.classification.replace('_', ' ')} (${(ml.confidence * 100).toFixed(0)}% model conf)`);
    }

    // Camera Visual Verification (Max +0.18)
    if (cameraVerified) {
      score += 0.18;
      evidenceList.push(`Visual camera verified target: ${camera.label || 'PERSON'} (${(camera.confidence * 100).toFixed(0)}% visual conf)`);
    }

    // Environmental penalty: if high seismic but radar is empty and ML says environmental, drop confidence
    if (!radarActive && ml.classification === 'ENVIRONMENTAL' && !cameraVerified) {
      score = Math.min(score, 0.45);
      evidenceList.push('High environmental seismic background suppresses false intrusion alarm');
    }

    // Cap confidence in [0.0, 0.98]
    const confidence = Number(Math.min(0.98, Math.max(0.05, score)).toFixed(2));

    // 3. Event Type & Severity Determination
    let eventType = 'NORMAL_MONITORING';
    let severity = 'INFO';

    if (confidence >= 0.85) {
      severity = 'CRITICAL';
      eventType = ml.classification === 'VEHICLE' ? 'VEHICLE_INTRUSION' : 'HIGH_CONFIDENCE_HUMAN_INTRUSION';
    } else if (confidence >= 0.70) {
      severity = 'HIGH';
      eventType = ml.classification === 'VEHICLE' ? 'VEHICLE_APPROACH' : 'POTENTIAL_HUMAN_ACTIVITY';
    } else if (confidence >= 0.50) {
      severity = 'MEDIUM';
      eventType = 'SUSPICIOUS_PERIMETER_MOVEMENT';
    } else if (confidence >= 0.30) {
      severity = 'LOW';
      eventType = 'ELEVATED_SEISMIC_NOISE';
    }

    // 4. Two-Sensor Localization Estimate
    const estimatedPosition = localizationEngine.estimatePosition({
      sensor1Intensity: s1.vibrationRms,
      sensor2Intensity: s2.vibrationRms,
      radarDistance: radar.distance,
      radarPresence: radar.presence,
      sensorSpacing: input.sensorSpacing || 1.5
    });

    return {
      nodeId: input.nodeId,
      timestamp: Date.now(),
      eventType: eventType,
      severity: severity,
      confidence: confidence,
      evidence: {
        radar: radarActive,
        vibrationSensor1: s1Elevated,
        vibrationSensor2: s2Elevated,
        camera: cameraVerified,
        ml: mlHumanOrVehicle
      },
      evidenceBreakdown: evidenceList,
      classification: ml.classification,
      mlModelMode: ml.mode || 'REAL_MODEL',
      estimatedPosition: estimatedPosition,
      isAlertCandidate: confidence >= 0.70
    };
  }
}

module.exports = new SensorFusionEngine();
