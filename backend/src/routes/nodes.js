/**
 * Cyber Chaukidaar - Node Management API Routes
 */

const express = require('express');
const router = express.Router();
const nodeManager = require('../services/nodeManager');

// GET /api/nodes - List all nodes with current statuses
router.get('/', (req, res) => {
  const nodes = nodeManager.getAllNodes();
  res.json({
    success: true,
    data: nodes
  });
});

// POST /api/nodes/register - Register a new physical node
router.post('/register', (req, res) => {
  try {
    const node = nodeManager.registerNode(req.body);
    res.status(201).json({
      success: true,
      data: node
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: { code: 'REGISTRATION_ERROR', message: err.message }
    });
  }
});

// GET /api/nodes/:id - Get specific node details
router.get('/:id', (req, res) => {
  const node = nodeManager.getNode(req.params.id);
  if (!node) {
    return res.status(404).json({
      success: false,
      error: { code: 'NODE_NOT_FOUND', message: `Node ${req.params.id} does not exist` }
    });
  }
  res.json({
    success: true,
    data: node
  });
});

// PUT /api/nodes/:id - Update node configuration
router.put('/:id', (req, res) => {
  const updated = nodeManager.updateNodeConfig(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({
      success: false,
      error: { code: 'NODE_NOT_FOUND', message: `Node ${req.params.id} not found` }
    });
  }
  res.json({
    success: true,
    data: updated
  });
});

// GET /api/nodes/:id/vibration - Get recent raw vibration waveform samples
router.get('/:id/vibration', (req, res) => {
  const node = nodeManager.getNode(req.params.id);
  if (!node) {
    return res.status(404).json({
      success: false,
      error: { code: 'NODE_NOT_FOUND', message: `Node ${req.params.id} not found` }
    });
  }

  const vibrations = nodeManager.getRecentVibrations(req.params.id);
  res.json({
    success: true,
    data: {
      nodeId: req.params.id,
      sensor1: vibrations.s1,
      sensor2: vibrations.s2,
      samplingRateHz: 100
    }
  });
});

// GET /api/nodes/:id/radar - Get current radar sensor status
router.get('/:id/radar', (req, res) => {
  const node = nodeManager.getNode(req.params.id);
  if (!node) {
    return res.status(404).json({
      success: false,
      error: { code: 'NODE_NOT_FOUND', message: `Node ${req.params.id} not found` }
    });
  }

  res.json({
    success: true,
    data: {
      nodeId: req.params.id,
      radar: node.sensors.radar
    }
  });
});

// GET /api/nodes/:id/telemetry - Historical telemetry
router.get('/:id/telemetry', (req, res) => {
  const limit = parseInt(req.query.limit) || 30;
  const history = nodeManager.getTelemetryHistory(req.params.id, limit);
  res.json({
    success: true,
    data: history
  });
});

module.exports = router;
