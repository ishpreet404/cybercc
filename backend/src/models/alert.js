/**
 * Cyber Chaukidaar - Operator Alert Model
 */

class Alert {
  constructor(data) {
    this.id = data.id || `ALT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    this.eventId = data.eventId;
    this.nodeId = data.nodeId;
    this.title = data.title || 'Perimeter Intrusion Alert';
    this.message = data.message || 'Suspicious physical activity flagged at perimeter node';
    this.severity = data.severity || 'HIGH'; // INFO, LOW, MEDIUM, HIGH, CRITICAL
    this.status = data.status || 'NEW'; // NEW, ACKNOWLEDGED, RESOLVED, DISMISSED
    this.confidence = data.confidence || 0.85;
    this.estimatedPosition = data.estimatedPosition || null;
    this.evidence = data.evidence || {};
    this.createdAt = data.createdAt || Date.now();
    this.acknowledgedAt = data.acknowledgedAt || null;
    this.resolvedAt = data.resolvedAt || null;
  }

  acknowledge() {
    this.status = 'ACKNOWLEDGED';
    this.acknowledgedAt = Date.now();
  }

  resolve() {
    this.status = 'RESOLVED';
    this.resolvedAt = Date.now();
  }

  dismiss() {
    this.status = 'DISMISSED';
    this.resolvedAt = Date.now();
  }
}

module.exports = Alert;
