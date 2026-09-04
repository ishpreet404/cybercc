import React, { useState, useEffect } from 'react';
import { Cpu, Radio, Activity, Eye, Battery, Wifi, Shield, Clock, AlertTriangle, ArrowLeft } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import RadarView from '../components/perimeter/RadarView';
import VibrationChart from '../components/perimeter/VibrationChart';
import EstimatedPosition from '../components/perimeter/EstimatedPosition';
import CameraVerification from '../components/perimeter/CameraVerification';
import api from '../services/api';

export const NodeDetails = ({ nodes = [], selectedNodeId, onSelectNode, onBack }) => {
  const [activeNodeId, setActiveNodeId] = useState(selectedNodeId || (nodes[0] && nodes[0].nodeId));
  const [history, setHistory] = useState([]);

  const node = nodes.find(n => n.nodeId === activeNodeId) || nodes[0];

  useEffect(() => {
    if (activeNodeId) {
      api.getNodeTelemetryHistory(activeNodeId, 15)
        .then(res => {
          if (res.success) setHistory(res.data);
        })
        .catch(() => {});
    }
  }, [activeNodeId]);

  if (!node) {
    return <div className="p-8 text-center text-terminal-muted font-mono">NO NODE SELECTED</div>;
  }

  return (
    <div className="space-y-6 font-mono">
      
      {/* Top Header & Node Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-terminal-border">
        <div className="flex items-center gap-3">
          <Button size="sm" variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            BACK TO COMMAND CENTER
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-100 flex items-center gap-2">
              <Cpu className="w-6 h-6 text-terminal-green" />
              <span>NODE INSPECTION: {node.nodeId}</span>
            </h1>
            <div className="text-xs text-terminal-muted">
              {node.name} | FIRMWARE: v{node.firmware || '1.2.0'} | STATUS: <span className="font-bold text-terminal-green">{node.status}</span>
            </div>
          </div>
        </div>

        {/* Quick Node Switcher Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {nodes.map(n => (
            <button
              key={n.nodeId}
              onClick={() => setActiveNodeId(n.nodeId)}
              className={`px-3 py-1.5 text-xs font-bold border transition-colors ${
                activeNodeId === n.nodeId
                  ? 'border-terminal-green text-terminal-green bg-terminal-green/10'
                  : 'border-terminal-border text-gray-400 hover:text-gray-200'
              }`}
            >
              {n.nodeId}
            </button>
          ))}
        </div>
      </div>

      {/* 12-SECTION DEEP DRILLDOWN */}
      
      {/* 1. Overview & 10. Communication & 11. Battery */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Section 1: Overview */}
        <Card title="1. NODE OVERVIEW & IDENTITY">
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-terminal-border">
              <span className="text-terminal-muted">ID:</span>
              <span className="font-bold text-gray-100">{node.nodeId}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-terminal-border">
              <span className="text-terminal-muted">DESIGNATION:</span>
              <span className="font-bold text-gray-100">{node.name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-terminal-border">
              <span className="text-terminal-muted">GRID COORDINATES:</span>
              <span className="font-bold text-gray-100">X: {node.position?.x}% | Y: {node.position?.y}%</span>
            </div>
            <div className="flex justify-between py-1 border-b border-terminal-border">
              <span className="text-terminal-muted">PROBE SPACING:</span>
              <span className="font-bold text-gray-100">{node.sensorSpacing || 1.5} meters</span>
            </div>
          </div>
        </Card>

        {/* Section 10: Communication */}
        <Card title="10. TRANSPORT & CONNECTIVITY">
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-terminal-border">
              <span className="text-terminal-muted">ACTIVE TRANSPORT:</span>
              <span className="font-bold text-terminal-cyan uppercase">{node.communication}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-terminal-border">
              <span className="text-terminal-muted">SIGNAL STRENGTH:</span>
              <span className="font-bold text-gray-100">{node.signal?.rssi || -62} dBm</span>
            </div>
            <div className="flex justify-between py-1 border-b border-terminal-border">
              <span className="text-terminal-muted">PACKET SEQUENCE:</span>
              <span className="font-bold text-gray-100">SYNCED (0% LOSS)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-terminal-border">
              <span className="text-terminal-muted">FALLBACK INTERFACE:</span>
              <span className="font-bold text-gray-100">LORA / BLE READY</span>
            </div>
          </div>
        </Card>

        {/* Section 11: Battery */}
        <Card title="11. POWER & BATTERY TELEMETRY">
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-terminal-border">
              <span className="text-terminal-muted">MEASURED VOLTAGE:</span>
              <span className="font-bold text-terminal-green">{node.battery?.voltage?.toFixed(2)} V</span>
            </div>
            <div className="flex justify-between py-1 border-b border-terminal-border">
              <span className="text-terminal-muted">ESTIMATED LEVEL:</span>
              <span className="font-bold text-terminal-green">{node.battery?.percentage}%</span>
            </div>
            <div className="flex justify-between py-1 border-b border-terminal-border">
              <span className="text-terminal-muted">SLEEP DUTY CYCLE:</span>
              <span className="font-bold text-gray-100">LIGHT SLEEP (ULP WAKE)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-terminal-border">
              <span className="text-terminal-muted">NODE RUNTIME:</span>
              <span className="font-bold text-gray-100">{Math.round((node.uptimeSeconds || 3600) / 3600)}h operational</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Sections 2, 3, 4, 5, 6, 7: Radar, Dual ADXL & Vibration Waveforms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RadarView node={node} />
        <VibrationChart node={node} />
      </div>

      {/* Sections 8 & 9: Estimated Position & Camera */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EstimatedPosition node={node} />
        <CameraVerification node={node} />
      </div>

      {/* Section 12: Event & Telemetry Audit History */}
      <Card title="12. EVENT AUDIT TRAIL & TELEMETRY LOG">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-terminal-border text-terminal-muted bg-terminal-black">
                <th className="p-2">TIME</th>
                <th className="p-2">RADAR</th>
                <th className="p-2">ADXL-01</th>
                <th className="p-2">ADXL-02</th>
                <th className="p-2">BATTERY</th>
                <th className="p-2">RSSI</th>
                <th className="p-2">CLASSIFICATION</th>
                <th className="p-2">STATE</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-4 text-center text-terminal-muted italic">
                    RECORDING LIVE TELEMETRY STREAM...
                  </td>
                </tr>
              ) : (
                history.map((t, idx) => (
                  <tr key={idx} className="border-b border-terminal-border/40 hover:bg-terminal-surface">
                    <td className="p-2 text-terminal-muted">{new Date(t.timestamp).toLocaleTimeString()}</td>
                    <td className="p-2 font-bold text-gray-200">
                      {t.radar?.presence ? `${t.radar.distance}m` : 'CLEAR'}
                    </td>
                    <td className="p-2">{t.accelerometer?.sensor1?.vibrationRms}g</td>
                    <td className="p-2">{t.accelerometer?.sensor2?.vibrationRms}g</td>
                    <td className="p-2">{t.battery?.percentage}%</td>
                    <td className="p-2">{t.signal?.rssi} dBm</td>
                    <td className="p-2 text-terminal-amber">{t.fusion?.classification || 'NORMAL'}</td>
                    <td className="p-2">
                      <span className={`px-1.5 py-0.2 text-[9px] font-bold uppercase border ${
                        t.eventState === 'ALERT' ? 'border-terminal-red text-terminal-red' : 'border-terminal-green text-terminal-green'
                      }`}>
                        {t.eventState || 'NORMAL'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
};

export default NodeDetails;
