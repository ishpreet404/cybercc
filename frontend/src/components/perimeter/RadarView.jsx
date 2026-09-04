import React from 'react';
import { Eye, Radio, AlertCircle } from 'lucide-react';
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
  const distancePct = Math.min(100, Math.max(0, (distance / maxRange) * 100));

  return (
    <Card title={`▸ RADAR SENSING ZONE (5–8M) : ${node ? node.nodeId : 'SELECT NODE'}`}>
      <div className="space-y-4 font-mono">
        
        {/* Radar Status Banner */}
        <div className={`p-3 border flex items-center justify-between ${
          isDetected
            ? 'border-terminal-red bg-terminal-red/10 text-terminal-red'
            : 'border-terminal-border bg-terminal-black text-gray-300'
        }`}>
          <div className="flex items-center gap-2">
            <Radio className={`w-5 h-5 ${isDetected ? 'animate-pulse' : 'text-terminal-muted'}`} />
            <div>
              <div className="text-xs uppercase font-bold tracking-wider">
                {isDetected ? 'HUMAN PRESENCE ACQUIRED' : 'RADAR FIELD CLEAR (SCANNING)'}
              </div>
              <div className="text-[10px] text-terminal-muted">
                24GHz mmWave Micro-Doppler FMCW Radar
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-lg font-bold">
              {isDetected ? `${distance}m` : '--'}
            </div>
            <div className="text-[9px] text-terminal-muted">TARGET DISTANCE</div>
          </div>
        </div>

        {/* Tactical 0m to 8m Range Distance Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] text-terminal-muted">
            <span>0m (NODE CHASSIS)</span>
            <span>4m (MID ZONE)</span>
            <span>8m (MAX RANGE)</span>
          </div>

          {/* Bar track */}
          <div className="relative w-full h-8 bg-terminal-black border border-terminal-border overflow-hidden">
            {/* Grid increments */}
            <div className="absolute inset-0 flex justify-between px-2 pointer-events-none opacity-30">
              {[1, 2, 3, 4, 5, 6, 7].map(m => (
                <div key={m} className="border-r border-terminal-muted h-full" />
              ))}
            </div>

            {/* Target Distance Indicator */}
            {isDetected ? (
              <div
                className="absolute top-0 bottom-0 flex items-center transition-all duration-300"
                style={{ left: `${distancePct}%` }}
              >
                <div className="relative -translate-x-1/2 flex flex-col items-center">
                  <div className="w-4 h-4 rounded-full bg-terminal-red shadow-[0_0_10px_#ff3344] animate-ping" />
                  <div className="absolute top-1 w-2 h-2 rounded-full bg-white" />
                  <span className="absolute top-5 text-[9px] font-bold text-terminal-red whitespace-nowrap bg-black/90 px-1 border border-terminal-red">
                    HUMAN {distance}m
                  </span>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[10px] text-terminal-muted italic">
                NO TARGETS WITHIN 8-METER ARC
              </div>
            )}
          </div>
        </div>

        {/* Radar Telemetry Specs */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-terminal-border text-[11px]">
          <div className="p-2 bg-terminal-black border border-terminal-border">
            <div className="text-terminal-muted text-[9px]">PRESENCE</div>
            <div className={`font-bold ${isDetected ? 'text-terminal-red' : 'text-terminal-green'}`}>
              {isDetected ? 'ACTIVE' : 'STANDBY'}
            </div>
          </div>
          <div className="p-2 bg-terminal-black border border-terminal-border">
            <div className="text-terminal-muted text-[9px]">CONFIDENCE</div>
            <div className="font-bold text-gray-200">
              {isDetected ? `${Math.round((radar.confidence || 0.9) * 100)}%` : '0%'}
            </div>
          </div>
          <div className="p-2 bg-terminal-black border border-terminal-border">
            <div className="text-terminal-muted text-[9px]">FOV ANGLE</div>
            <div className="font-bold text-gray-200">60° HORIZONTAL</div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default RadarView;
