/**
 * Cyber Chaukidaar - Intrusion Event Model
 */

class Event {
  constructor(data) {
    this.id = data.id || `EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    this.nodeId = data.nodeId;
    this.timestamp = data.timestamp || Date.now();
    this.type = data.type || 'POTENTIAL_INTRUSION'; // POTENTIAL_HUMAN_ACTIVITY, VEHICLE_MOVEMENT, ENVIRONMENTAL_ANOMALY
    this.classification = data.classification || 'UNKNOWN'; // FOOTSTEP_HUMAN, VEHICLE, ENVIRONMENTAL, NORMAL
    this.confidence = Number((data.confidence || 0.5).toFixed(2));
    this.severity = data.severity || 'MEDIUM'; // INFO, LOW, MEDIUM, HIGH, CRITICAL
    
    this.estimatedPosition = data.estimatedPosition || {
      x: 0,
      y: 0,
      confidence: 0,
      label: 'ESTIMATED POSITION'
    };

    this.evidence = {
      radar: Boolean(data.evidence && data.evidence.radar),
      vibrationSensor1: Boolean(data.evidence && data.evidence.vibrationSensor1),
      vibrationSensor2: Boolean(data.evidence && data.evidence.vibrationSensor2),
      camera: Boolean(data.evidence && data.evidence.camera),
      ml: Boolean(data.evidence && data.evidence.ml)
    };

    this.details = data.details || {};
  }
}

module.exports = Event;
