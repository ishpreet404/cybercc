/**
 * Cyber Chaukidaar - Dashboard Overview API Route
 */

const express = require('express');
const router = express.Router();
const nodeManager = require('../services/nodeManager');
const alertManager = require('../services/alertManager');

// GET /api/dashboard/overview - Global perimeter summary statistics
router.get('/overview', (req, res) => {
  const nodes = nodeManager.getAllNodes();
  const activeAlerts = alertManager.getActiveAlerts();

  let onlineCount = 0;
  let warningCount = 0;
  let alertCount = 0;
  let offlineCount = 0;
  let lowBatteryCount = 0;

  for (const node of nodes) {
    if (node.status === 'ONLINE') onlineCount++;
    else if (node.status === 'WARNING') warningCount++;
    else if (node.status === 'ALERT') alertCount++;
    else if (node.status === 'OFFLINE') offlineCount++;

    if (node.battery && node.battery.percentage < 20) {
      lowBatteryCount++;
    }
  }

  res.json({
    success: true,
    data: {
      totalNodes: nodes.length,
      onlineNodes: onlineCount,
      warningNodes: warningCount,
      alertNodes: alertCount,
      offlineNodes: offlineCount,
      lowBatteryNodes: lowBatteryCount,
      activeAlertsCount: activeAlerts.length,
      activeAlerts: activeAlerts.slice(0, 5),
      nodes: nodes,
      systemStatus: alertCount > 0 ? 'CRITICAL_PERIMETER_ALERT' : (warningCount > 0 ? 'WARNING_ANOMALY' : 'SECURE_MONITORING'),
      timestamp: Date.now()
    }
  });
});

module.exports = router;
