/**
 * Cyber Chaukidaar - System Health & Demo Controller Routes
 */

const express = require('express');
const router = express.Router();
const nodeManager = require('../services/nodeManager');
const cameraService = require('../services/cameraService');

// Shared reference to simulationEngine is attached via app.locals
router.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'OPERATIONAL',
      service: 'Cyber Chaukidaar Central Gateway',
      version: '1.0.0',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cameraMode: cameraService.getMode(),
      nodesRegistered: nodeManager.getAllNodes().length,
      timestamp: Date.now()
    }
  });
});

// POST /api/system/demo/start - Trigger 7-step Hackathon live demo sequence
router.post('/demo/start', (req, res) => {
  const simulationEngine = req.app.locals.simulationEngine;
  const targetNodeId = req.body.nodeId || 'NODE-001';

  if (!simulationEngine) {
    return res.status(500).json({ success: false, error: 'Simulation engine not initialized' });
  }

  simulationEngine.demoController.start7StepDemo(targetNodeId);

  res.json({
    success: true,
    message: `Started 7-step live hackathon demo sequence on ${targetNodeId}`,
    mode: 'DEMO_MODE'
  });
});

// POST /api/system/demo/stop - Stop 7-step demo sequence
router.post('/demo/stop', (req, res) => {
  const simulationEngine = req.app.locals.simulationEngine;
  if (simulationEngine) {
    simulationEngine.demoController.stopDemo();
  }
  res.json({ success: true, message: 'Demo stopped' });
});

// POST /api/system/demo/scenario - Apply a deterministic scenario (1-6)
router.post('/demo/scenario', (req, res) => {
  const simulationEngine = req.app.locals.simulationEngine;
  const { scenarioId, nodeId = 'NODE-001' } = req.body;

  if (!simulationEngine) {
    return res.status(500).json({ success: false, error: 'Simulation engine not initialized' });
  }

  try {
    const result = simulationEngine.demoController.applyScenario(scenarioId, nodeId);
    res.json({
      success: true,
      scenario: scenarioId,
      nodeId: nodeId,
      result: result
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/system/camera/mode - Toggle Camera mode (REAL_CAMERA_MODE vs SIMULATION_MODE)
router.post('/camera/mode', (req, res) => {
  const { mode } = req.body;
  cameraService.setMode(mode);
  res.json({ success: true, cameraMode: cameraService.getMode() });
});

module.exports = router;
