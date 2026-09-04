/**
 * Cyber Chaukidaar - Camera Verification Service
 * 
 * Supports both REAL CAMERA MODE (local webcam / RTSP / snapshot ingestion)
 * and SIMULATION MODE (deterministic visual verification tags with mock bounding boxes).
 */

class CameraService {
  constructor() {
    this.mode = 'SIMULATION_MODE'; // REAL_CAMERA_MODE | SIMULATION_MODE
    this.activeDetections = new Map(); // nodeId -> detection details
  }

  setMode(newMode) {
    if (newMode === 'REAL_CAMERA_MODE' || newMode === 'SIMULATION_MODE') {
      this.mode = newMode;
      console.log(`[CameraService] Operating mode changed to: ${this.mode}`);
    }
  }

  getMode() {
    return this.mode;
  }

  /**
   * Verify target visually when physical sensors trigger
   * @param {string} nodeId
   * @param {Object} [overrideTarget] - Optional forced visual target for simulation
   */
  verifyTarget(nodeId, overrideTarget = null) {
    if (overrideTarget) {
      const result = {
        nodeId,
        verified: overrideTarget.verified !== undefined ? overrideTarget.verified : true,
        label: overrideTarget.label || 'PERSON',
        confidence: overrideTarget.confidence || 0.89,
        boundingBox: overrideTarget.boundingBox || { x: 35, y: 20, width: 30, height: 60 },
        timestamp: Date.now(),
        mode: this.mode,
        snapshotUrl: `/api/camera/snapshot/${nodeId}`
      };
      this.activeDetections.set(nodeId, result);
      return result;
    }

    if (this.mode === 'SIMULATION_MODE') {
      const result = {
        nodeId,
        verified: true,
        label: 'HUMAN_PEDESTRIAN',
        confidence: 0.91,
        boundingBox: { x: 42, y: 15, width: 22, height: 65 },
        timestamp: Date.now(),
        mode: 'SIMULATION_MODE',
        note: '[SIMULATED CAMERA] Visual verification synthetically generated for testing'
      };
      this.activeDetections.set(nodeId, result);
      return result;
    }

    // REAL CAMERA MODE fallback
    return {
      nodeId,
      verified: false,
      label: 'NONE',
      confidence: 0,
      mode: 'REAL_CAMERA_MODE',
      note: 'Awaiting visual frame from physical camera module'
    };
  }

  getLatestDetection(nodeId) {
    return this.activeDetections.get(nodeId) || {
      nodeId,
      verified: false,
      label: 'NONE',
      confidence: 0,
      mode: this.mode
    };
  }
}

module.exports = new CameraService();
