import React from 'react';
import { Crosshair, Shield, Activity, Radio } from 'lucide-react';
import Card from '../Card';

export const EstimatedPosition = ({ node, fusion }) => {
  const radar = node?.sensors?.radar || { presence: false, distance: 0 };
  const s1Rms = node?.sensors?.adxl1?.vibrationRms || 0.02;
  const s2Rms = node?.sensors?.adxl2?.vibrationRms || 0.02;
  const spacing = node?.sensorSpacing || 1.5;

  const isTriggered = radar.presence || s1Rms > 0.12 || s2Rms > 0.12;

  // Calculate position along baseline (Y) and depth (X)
  const total = s1Rms + s2Rms;
  const ratio = (s2Rms - s1Rms) / Math.max(0.01, total);
  
  // Normalized Y [-0.8 to +0.8], where top is ADXL1 (-0.6), bottom is ADXL2 (+0.6)
  const normY = Math.max(-0.7, Math.min(0.7, ratio * 1.5));
  const normX = radar.distance ? Math.min(0.85, Math.max(0.2, radar.distance / 8.0)) : 0.5;

  // Convert to percent for display
  const targetTopPct = 50 + normY * 35; // 50% is center
  const targetLeftPct = 50 + normX * 35;
  const confidence = fusion?.confidence ? Math.round(fusion.confidence * 100) : (isTriggered ? 88 : 0);

  return (
    <Card title={`▸ LOCAL SENSING ENVELOPE & TWO-SENSOR LOCALIZATION : ${node ? node.nodeId : 'SELECT NODE'}`}>
      <div className="space-y-3 font-mono">
        
        {/* Local 2D Sensing Area Box */}
        <div className="relative w-full h-56 bg-terminal-black border border-terminal-border overflow-hidden">
          
          {/* Circular Radar Distance Rings (2m, 4m, 6m, 8m) */}
          <div className="absolute left-6 top-1/2 -translate-y-1/2 w-80 h-80 rounded-full border border-terminal-green/10 pointer-events-none" />
          <div className="absolute left-6 top-1/2 -translate-y-1/2 w-60 h-60 rounded-full border border-terminal-green/15 pointer-events-none" />
          <div className="absolute left-6 top-1/2 -translate-y-1/2 w-40 h-40 rounded-full border border-dashed border-terminal-green/25 pointer-events-none" />

          {/* Inter-Sensor Baseline Axis */}
          <div className="absolute left-10 top-10 bottom-10 w-0.5 bg-terminal-border border-l border-dashed border-terminal-muted flex flex-col justify-between items-center py-2 pointer-events-none">
            {/* Sensor 1 Marker */}
            <div className="relative -left-2 flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-terminal-green/20 border-2 border-terminal-green flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-terminal-green" />
              </div>
              <span className="text-[10px] font-bold text-terminal-green whitespace-nowrap bg-black/80 px-1 border border-terminal-green/40">
                ADXL #1 ({spacing}m BASELINE)
              </span>
            </div>

            <div className="text-[9px] text-terminal-muted bg-terminal-black px-1 border border-terminal-border">
              PROBE AXIS
            </div>

            {/* Sensor 2 Marker */}
            <div className="relative -left-2 flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-terminal-cyan/20 border-2 border-terminal-cyan flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-terminal-cyan" />
              </div>
              <span className="text-[10px] font-bold text-terminal-cyan whitespace-nowrap bg-black/80 px-1 border border-terminal-cyan/40">
                ADXL #2
              </span>
            </div>
          </div>

          {/* Estimated Human Target Position */}
          {isTriggered ? (
            <div
              className="absolute z-20 flex flex-col items-center pointer-events-none transition-all duration-300"
              style={{
                left: `${targetLeftPct}%`,
                top: `${targetTopPct}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className="relative flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-terminal-red/30 border-2 border-terminal-red animate-ping" />
                <div className="absolute w-4 h-4 rounded-full bg-terminal-red flex items-center justify-center shadow-[0_0_12px_#ff3344]">
                  <Crosshair className="w-3 h-3 text-white" />
                </div>
              </div>

              <div className="mt-1 px-2 py-0.5 bg-terminal-black/95 border border-terminal-red text-center shadow-lg">
                <div className="text-[9px] font-bold text-terminal-red">
                  ESTIMATED POSITION
                </div>
                <div className="text-[8px] text-gray-300">
                  CONFIDENCE: {confidence}% | ~{radar.distance || 4.2}m
                </div>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-terminal-muted pointer-events-none">
              [ STANDBY : SENSING AREA SECURE ]
            </div>
          )}

          {/* Overlay Tag */}
          <div className="absolute bottom-2 right-2 text-[9px] text-terminal-muted bg-terminal-black/80 px-2 py-1 border border-terminal-border">
            METHOD: DUAL-SEISMIC ATTENUATION + RADAR INTERSECTION
          </div>
        </div>

        {/* Math Breakdown & Disclaimer */}
        <div className="p-2.5 bg-terminal-surface border border-terminal-border text-[11px] text-gray-300">
          <div className="text-terminal-amber font-bold flex items-center gap-1 mb-1">
            <Shield className="w-3 h-3" />
            ROUGH RELATIVE LOCALIZATION NOTE:
          </div>
          <div className="text-[10px] text-terminal-muted leading-relaxed">
            Position is calculated by comparing shockwave falloff across probe baseline (ADXL-01: {s1Rms}g vs ADXL-02: {s2Rms}g) and intersecting with the 24GHz mmWave radar distance gate. This provides rough tactical bearing, not precise GPS.
          </div>
        </div>

      </div>
    </Card>
  );
};

export default EstimatedPosition;
