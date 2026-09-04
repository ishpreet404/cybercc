/**
 * Cyber Chaukidaar - Two-Sensor Rough Relative Localization Module
 * 
 * Estimates approximate intruder direction & position within the node's local sensing area (5-8m radius)
 * by comparing ground shockwave attenuation between ADXL345 #1 and ADXL345 #2, fused with radar radial distance.
 * 
 * IMPORTANT: This provides a ROUGH ESTIMATED POSITION for tactical situational awareness,
 * NOT a precise GPS fix.
 */

class LocalizationEngine {
  /**
   * Estimate relative position within local sensing envelope
   * @param {Object} params
   * @param {number} params.sensor1Intensity - RMS or Peak vibration from Sensor #1
   * @param {number} params.sensor2Intensity - RMS or Peak vibration from Sensor #2
   * @param {number} [params.radarDistance] - Distance in meters reported by mmWave radar (0-8m)
   * @param {boolean} [params.radarPresence] - Whether radar flags human presence
   * @param {number} [params.sensorSpacing=1.5] - Physical baseline distance in meters between ADXLs
   * @returns {Object} Estimated position, confidence, and metadata
   */
  estimatePosition(params) {
    const s1 = Math.max(0.0001, params.sensor1Intensity || 0.02);
    const s2 = Math.max(0.0001, params.sensor2Intensity || 0.02);
    const radarDist = params.radarDistance && params.radarDistance > 0 ? params.radarDistance : null;
    const radarPres = Boolean(params.radarPresence);
    const spacing = params.sensorSpacing || 1.5;

    const totalIntensity = s1 + s2;
    // Ratio bias along baseline: -1.0 (at sensor 1) to +1.0 (at sensor 2)
    const baselineBias = (s2 - s1) / totalIntensity;

    // Normalizing Y within local node frame [-1, 1] scaled to roughly 5m sensing field
    // Sensor 1 is at (0, -0.5), Sensor 2 is at (0, +0.5) in normalized node space
    const yEstimated = Number(Math.max(-1.0, Math.min(1.0, baselineBias * 1.8)).toFixed(2));

    // X axis represents perpendicular radial distance from baseline
    let xEstimated = 0;
    let confidence = 0.5;
    let distanceMeters = 0;

    if (radarPres && radarDist) {
      distanceMeters = radarDist;
      // Map radar distance (0-8m) to normalized X dimension [0.1 to 1.0]
      xEstimated = Number(Math.min(1.0, Math.max(0.1, radarDist / 8.0)).toFixed(2));
      // High confidence when both radar and dual accelerometers are consistent
      confidence = Math.min(0.92, 0.65 + Math.abs(baselineBias) * 0.15 + (totalIntensity > 0.15 ? 0.15 : 0.05));
    } else {
      // Estimate radial depth roughly from inverse seismic falloff
      const avgIntensity = totalIntensity / 2;
      distanceMeters = Math.max(1.0, Math.min(8.0, 3.5 / Math.sqrt(Math.max(0.02, avgIntensity))));
      xEstimated = Number(Math.min(1.0, Math.max(0.15, distanceMeters / 8.0)).toFixed(2));
      // Lower confidence without radar distance confirmation
      confidence = Math.min(0.68, 0.40 + Math.abs(baselineBias) * 0.2);
    }

    // Convert local node coordinate (xEstimated, yEstimated) to a 0.0 to 1.0 local quadrant
    const normalizedLocal = {
      x: Number(((xEstimated + 1.0) / 2.0).toFixed(2)),
      y: Number(((yEstimated + 1.0) / 2.0).toFixed(2))
    };

    return {
      relativePosition: normalizedLocal,
      rawCoordinates: {
        xMeters: Number((xEstimated * 8).toFixed(2)),
        yMeters: Number((yEstimated * 4).toFixed(2))
      },
      distanceMeters: Number(distanceMeters.toFixed(2)),
      confidence: Number(confidence.toFixed(2)),
      label: 'ESTIMATED POSITION', // Explicit requirement
      sensorBias: Number(baselineBias.toFixed(3)),
      sensorRatio: Number((s1 / s2).toFixed(2)),
      method: radarPres ? 'RADAR_SEISMIC_INTERSECTION' : 'DUAL_SEISMIC_ATTENUATION_ONLY'
    };
  }
}

module.exports = new LocalizationEngine();
