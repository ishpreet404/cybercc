/**
 * Cyber Chaukidaar - Alert Manager Service
 * Manages alert lifecycle, persistence, acknowledgement, and rate-limiting
 */

const Alert = require('../models/alert');
const realtimeService = require('./realtime');

class AlertManager {
  constructor() {
    this.alerts = new Map(); // id -> Alert
    this.lastAlertTimeByNode = new Map(); // nodeId -> timestamp
    this.alertCooldownMs = 4000; // Minimum interval between new alerts per node
  }

  createAlertFromFusion(node, fusionResult) {
    const now = Date.now();
    const lastTime = this.lastAlertTimeByNode.get(node.nodeId) || 0;

    // Check cooldown unless severity is CRITICAL
    if (now - lastTime < this.alertCooldownMs && fusionResult.severity !== 'CRITICAL') {
      return null;
    }

    const alert = new Alert({
      eventId: `EVT-${now}`,
      nodeId: node.nodeId,
      title: `${fusionResult.severity} Threat: ${fusionResult.eventType.replace(/_/g, ' ')}`,
      message: `Node ${node.name} flagged target with ${(fusionResult.confidence * 100).toFixed(0)}% confidence at distance ~${fusionResult.estimatedPosition.distanceMeters || '4'}m`,
      severity: fusionResult.severity,
      confidence: fusionResult.confidence,
      estimatedPosition: fusionResult.estimatedPosition,
      evidence: fusionResult.evidence,
      createdAt: now
    });

    this.alerts.set(alert.id, alert);
    this.lastAlertTimeByNode.set(node.nodeId, now);

    // Update node status
    node.status = fusionResult.severity === 'CRITICAL' ? 'ALERT' : 'WARNING';
    node.activeEvent = {
      type: fusionResult.eventType,
      confidence: fusionResult.confidence,
      severity: fusionResult.severity,
      timestamp: now
    };

    console.log(`[ALERT] [${alert.severity}] Node ${node.nodeId}: ${alert.title} (Conf: ${alert.confidence})`);

    // Broadcast via WebSocket
    realtimeService.broadcast('ALERT_CREATED', alert);

    return alert;
  }

  acknowledge(alertId) {
    const alert = this.alerts.get(alertId);
    if (!alert) return null;

    alert.acknowledge();
    realtimeService.broadcast('ALERT_ACKNOWLEDGED', alert);
    return alert;
  }

  resolve(alertId) {
    const alert = this.alerts.get(alertId);
    if (!alert) return null;

    alert.resolve();
    realtimeService.broadcast('ALERT_RESOLVED', alert);
    return alert;
  }

  dismiss(alertId) {
    const alert = this.alerts.get(alertId);
    if (!alert) return null;

    alert.dismiss();
    realtimeService.broadcast('ALERT_DISMISSED', alert);
    return alert;
  }

  getActiveAlerts() {
    return Array.from(this.alerts.values())
      .filter(a => a.status === 'NEW' || a.status === 'ACKNOWLEDGED')
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  getAllAlerts(limit = 50) {
    return Array.from(this.alerts.values())
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);
  }
}

module.exports = new AlertManager();
