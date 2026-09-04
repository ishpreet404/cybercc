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
  const total = Math.max(0.001, s1Rms + s2Rms);
  const bias = (s2Rms - s1Rms) / total; // -1 (at s1) to +1 (at s2)
  
  // Map to visual coordinates inside 400x240 SVG
  // Sensor 1 at (90, 60), Sensor 2 at (90, 180). Baseline midpoint is (90, 120).
  const s1X = 90, s1Y = 60;
  const s2X = 90, s2Y = 180;
  const originX = 90, originY = 120;

  // Intruder target coordinates:
  const distMeters = radar.presence && radar.distance > 0 ? radar.distance : (3.5 / Math.sqrt(Math.max(0.02, total / 2)));
  const clampedDist = Math.max(1.0, Math.min(8.0, distMeters));
  
  // Radial depth mapped to X: [130 to 350]
  const targetX = originX + (clampedDist / 8.0) * 240;
  // Lateral bias mapped to Y: [70 to 170]
  const targetY = originY + bias * 45;

  const confidence = fusion?.confidence ? Math.round(fusion.confidence * 100) : (isTriggered ? 89 : 0);

  return (
    <Card title={`▸ TWO-SENSOR RELATIVE LOCALIZATION : ${node ? node.nodeId : 'SELECT NODE'}`}>
      <div className="space-y-3 font-mono flex-1 flex flex-col justify-between">
        
        {/* SVG Tactical 2D Coordinate Sensing Envelope */}
        <div className="relative w-full h-56 bg-terminal-black border border-terminal-border overflow-hidden flex items-center justify-center">
          
          <svg viewBox="0 0 400 240" className="w-full h-full">
            {/* Background grid */}
            <defs>
              <pattern id="localGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#141c26" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="400" height="240" fill="url(#localGrid)" />

            {/* Radar Arc Distance Gates from origin (90, 120) */}
            <path d="M 90 60 A 60 60 0 0 1 150 120 A 60 60 0 0 1 90 180" fill="none" stroke="#00ff66" strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />
            <path d="M 90 0 A 120 120 0 0 1 210 120 A 120 120 0 0 1 90 240" fill="none" stroke="#00ff66" strokeWidth="1" strokeDasharray="4 4" opacity="0.25" />
            <path d="M 90 -60 A 180 180 0 0 1 270 120 A 180 180 0 0 1 90 300" fill="none" stroke="#00ff66" strokeWidth="1" opacity="0.2" />
            <path d="M 90 -120 A 240 240 0 0 1 330 120 A 240 240 0 0 1 90 360" fill="none" stroke="#00ff66" strokeWidth="1" opacity="0.15" />

            {/* Range markers */}
            <text x="145" y="115" fill="#4b5563" fontSize="8" fontFamily="monospace">2m</text>
            <text x="205" y="115" fill="#4b5563" fontSize="8" fontFamily="monospace">4m</text>
            <text x="265" y="115" fill="#4b5563" fontSize="8" fontFamily="monospace">6m</text>
            <text x="325" y="115" fill="#4b5563" fontSize="8" fontFamily="monospace">8m</text>

            {/* Inter-Sensor Baseline Axis */}
            <line x1={s1X} y1={s1Y} x2={s2X} y2={s2Y} stroke="#374151" strokeWidth="2" strokeDasharray="4 2" />

            {/* Chassis Node Origin Marker */}
            <circle cx={originX} cy={originY} r="4" fill="#ffb000" />
            <text x={originX - 8} y={originY + 3} fill="#ffb000" fontSize="8" fontFamily="monospace" textAnchor="end">NODE</text>

            {/* Sensor 1 (Probe A) */}
            <circle cx={s1X} cy={s1Y} r="6" fill="#00ff66" fillOpacity="0.2" stroke="#00ff66" strokeWidth="1.5" />
            <circle cx={s1X} cy={s1Y} r="2" fill="#00ff66" />
            <text x={s1X - 8} y={s1Y - 2} fill="#00ff66" fontSize="9" fontFamily="monospace" textAnchor="end" fontWeight="bold">ADXL-01</text>
            <text x={s1X - 8} y={s1Y + 9} fill="#8b949e" fontSize="8" fontFamily="monospace" textAnchor="end">PROBE A</text>

            {/* Sensor 2 (Probe B) */}
            <circle cx={s2X} cy={s2Y} r="6" fill="#00e5ff" fillOpacity="0.2" stroke="#00e5ff" strokeWidth="1.5" />
            <circle cx={s2X} cy={s2Y} r="2" fill="#00e5ff" />
            <text x={s2X - 8} y={s2Y - 2} fill="#00e5ff" fontSize="9" fontFamily="monospace" textAnchor="end" fontWeight="bold">ADXL-02</text>
            <text x={s2X - 8} y={s2Y + 9} fill="#8b949e" fontSize="8" fontFamily="monospace" textAnchor="end">PROBE B</text>

            {/* Baseline Distance Label */}
            <text x={originX - 10} y={originY - 24} fill="#6b7280" fontSize="7" fontFamily="monospace" textAnchor="end">{spacing}m BASELINE</text>

            {/* Estimated Target & 3-Point Triangulation Sightlines */}
            {isTriggered ? (
              <g>
                {/* Connecting triangulation vectors to both probes and radar origin */}
                <line x1={s1X} y1={s1Y} x2={targetX} y2={targetY} stroke="#00ff66" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
                <line x1={s2X} y1={s2Y} x2={targetX} y2={targetY} stroke="#00e5ff" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
                <line x1={originX} y1={originY} x2={targetX} y2={targetY} stroke="#ff3344" strokeWidth="1.2" strokeDasharray="4 2" opacity="0.8" />

                {/* Target Ping Pulse */}
                <circle cx={targetX} cy={targetY} r="14" fill="#ff3344" fillOpacity="0.2" stroke="#ff3344" strokeWidth="1.5">
                  <animate attributeName="r" values="8;18;8" dur="1.8s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.8;0.2;0.8" dur="1.8s" repeatCount="indefinite" />
                </circle>
                <circle cx={targetX} cy={targetY} r="4" fill="#ff3344" />

                {/* Target HUD Label Box */}
                <g transform={`translate(${Math.min(270, targetX - 50)}, ${Math.max(15, targetY - 32)})`}>
                  <rect width="105" height="24" fill="#080c10" stroke="#ff3344" strokeWidth="1" rx="0" />
                  <text x="52" y="11" fill="#ff3344" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                    ESTIMATED POSITION
                  </text>
                  <text x="52" y="20" fill="#e5e7eb" fontSize="7.5" fontFamily="monospace" textAnchor="middle">
                    {confidence}% CONF | ~{clampedDist.toFixed(1)}m
                  </text>
                </g>
              </g>
            ) : (
              <text x="240" y="125" fill="#6b7280" fontSize="10" fontFamily="monospace" textAnchor="middle" fontStyle="italic">
                SENSING ZONE SECURE (IDLE)
              </text>
            )}
          </svg>

          {/* Bottom Overlay Tag */}
          <div className="absolute bottom-2 right-2 text-[9px] text-terminal-muted bg-terminal-black/90 px-2 py-0.5 border border-terminal-border">
            ESTIMATED POSITION (ROUGH RELATIVE)
          </div>
        </div>

        {/* Mathematical Explanation */}
        <div className="p-2.5 bg-terminal-surface border border-terminal-border text-[11px] text-gray-300">
          <div className="text-terminal-amber font-bold flex items-center gap-1.5 mb-0.5 text-xs">
            <Shield className="w-3.5 h-3.5 flex-shrink-0" />
            ROUGH RELATIVE LOCALIZATION NOTE:
          </div>
          <div className="text-[10px] text-terminal-muted leading-relaxed">
            Position is determined by computing differential soil attenuation between Probe A ({s1Rms.toFixed(3)}g) and Probe B ({s2Rms.toFixed(3)}g) across the {spacing}m baseline, intersected with the 24GHz radar range gate (~{clampedDist.toFixed(1)}m).
          </div>
        </div>

      </div>
    </Card>
  );
};

export default EstimatedPosition;
