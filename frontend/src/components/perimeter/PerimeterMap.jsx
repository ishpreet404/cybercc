import React, { useState } from 'react';
import { Shield, Radio, Activity, Crosshair, AlertTriangle, Eye, Zap } from 'lucide-react';

export const PerimeterMap = ({ nodes = [], activeAlerts = [], selectedNodeId, onSelectNode }) => {
  const [hoveredNode, setHoveredNode] = useState(null);

  // Find if any node has an active alert or high-confidence intruder
  const activeIntruders = nodes.filter(n => n.activeEvent || (n.sensors && n.sensors.radar && n.sensors.radar.presence));

  return (
    <div className="relative w-full aspect-[16/10] min-h-[420px] bg-terminal-dark border border-terminal-border rounded-sm overflow-hidden p-4 select-none">
      
      {/* Background Grid & Coordinate Lines */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(to right, #00ff66 1px, transparent 1px), linear-gradient(to bottom, #00ff66 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      {/* Perimeter Property Fence Boundary SVG */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {/* Perimeter Boundary Polygon */}
        <polygon 
          points="60,50 900,50 920,550 40,550" 
          fill="rgba(0, 255, 102, 0.02)" 
          stroke="rgba(0, 255, 102, 0.3)" 
          strokeWidth="1.5" 
          strokeDasharray="6 4"
        />

        {/* Property Zone Sectors */}
        <text x="70" y="75" fill="#4b5563" fontSize="10" fontFamily="monospace" letterSpacing="2">
          [SECTOR A: NORTH PERIMETER]
        </text>
        <text x="760" y="75" fill="#4b5563" fontSize="10" fontFamily="monospace" letterSpacing="2">
          [SECTOR B: EAST GATE]
        </text>
        <text x="70" y="535" fill="#4b5563" fontSize="10" fontFamily="monospace" letterSpacing="2">
          [SECTOR C: WEST DRIVEWAY]
        </text>
        <text x="740" y="535" fill="#4b5563" fontSize="10" fontFamily="monospace" letterSpacing="2">
          [SECTOR D: SOUTH FOREST]
        </text>

        {/* Central Facility Marker */}
        <rect x="42%" y="42%" width="16%" height="16%" fill="rgba(31, 41, 55, 0.6)" stroke="#374151" strokeWidth="1" />
        <text x="50%" y="51%" fill="#9ca3af" fontSize="9" fontFamily="monospace" textAnchor="middle">
          CENTRAL FACILITY
        </text>
      </svg>

      {/* Map HUD Overlay Banner */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-3">
        <div className="bg-terminal-black/80 backdrop-blur-sm border border-terminal-border px-3 py-1.5 flex items-center gap-2">
          <Crosshair className="w-4 h-4 text-terminal-green animate-spin" style={{ animationDuration: '10s' }} />
          <span className="font-mono text-xs font-bold text-gray-200 tracking-wider">
            PERIMETER SENTRY GRID (2D TACTICAL VIEW)
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-terminal-muted bg-terminal-black/70 px-2 py-1 border border-terminal-border">
          <span className="inline-block w-2 h-2 rounded-full bg-terminal-green"></span> NORMAL
          <span className="inline-block w-2 h-2 rounded-full bg-terminal-amber ml-2"></span> SUSPICIOUS
          <span className="inline-block w-2 h-2 rounded-full bg-terminal-red ml-2"></span> INTRUSION ALERT
          <span className="inline-block w-2 h-2 rounded-full bg-gray-500 ml-2"></span> OFFLINE
        </div>
      </div>

      {/* Render Each Node on the Map */}
      {nodes.map((node) => {
        const isSelected = selectedNodeId === node.nodeId;
        const isAlert = node.status === 'ALERT';
        const isWarning = node.status === 'WARNING';
        const isOffline = node.status === 'OFFLINE';
        const hasRadarPresence = node.sensors && node.sensors.radar && node.sensors.radar.presence;
        const hasVibrationElevated = node.sensors && node.sensors.adxl1 && (node.sensors.adxl1.vibrationRms > 0.12 || (node.sensors.adxl2 && node.sensors.adxl2.vibrationRms > 0.12));

        const posX = node.position ? node.position.x : 50;
        const posY = node.position ? node.position.y : 50;

        let statusColor = '#00ff66';
        let badgeBg = 'bg-terminal-green';
        if (isOffline) {
          statusColor = '#6b7280';
          badgeBg = 'bg-gray-500';
        } else if (isAlert || (hasRadarPresence && hasVibrationElevated)) {
          statusColor = '#ff3344';
          badgeBg = 'bg-terminal-red';
        } else if (isWarning || hasRadarPresence || hasVibrationElevated) {
          statusColor = '#ffb000';
          badgeBg = 'bg-terminal-amber';
        }

        return (
          <div
            key={node.nodeId}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 transition-all duration-300 group"
            style={{ left: `${posX}%`, top: `${posY}%` }}
            onClick={() => onSelectNode && onSelectNode(node.nodeId)}
            onMouseEnter={() => setHoveredNode(node)}
            onMouseLeave={() => setHoveredNode(null)}
          >
            {/* Visual Radar Arc Sweep (5-8m visual cone) */}
            {!isOffline && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <div 
                  className={`w-28 h-28 rounded-full border border-dashed transition-opacity duration-300 ${
                    hasRadarPresence ? 'border-terminal-red/60 bg-terminal-red/5 animate-pulse' : 'border-terminal-green/20'
                  }`}
                />
                {/* Rotating radar sweep ray */}
                <div 
                  className="absolute inset-0 rounded-full animate-radar-sweep pointer-events-none"
                  style={{
                    background: hasRadarPresence 
                      ? 'conic-gradient(from 0deg, transparent 0deg, rgba(255, 51, 68, 0.25) 45deg, transparent 50deg)'
                      : 'conic-gradient(from 0deg, transparent 0deg, rgba(0, 255, 102, 0.15) 30deg, transparent 35deg)'
                  }}
                />
              </div>
            )}

            {/* Seismic Ground Vibration Ripples (radiating from ground spiked probes) */}
            {hasVibrationElevated && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <div className="w-16 h-16 rounded-full border border-terminal-amber animate-ripple" />
                <div className="w-24 h-24 rounded-full border border-terminal-red animate-ripple" style={{ animationDelay: '0.6s' }} />
              </div>
            )}

            {/* Estimated Intruder Position Marker (when radar/seismic flag intrusion) */}
            {(hasRadarPresence || isAlert) && (
              <div 
                className="absolute z-30 pointer-events-none flex flex-col items-center"
                style={{
                  // Position relative to node based on sensor ratio and radar distance
                  transform: 'translate(45px, -35px)'
                }}
              >
                <div className="relative flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-terminal-red/20 border-2 border-terminal-red animate-ping" />
                  <div className="absolute w-3 h-3 rounded-full bg-terminal-red shadow-[0_0_8px_#ff3344]" />
                </div>
                <div className="mt-1 px-1.5 py-0.5 bg-terminal-black/90 border border-terminal-red text-[9px] font-mono font-bold text-terminal-red whitespace-nowrap">
                  ESTIMATED TARGET ({node.sensors?.radar?.distance || 4.2}m)
                </div>
              </div>
            )}

            {/* Node Sentry Center Hub */}
            <div 
              className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-transform ${
                isSelected ? 'scale-125 ring-2 ring-terminal-green ring-offset-2 ring-offset-black' : 'group-hover:scale-110'
              } ${isAlert ? 'animate-bounce' : ''}`}
              style={{
                backgroundColor: 'rgba(8, 12, 16, 0.9)',
                border: `2px solid ${statusColor}`,
                boxShadow: `0 0 14px ${statusColor}66`
              }}
            >
              <Radio className="w-4 h-4" style={{ color: statusColor }} />
            </div>

            {/* Node Callout Label */}
            <div className="mt-1.5 text-center pointer-events-none">
              <span className={`px-1.5 py-0.5 text-[10px] font-mono font-bold tracking-wider rounded-none uppercase ${
                isAlert ? 'bg-terminal-red text-white' : 'bg-terminal-black/80 text-gray-200 border border-terminal-border'
              }`}>
                {node.nodeId}
              </span>
            </div>

            {/* Hover Tooltip Details */}
            {hoveredNode && hoveredNode.nodeId === node.nodeId && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-terminal-black/95 border border-terminal-green p-2 text-xs font-mono text-gray-200 shadow-xl pointer-events-none z-50">
                <div className="font-bold text-terminal-green border-b border-terminal-border pb-1 mb-1">
                  {node.name}
                </div>
                <div className="grid grid-cols-2 gap-1 text-[10px]">
                  <span className="text-terminal-muted">STATUS:</span>
                  <span className="font-bold text-right" style={{ color: statusColor }}>{node.status}</span>
                  <span className="text-terminal-muted">BATTERY:</span>
                  <span className="text-right">{node.battery?.percentage}% ({node.battery?.voltage}V)</span>
                  <span className="text-terminal-muted">RADAR:</span>
                  <span className="text-right">{hasRadarPresence ? `${node.sensors.radar.distance}m (DET)` : 'CLEAR'}</span>
                  <span className="text-terminal-muted">RMS VIB:</span>
                  <span className="text-right">{node.sensors?.adxl1?.vibrationRms || '0.02'}g</span>
                  <span className="text-terminal-muted">TRANSPORT:</span>
                  <span className="text-right uppercase">{node.communication}</span>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Bottom Status Ticker */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        <div className="font-mono text-[10px] text-terminal-muted bg-terminal-black/80 px-2 py-1 border border-terminal-border">
          ACTIVE NODES: {nodes.filter(n => n.status !== 'OFFLINE').length}/{nodes.length} | SENSING RANGE: 5–8m
        </div>
        <div className="font-mono text-[10px] text-terminal-amber bg-terminal-black/80 px-2 py-1 border border-terminal-amber/50">
          CLICK NODE FOR DEEP WAVEFORM INSPECTION
        </div>
      </div>
    </div>
  );
};

export default PerimeterMap;
