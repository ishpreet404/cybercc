import React from 'react';
import { Battery, BatteryWarning, Wifi, Radio, Clock, Eye, Activity } from 'lucide-react';
import Card from '../Card';

export const TelemetryPanel = ({ nodes = [], selectedNodeId, onSelectNode }) => {
  return (
    <Card title="▸ DISTRIBUTED NODE TELEMETRY & SENTRY HEALTH">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {nodes.map((node) => {
          const isSelected = selectedNodeId === node.nodeId;
          const batPct = node.battery ? node.battery.percentage : 0;
          const batVolt = node.battery ? node.battery.voltage : 0;
          const isLowBat = batPct < 20;
          const isCriticalBat = batPct < 10;
          const isOffline = node.status === 'OFFLINE';
          const isAlert = node.status === 'ALERT';

          const statusBadgeColor = isOffline
            ? 'text-gray-400 border-gray-600 bg-gray-900'
            : isAlert
            ? 'text-terminal-red border-terminal-red bg-terminal-red/10 animate-pulse'
            : node.status === 'WARNING'
            ? 'text-terminal-amber border-terminal-amber bg-terminal-amber/10'
            : 'text-terminal-green border-terminal-green bg-terminal-green/10';

          return (
            <div
              key={node.nodeId}
              onClick={() => onSelectNode && onSelectNode(node.nodeId)}
              className={`p-3 bg-terminal-surface border cursor-pointer transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-terminal-green shadow-[0_0_12px_rgba(0,255,102,0.25)] bg-terminal-surface'
                  : 'border-terminal-border hover:border-gray-500'
              }`}
            >
              <div>
                {/* Node ID Header & Status */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-baseline gap-1.5 min-w-0">
                    <span className="font-mono text-xs font-bold text-gray-100 flex-shrink-0">{node.nodeId}</span>
                    <span className="text-[10px] font-mono text-terminal-muted truncate">
                      {node.name.replace('Perimeter Node ', '')}
                    </span>
                  </div>
                  <span className={`px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase border leading-none flex-shrink-0 ${statusBadgeColor}`}>
                    {node.status}
                  </span>
                </div>

                {/* Battery & Voltage Gauge */}
                <div className="mb-2.5 p-2 bg-terminal-black border border-terminal-border">
                  <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                    <span className="text-terminal-muted flex items-center gap-1">
                      {isLowBat ? (
                        <BatteryWarning className="w-3.5 h-3.5 text-terminal-amber flex-shrink-0" />
                      ) : (
                        <Battery className="w-3.5 h-3.5 text-terminal-green flex-shrink-0" />
                      )}
                      BATTERY:
                    </span>
                    <span className={`font-bold ${isCriticalBat ? 'text-terminal-red animate-pulse' : isLowBat ? 'text-terminal-amber' : 'text-terminal-green'}`}>
                      {batPct}% ({batVolt.toFixed(2)}V)
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-gray-800 h-1.5 rounded-none overflow-hidden">
                    <div
                      className={`h-full transition-all ${isCriticalBat ? 'bg-terminal-red' : isLowBat ? 'bg-terminal-amber' : 'bg-terminal-green'}`}
                      style={{ width: `${Math.min(100, batPct)}%` }}
                    />
                  </div>
                </div>

                {/* Telemetry Metrics Grid */}
                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px] font-mono text-gray-300">
                  <div className="flex items-center justify-between border-b border-terminal-border/40 pb-1">
                    <span className="text-terminal-muted flex items-center gap-1">
                      <Radio className="w-2.5 h-2.5 flex-shrink-0" /> RSSI:
                    </span>
                    <span className="font-bold text-gray-200">{node.signal?.rssi || -60} dBm</span>
                  </div>

                  <div className="flex items-center justify-between border-b border-terminal-border/40 pb-1">
                    <span className="text-terminal-muted flex items-center gap-1">
                      <Wifi className="w-2.5 h-2.5 flex-shrink-0" /> COMMS:
                    </span>
                    <span className="font-bold text-terminal-cyan uppercase">{node.communication}</span>
                  </div>

                  <div className="flex items-center justify-between border-b border-terminal-border/40 pb-1">
                    <span className="text-terminal-muted flex items-center gap-1">
                      <Eye className="w-2.5 h-2.5 flex-shrink-0" /> RADAR:
                    </span>
                    <span className={`font-bold ${node.sensors?.radar?.presence ? 'text-terminal-red' : 'text-gray-300'}`}>
                      {node.sensors?.radar?.presence ? `${node.sensors.radar.distance}m` : 'CLEAR'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-terminal-border/40 pb-1">
                    <span className="text-terminal-muted flex items-center gap-1">
                      <Activity className="w-2.5 h-2.5 flex-shrink-0" /> SEISMIC:
                    </span>
                    <span className={`font-bold ${node.sensors?.adxl1?.vibrationRms > 0.15 ? 'text-terminal-amber' : 'text-gray-300'}`}>
                      {node.sensors?.adxl1?.vibrationRms || '0.02'}g
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer: Last Seen & Uptime */}
              <div className="mt-2.5 pt-1.5 border-t border-terminal-border/50 flex items-center justify-between text-[9px] font-mono text-terminal-muted">
                <span className="flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5 flex-shrink-0" />
                  SEEN: {node.lastSeenSecondsAgo || 0}s ago
                </span>
                <span>FW: v{node.firmware || '1.2.0'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default TelemetryPanel;
