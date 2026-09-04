/**
 * Cyber Chaukidaar - Telemetry Ingestion API Route
 */

const express = require('express');
const router = express.Router();
const nodeManager = require('../services/nodeManager');

// POST /api/telemetry - Ingest telemetry packet from physical ESP32 or gateway
router.post('/', (req, res) => {
  try {
    const result = nodeManager.processTelemetry(req.body);
    res.status(200).json({
      success: true,
      data: {
        received: true,
        nodeId: req.body.nodeId,
        timestamp: Date.now(),
        alertCandidate: result.fusion ? result.fusion.isAlertCandidate : false
      }
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: { code: 'INVALID_TELEMETRY', message: err.message }
    });
  }
});

module.exports = router;
