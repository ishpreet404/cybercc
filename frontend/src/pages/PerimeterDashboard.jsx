import React from 'react';
import { Shield, Radio, Activity, AlertTriangle, Battery, Eye, Cpu, Zap, Crosshair } from 'lucide-react';
import PerimeterMap from '../components/perimeter/PerimeterMap';
import TelemetryPanel from '../components/perimeter/TelemetryPanel';
import RadarView from '../components/perimeter/RadarView';
import VibrationChart from '../components/perimeter/VibrationChart';
import AlertPanel from '../components/perimeter/AlertPanel';
import EstimatedPosition from '../components/perimeter/EstimatedPosition';
import CameraVerification from '../components/perimeter/CameraVerification';
import Card from '../components/Card';
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
    <div className="space-y-6 font-mono">
      
      {/* Top Threat & Health Stat HUD */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        {/* System Status */}
        <div className={`p-3 border ${
          isPerimeterBreached 
            ? 'border-terminal-red bg-terminal-red/10 text-terminal-red' 
            : 'border-terminal-green bg-terminal-green/5 text-terminal-green'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-terminal-muted uppercase tracking-widest font-bold">DEFENSE STATUS</span>
            <Shield className="w-4 h-4" />
          </div>
          <div className="text-lg sm:text-xl font-bold mt-1 tracking-wider">
            {isPerimeterBreached ? 'PERIMETER ALERT' : 'SECURE SENTRY'}
          </div>
          <div className="text-[10px] text-terminal-muted mt-0.5">
            {isPerimeterBreached ? `${alertCount} ACTIVE INTRUSION EVENT` : 'ALL SECTORS OPTIMAL'}
          </div>
        </div>

        {/* Nodes Online */}
        <div className="p-3 border border-terminal-border bg-terminal-surface text-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-terminal-muted uppercase tracking-widest font-bold">ONLINE NODES</span>
            <Radio className="w-4 h-4 text-terminal-cyan" />
          </div>
          <div className="text-lg sm:text-xl font-bold mt-1 text-terminal-cyan">
            {onlineCount} / {nodes.length}
          </div>
          <div className="text-[10px] text-terminal-muted mt-0.5">
            LORA / WIFI / BLE MESH
          </div>
        </div>

        {/* 3-Point Sensor Corroboration */}
        <div className="p-3 border border-terminal-border bg-terminal-surface text-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-terminal-muted uppercase tracking-widest font-bold">3-POINT REDUNDANCY</span>
            <Activity className="w-4 h-4 text-terminal-amber" />
          </div>
          <div className="text-lg sm:text-xl font-bold mt-1 text-terminal-amber">
            ACTIVE
          </div>
          <div className="text-[10px] text-terminal-muted mt-0.5">
            RADAR + DUAL ADXL345
          </div>
        </div>

        {/* Quick Demo Trigger */}
        <div className="p-3 border border-terminal-amber/40 bg-terminal-amber/5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-terminal-amber font-bold tracking-wider">HACKATHON DEMO</span>
            <Zap className="w-4 h-4 text-terminal-amber animate-pulse" />
          </div>
          <Button
            size="sm"
            variant="warning"
            onClick={onQuickDemo}
            className="w-full mt-2 text-xs"
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Range Panel */}
        <RadarView node={selectedNode} />

        {/* Dual Accelerometer Vibration Waveform & ML */}
        <VibrationChart node={selectedNode} />
      </div>

      {/* SECTION E & Extended Modalities: Localization, Camera & Alarms */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Local Two-Sensor Localization Plot */}
        <EstimatedPosition node={selectedNode} />

        {/* Optical Camera Verification Feed */}
        <CameraVerification node={selectedNode} />

        {/* Real-time Operator Alarms & Response */}
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
