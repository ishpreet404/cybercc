import React, { useState } from 'react';
import { Shield, Radio, Activity, Crosshair, AlertTriangle, Eye, Zap } from 'lucide-react';

export const PerimeterMap = ({ nodes = [], activeAlerts = [], selectedNodeId, onSelectNode }) => {
  const [hoveredNode, setHoveredNode] = useState(null);

  return (
    <div className="relative w-full aspect-[16/10] min-h-[440px] max-h-[600px] bg-terminal-dark border border-terminal-border rounded-none overflow-hidden select-none">
      
      {/* Background Grid & Coordinate Lines */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(to right, #00ff66 1px, transparent 1px), linear-gradient(to bottom, #00ff66 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      {/* Perimeter Property Fence Boundary SVG with responsive viewBox */}
      <svg 
        viewBox="0 0 1000 600" 
        preserveAspectRatio="none" 
        className="absolute inset-0 w-full h-full pointer-events-none"
      >
        {/* Perimeter Boundary Polygon */}
        <polygon 
          points="80,60 920,60 940,540 60,540" 
          fill="rgba(0, 255, 102, 0.02)" 
          stroke="rgba(0, 255, 102, 0.35)" 
          strokeWidth="1.5" 
          strokeDasharray="6 4"
        />

        {/* Property Zone Sectors */}
        <text x="90" y="85" fill="#6b7280" fontSize="11" fontFamily="monospace" letterSpacing="2">
          [SECTOR A: NORTH PERIMETER]
        </text>
        <text x="710" y="85" fill="#6b7280" fontSize="11" fontFamily="monospace" letterSpacing="2">
          [SECTOR B: EAST GATE]
        </text>
        <text x="80" y="525" fill="#6b7280" fontSize="11" fontFamily="monospace" letterSpacing="2">
          [SECTOR C: WEST DRIVEWAY]
        </text>
        <text x="710" y="525" fill="#6b7280" fontSize="11" fontFamily="monospace" letterSpacing="2">
          [SECTOR D: SOUTH FOREST]
        </text>

        {/* Central Facility Marker */}
        <rect x="420" y="240" width="160" height="120" fill="rgba(18, 26, 36, 0.85)" stroke="#374151" strokeWidth="1.5" />
        <line x1="420" y1="240" x2="580" y2="360" stroke="#1f2937" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="580" y1="240" x2="420" y2="360" stroke="#1f2937" strokeWidth="1" strokeDasharray="4 4" />
        <text x="500" y="305" fill="#9ca3af" fontSize="11" fontFamily="monospace" textAnchor="middle" fontWeight="bold" letterSpacing="1">
          CENTRAL FACILITY
        </text>
      </svg>

      {/* Map HUD Top Banner */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="bg-terminal-black/90 backdrop-blur-sm border border-terminal-border px-3 py-1.5 flex items-center gap-2 pointer-events-auto shadow-md">
          <Crosshair className="w-4 h-4 text-terminal-green animate-spin" style={{ animationDuration: '12s' }} />
          <span className="font-mono text-xs font-bold text-gray-200 tracking-wider">
            PERIMETER SENTRY GRID (2D TACTICAL VIEW)
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-[10px] font-mono text-terminal-muted bg-terminal-black/90 backdrop-blur-sm px-3 py-1.5 border border-terminal-border pointer-events-auto shadow-md">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-terminal-green inline-block"></span> NORMAL
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-terminal-amber inline-block"></span> SUSPICIOUS
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-terminal-red inline-block"></span> ALERT
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-gray-500 inline-block"></span> OFFLINE
          </span>
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
        if (isOffline) {
          statusColor = '#6b7280';
        } else if (isAlert || (hasRadarPresence && hasVibrationElevated)) {
          statusColor = '#ff3344';
        } else if (isWarning || hasRadarPresence || hasVibrationElevated) {
          statusColor = '#ffb000';
        }

        // Bounded target marker offsets
        const targetOffsetX = posX > 65 ? -48 : 48;
        const targetOffsetY = posY < 35 ? 40 : -40;

        // Smart tooltip alignment based on quadrant to prevent overflow clipping
        const tooltipVertical = posY < 35 ? 'top-full mt-2.5' : 'bottom-full mb-2.5';
        const tooltipHorizontal = posX > 65 ? 'right-0' : (posX < 35 ? 'left-0' : 'left-1/2 -translate-x-1/2');

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
                    hasRadarPresence ? 'border-terminal-red/60 bg-terminal-red/5 animate-pulse' : 'border-terminal-green/25'
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

            {/* Estimated Intruder Position Marker (bounded within view) */}
            {(hasRadarPresence || isAlert) && (
              <div 
                className="absolute z-30 pointer-events-none flex flex-col items-center"
                style={{
                  transform: `translate(${targetOffsetX}px, ${targetOffsetY}px)`
                }}
              >
                <div className="relative flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-terminal-red/25 border border-terminal-red animate-ping" />
                  <div className="absolute w-3 h-3 rounded-full bg-terminal-red shadow-[0_0_8px_#ff3344]" />
                </div>
                <div className="mt-1 px-1.5 py-0.5 bg-terminal-black/95 border border-terminal-red text-[9px] font-mono font-bold text-terminal-red whitespace-nowrap shadow-lg">
                  ESTIMATED TARGET ({node.sensors?.radar?.distance || 4.2}m)
                </div>
              </div>
            )}

            {/* Node Sentry Center Hub */}
            <div 
              className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                isSelected ? 'scale-125 ring-2 ring-terminal-green ring-offset-2 ring-offset-black shadow-[0_0_16px_#00ff66]' : 'group-hover:scale-110'
              } ${isAlert ? 'animate-bounce' : ''}`}
              style={{
                backgroundColor: '#080c10',
                border: `2px solid ${statusColor}`,
                boxShadow: `0 0 12px ${statusColor}55`
              }}
            >
              <Radio className="w-4 h-4" style={{ color: statusColor }} />
            </div>

            {/* Node Callout Label */}
            <div className="mt-1 text-center pointer-events-none">
              <span className={`px-1.5 py-0.5 text-[9px] font-mono font-bold tracking-wider uppercase inline-block leading-none ${
                isAlert ? 'bg-terminal-red text-white' : 'bg-terminal-black/90 text-gray-200 border border-terminal-border'
              }`}>
                {node.nodeId}
              </span>
            </div>

            {/* Smart Positioned Hover Tooltip */}
            {hoveredNode && hoveredNode.nodeId === node.nodeId && (
              <div className={`absolute ${tooltipVertical} ${tooltipHorizontal} w-52 bg-terminal-black/95 border border-terminal-green p-2.5 text-xs font-mono text-gray-200 shadow-2xl pointer-events-none z-50 backdrop-blur-md`}>
                <div className="font-bold text-terminal-green border-b border-terminal-border pb-1 mb-1.5 flex items-center justify-between">
                  <span className="truncate">{node.name}</span>
                  <span className="text-[9px] px-1 py-0.5 border" style={{ borderColor: statusColor, color: statusColor }}>
                    {node.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[10px]">
                  <span className="text-terminal-muted">BATTERY:</span>
                  <span className="text-right font-bold text-terminal-green">{node.battery?.percentage}% ({node.battery?.voltage?.toFixed(2)}V)</span>
                  <span className="text-terminal-muted">RADAR:</span>
                  <span className={`text-right font-bold ${hasRadarPresence ? 'text-terminal-red' : 'text-gray-300'}`}>
                    {hasRadarPresence ? `${node.sensors.radar.distance}m (ACQ)` : 'CLEAR'}
                  </span>
                  <span className="text-terminal-muted">RMS VIB:</span>
                  <span className="text-right font-bold text-terminal-amber">{node.sensors?.adxl1?.vibrationRms || '0.02'}g</span>
                  <span className="text-terminal-muted">TRANSPORT:</span>
                  <span className="text-right uppercase font-bold text-terminal-cyan">{node.communication}</span>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Bottom Status Ticker */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        <div className="font-mono text-[10px] text-terminal-muted bg-terminal-black/90 px-2.5 py-1 border border-terminal-border backdrop-blur-sm">
          SENTRY NODES: {nodes.filter(n => n.status !== 'OFFLINE').length}/{nodes.length} ONLINE | SENSING RADIUS: 5–8m
        </div>
        <div className="font-mono text-[10px] text-terminal-amber bg-terminal-black/90 px-2.5 py-1 border border-terminal-amber/50 backdrop-blur-sm">
          CLICK ANY NODE TO DRILL DOWN
        </div>
      </div>
    </div>
  );
};

export default PerimeterMap;
