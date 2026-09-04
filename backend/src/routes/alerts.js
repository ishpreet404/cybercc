/**
 * Cyber Chaukidaar - Alerts API Routes
 */

const express = require('express');
const router = express.Router();
const alertManager = require('../services/alertManager');

// GET /api/alerts - List alerts
router.get('/', (req, res) => {
  const status = req.query.status;
  const limit = parseInt(req.query.limit) || 50;
  
  let alerts = [];
  if (status === 'active') {
    alerts = alertManager.getActiveAlerts();
  } else {
    alerts = alertManager.getAllAlerts(limit);
  }

  res.json({
    success: true,
    data: alerts
  });
});

// POST /api/alerts/:id/ack - Acknowledge alert
router.post('/:id/ack', (req, res) => {
  const alert = alertManager.acknowledge(req.params.id);
  if (!alert) {
    return res.status(404).json({
      success: false,
      error: { code: 'ALERT_NOT_FOUND', message: `Alert ${req.params.id} not found` }
    });
  }
  res.json({ success: true, data: alert });
});

// POST /api/alerts/:id/resolve - Resolve alert
router.post('/:id/resolve', (req, res) => {
  const alert = alertManager.resolve(req.params.id);
  if (!alert) {
    return res.status(404).json({
      success: false,
      error: { code: 'ALERT_NOT_FOUND', message: `Alert ${req.params.id} not found` }
    });
  }
  res.json({ success: true, data: alert });
});

// POST /api/alerts/:id/dismiss - Dismiss alert
router.post('/:id/dismiss', (req, res) => {
  const alert = alertManager.dismiss(req.params.id);
  if (!alert) {
    return res.status(404).json({
      success: false,
      error: { code: 'ALERT_NOT_FOUND', message: `Alert ${req.params.id} not found` }
    });
  }
  res.json({ success: true, data: alert });
});

module.exports = router;
