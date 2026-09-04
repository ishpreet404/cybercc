/**
 * Cyber Chaukidaar - Events API Routes
 */

const express = require('express');
const router = express.Router();
const nodeManager = require('../services/nodeManager');

// GET /api/events - List recent detection events across all nodes
router.get('/', (req, res) => {
  const nodes = nodeManager.getAllNodes();
  const allEvents = [];

  for (const node of nodes) {
    const history = nodeManager.getTelemetryHistory(node.nodeId, 20);
    for (const item of history) {
      if (item.fusion && item.fusion.isAlertCandidate) {
        allEvents.push({
          id: `EVT-${item.timestamp}-${node.nodeId}`,
          nodeId: node.nodeId,
          timestamp: item.timestamp,
          type: item.fusion.eventType,
          severity: item.fusion.severity,
          confidence: item.fusion.confidence,
          evidence: item.fusion.evidence,
          evidenceBreakdown: item.fusion.evidenceBreakdown,
          estimatedPosition: item.fusion.estimatedPosition,
          classification: item.fusion.classification
        });
      }
    }
  }

  allEvents.sort((a, b) => b.timestamp - a.timestamp);

  res.json({
    success: true,
    data: allEvents.slice(0, 50)
  });
});

module.exports = router;
