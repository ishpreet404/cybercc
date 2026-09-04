import React from 'react';
import { Eye, Radio, AlertCircle, Crosshair } from 'lucide-react';
import Card from '../Card';

export const RadarView = ({ node }) => {
  const radar = (node && node.sensors && node.sensors.radar) || {
    presence: false,
    distance: 0,
    confidence: 0
  };

  const isDetected = Boolean(radar.presence && radar.distance > 0);
  const distance = Number((radar.distance || 0).toFixed(2));
  const maxRange = 8.0; // 8 meters standard range for LD2410 mmWave radar
  const distancePct = Math.min(96, Math.max(4, (distance / maxRange) * 100));

  return (
    <Card title={`▸ RADAR SENSING ZONE (5–8M) : ${node ? node.nodeId : 'SELECT NODE'}`}>
      <div className="space-y-4 font-mono flex-1 flex flex-col justify-between">
        
        {/* Radar Status Header Banner */}
        <div className={`p-3 border flex items-center justify-between ${
          isDetected
            ? 'border-terminal-red bg-terminal-red/10 text-terminal-red'
            : 'border-terminal-border bg-terminal-black text-gray-300'
        }`}>
          <div className="flex items-center gap-2.5">
            <Radio className={`w-5 h-5 flex-shrink-0 ${isDetected ? 'animate-pulse text-terminal-red' : 'text-terminal-muted'}`} />
            <div>
              <div className="text-xs uppercase font-bold tracking-wider">
                {isDetected ? 'HUMAN TARGET ACQUIRED' : 'RADAR FIELD SECURE (SCANNING)'}
              </div>
              <div className="text-[10px] text-terminal-muted mt-0.5">
                24GHz mmWave FMCW Micro-Doppler Sensor
              </div>
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <div className={`text-lg font-bold leading-none ${isDetected ? 'text-terminal-red' : 'text-gray-400'}`}>
              {isDetected ? `${distance}m` : '--'}
            </div>
            <div className="text-[9px] text-terminal-muted mt-1">RADIAL DISTANCE</div>
          </div>
        </div>

        {/* Polar Circular Radar Scope & Distance Gate */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center bg-terminal-black p-3 border border-terminal-border">
          
          {/* Circular Radar Sweep Scope */}
          <div className="relative w-36 h-36 mx-auto rounded-full border border-terminal-green/40 bg-black/60 flex items-center justify-center overflow-hidden">
            {/* Concentric distance rings: 2m, 4m, 6m, 8m */}
            <div className="absolute w-28 h-28 rounded-full border border-terminal-green/20" />
            <div className="absolute w-20 h-20 rounded-full border border-terminal-green/20" />
            <div className="absolute w-10 h-10 rounded-full border border-terminal-green/25" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-terminal-green" />
            </div>

            {/* Crosshair lines */}
            <div className="absolute w-full h-[1px] bg-terminal-green/20" />
            <div className="absolute h-full w-[1px] bg-terminal-green/20" />

            {/* Sweep ray */}
            <div 
              className="absolute inset-0 rounded-full animate-radar-sweep pointer-events-none"
              style={{
                background: isDetected 
                  ? 'conic-gradient(from 0deg, transparent 0deg, rgba(255, 51, 68, 0.3) 45deg, transparent 50deg)'
                  : 'conic-gradient(from 0deg, transparent 0deg, rgba(0, 255, 102, 0.2) 35deg, transparent 40deg)'
              }}
            />

            {/* Target Blip on Radar Scope */}
            {isDetected && (
              <div 
                className="absolute z-10 flex items-center justify-center"
                style={{
                  top: `${50 - (distance / 8.0) * 38}%`,
                  left: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <div className="w-3.5 h-3.5 rounded-full bg-terminal-red/30 border border-terminal-red animate-ping" />
                <div className="absolute w-2 h-2 rounded-full bg-terminal-red shadow-[0_0_8px_#ff3344]" />
              </div>
            )}

            {/* Range markers */}
            <span className="absolute bottom-1 text-[8px] text-terminal-muted">8m MAX</span>
          </div>

          {/* Linear Distance Gate Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] text-terminal-muted">
              <span>0m CHASSIS</span>
              <span>4m MID</span>
              <span>8m MAX</span>
            </div>

            {/* Track container */}
            <div className="relative w-full h-10 bg-terminal-dark border border-terminal-border">
              {/* Range increments */}
              <div className="absolute inset-0 flex justify-between px-1 pointer-events-none opacity-30">
                {[1, 2, 3, 4, 5, 6, 7].map(m => (
                  <div key={m} className="border-r border-terminal-muted h-full" />
                ))}
              </div>

              {/* Needle Indicator */}
              {isDetected ? (
                <div
                  className="absolute top-0 bottom-0 flex flex-col items-center transition-all duration-300"
                  style={{ left: `${distancePct}%`, transform: 'translateX(-50%)' }}
                >
                  <div className="w-1 h-full bg-terminal-red shadow-[0_0_6px_#ff3344]" />
                  <span className="absolute -bottom-5 text-[9px] font-bold text-terminal-red whitespace-nowrap bg-terminal-black px-1.5 py-0.2 border border-terminal-red shadow-md">
                    HUMAN {distance}m
                  </span>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] text-terminal-muted italic">
                  RANGE CLEAR (0–8m)
                </div>
              )}
            </div>

            <div className="pt-3 text-[10px] text-terminal-muted flex items-center justify-between">
              <span>FOV: 60° HORIZONTAL</span>
              <span className={isDetected ? 'text-terminal-red font-bold' : 'text-terminal-green'}>
                {isDetected ? 'TARGET LOCKED' : 'CONTINUOUS FMCW'}
              </span>
            </div>
          </div>

        </div>

        {/* Radar Telemetry Specs 3-column row */}
        <div className="grid grid-cols-3 gap-2 text-[11px]">
          <div className="p-2 bg-terminal-black border border-terminal-border">
            <div className="text-terminal-muted text-[9px]">DETECTION</div>
            <div className={`font-bold mt-0.5 ${isDetected ? 'text-terminal-red' : 'text-terminal-green'}`}>
              {isDetected ? 'ACTIVE' : 'STANDBY'}
            </div>
          </div>
          <div className="p-2 bg-terminal-black border border-terminal-border">
            <div className="text-terminal-muted text-[9px]">CONFIDENCE</div>
            <div className="font-bold text-gray-200 mt-0.5">
              {isDetected ? `${Math.round((radar.confidence || 0.9) * 100)}%` : '0%'}
            </div>
          </div>
          <div className="p-2 bg-terminal-black border border-terminal-border">
            <div className="text-terminal-muted text-[9px]">FREQUENCY</div>
            <div className="font-bold text-terminal-cyan mt-0.5">24.15 GHz</div>
          </div>
        </div>

      </div>
    </Card>
  );
};

export default RadarView;
