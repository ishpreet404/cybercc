import React from 'react';
import { Shield, Radio, Activity, AlertTriangle, Battery, Eye, Cpu, Zap, Crosshair } from 'lucide-react';
import PerimeterMap from '../components/perimeter/PerimeterMap';
import TelemetryPanel from '../components/perimeter/TelemetryPanel';
import RadarView from '../components/perimeter/RadarView';
import VibrationChart from '../components/perimeter/VibrationChart';
import AlertPanel from '../components/perimeter/AlertPanel';
import EstimatedPosition from '../components/perimeter/EstimatedPosition';
import CameraVerification from '../components/perimeter/CameraVerification';
import Button from '../components/Button';

export const PerimeterDashboard = ({
  nodes = [],
  alerts = [],
  selectedNodeId,
  onSelectNode,
  overviewData,
  onAcknowledgeAlert,
  onResolveAlert,
  onDismissAlert,
  onQuickDemo
}) => {
  const selectedNode = nodes.find(n => n.nodeId === selectedNodeId) || nodes[0];

  const onlineCount = nodes.filter(n => n.status === 'ONLINE').length;
  const alertCount = alerts.filter(a => a.status === 'NEW' || a.status === 'ACKNOWLEDGED').length;
  const isPerimeterBreached = alertCount > 0;

  return (
    <div className="space-y-5 font-mono">
      
      {/* Top Threat & Health Stat HUD - Balanced Heights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        {/* System Status */}
        <div className={`p-3 border flex flex-col justify-between h-24 ${
          isPerimeterBreached 
            ? 'border-terminal-red bg-terminal-red/10 text-terminal-red shadow-[0_0_12px_rgba(255,51,68,0.2)]' 
            : 'border-terminal-green bg-terminal-green/5 text-terminal-green'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-terminal-muted uppercase tracking-wider font-bold">DEFENSE STATUS</span>
            <Shield className="w-4 h-4 flex-shrink-0" />
          </div>
          <div className="text-base sm:text-lg font-bold tracking-wider leading-none">
            {isPerimeterBreached ? 'PERIMETER ALERT' : 'SECURE SENTRY'}
          </div>
          <div className="text-[10px] text-terminal-muted leading-none">
            {isPerimeterBreached ? `${alertCount} ACTIVE THREAT CANDIDATE` : 'ALL SECTORS SECURED'}
          </div>
        </div>

        {/* Nodes Online */}
        <div className="p-3 border border-terminal-border bg-terminal-surface text-gray-100 flex flex-col justify-between h-24">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-terminal-muted uppercase tracking-wider font-bold">ONLINE NODES</span>
            <Radio className="w-4 h-4 text-terminal-cyan flex-shrink-0" />
          </div>
          <div className="text-base sm:text-lg font-bold text-terminal-cyan leading-none">
            {onlineCount} / {nodes.length} ONLINE
          </div>
          <div className="text-[10px] text-terminal-muted leading-none">
            LORA / WIFI / BLE MESH
          </div>
        </div>

        {/* 3-Point Sensor Corroboration */}
        <div className="p-3 border border-terminal-border bg-terminal-surface text-gray-100 flex flex-col justify-between h-24">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-terminal-muted uppercase tracking-wider font-bold">3-POINT REDUNDANCY</span>
            <Activity className="w-4 h-4 text-terminal-amber flex-shrink-0" />
          </div>
          <div className="text-base sm:text-lg font-bold text-terminal-amber leading-none">
            SYNCHRONIZED
          </div>
          <div className="text-[10px] text-terminal-muted leading-none">
            RADAR + DUAL ADXL345
          </div>
        </div>

        {/* Quick Demo Trigger */}
        <div className="p-3 border border-terminal-amber/50 bg-terminal-amber/5 flex flex-col justify-between h-24">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-terminal-amber font-bold tracking-wider">HACKATHON DEMO</span>
            <Zap className="w-4 h-4 text-terminal-amber animate-pulse flex-shrink-0" />
          </div>
          <Button
            size="sm"
            variant="warning"
            onClick={onQuickDemo}
            className="w-full text-[11px] py-1 leading-none h-8"
          >
            [ RUN 7-STEP DEMO ]
          </Button>
        </div>

      </div>

      {/* SECTION A: Main 2D Property / Perimeter Coordinate Map */}
      <PerimeterMap
        nodes={nodes}
        activeAlerts={alerts}
        selectedNodeId={selectedNode?.nodeId}
        onSelectNode={onSelectNode}
      />

      {/* SECTION B: Distributed Node Telemetry Cards */}
      <TelemetryPanel
        nodes={nodes}
        selectedNodeId={selectedNode?.nodeId}
        onSelectNode={onSelectNode}
      />

      {/* SECTION C & D: Live Sensor Deep View (Radar & Dual Seismic Oscilloscope) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
        <RadarView node={selectedNode} />
        <VibrationChart node={selectedNode} />
      </div>

      {/* SECTION E & Extended Modalities: Localization, Camera & Alarms */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        <EstimatedPosition node={selectedNode} />
        <CameraVerification node={selectedNode} />
        <AlertPanel
          alerts={alerts}
          onAcknowledge={onAcknowledgeAlert}
          onResolve={onResolveAlert}
          onDismiss={onDismissAlert}
        />
      </div>

    </div>
  );
};

export default PerimeterDashboard;
