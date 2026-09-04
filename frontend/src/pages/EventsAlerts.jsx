import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, CheckCircle, Clock, Filter, Eye, Activity, Radio } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';

export const EventsAlerts = ({ alerts = [], onAcknowledge, onResolve, onDismiss }) => {
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const filtered = alerts.filter(a => {
    if (filterSeverity !== 'ALL' && a.severity !== filterSeverity) return false;
    if (filterStatus !== 'ALL' && a.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6 font-mono">
      
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-terminal-border">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-terminal-red" />
            <span>INCIDENT LOG & ALARM MANAGEMENT</span>
          </h1>
          <p className="text-xs text-terminal-muted">
            Chronological audit trail of all physical perimeter intrusion candidates flagged by sensor fusion.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-terminal-black px-2 py-1 border border-terminal-border text-xs">
            <Filter className="w-3.5 h-3.5 text-terminal-muted" />
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-transparent text-gray-200 focus:outline-none"
            >
              <option value="ALL">ALL SEVERITIES</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>

          <div className="flex items-center gap-1 bg-terminal-black px-2 py-1 border border-terminal-border text-xs">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent text-gray-200 focus:outline-none"
            >
              <option value="ALL">ALL STATUSES</option>
              <option value="NEW">NEW</option>
              <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
              <option value="RESOLVED">RESOLVED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Incident List */}
      {filtered.length === 0 ? (
        <Card>
          <div className="p-8 text-center text-terminal-muted">
            <ShieldCheck className="w-12 h-12 mx-auto mb-3 text-terminal-green opacity-70" />
            <div className="text-sm font-bold uppercase tracking-wider text-gray-200">NO INCIDENTS MATCH CRITERIA</div>
            <div className="text-xs mt-1">Perimeter sentries report zero active alarms matching the selected filters.</div>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((alert) => {
            const isCritical = alert.severity === 'CRITICAL';
            const isHigh = alert.severity === 'HIGH';

            return (
              <Card
                key={alert.id}
                className={isCritical ? 'border-terminal-red/80' : isHigh ? 'border-terminal-amber/80' : ''}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  
                  {/* Left: Severity & Title */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase border ${
                        isCritical ? 'bg-terminal-red text-white border-terminal-red' : isHigh ? 'bg-terminal-amber text-black border-terminal-amber' : 'bg-gray-700 text-gray-200 border-gray-600'
                      }`}>
                        {alert.severity}
                      </span>
                      <span className="text-sm font-bold text-gray-100">{alert.title}</span>
                    </div>

                    <div className="text-xs text-terminal-muted">
                      NODE: <span className="font-bold text-terminal-green">{alert.nodeId}</span> | TIME:{' '}
                      <span>{new Date(alert.createdAt).toLocaleString()}</span> | CONFIDENCE:{' '}
                      <span className="font-bold text-white">{Math.round((alert.confidence || 0.85) * 100)}%</span>
                    </div>

                    <div className="text-xs text-gray-300 pt-1">
                      {alert.message}
                    </div>

                    {/* Sensor Evidence Checklist */}
                    <div className="flex items-center gap-3 pt-2 text-[10px]">
                      <span className={alert.evidence?.radar ? 'text-terminal-green font-bold' : 'text-gray-500'}>
                        RADAR: {alert.evidence?.radar ? 'DETECTED' : 'CLEAR'}
                      </span>
                      <span className={alert.evidence?.vibrationSensor1 ? 'text-terminal-amber font-bold' : 'text-gray-500'}>
                        ADXL-01: {alert.evidence?.vibrationSensor1 ? 'ELEVATED' : 'NORMAL'}
                      </span>
                      <span className={alert.evidence?.vibrationSensor2 ? 'text-terminal-amber font-bold' : 'text-gray-500'}>
                        ADXL-02: {alert.evidence?.vibrationSensor2 ? 'ELEVATED' : 'NORMAL'}
                      </span>
                      <span className={alert.evidence?.camera ? 'text-terminal-cyan font-bold' : 'text-gray-500'}>
                        CAMERA: {alert.evidence?.camera ? 'VERIFIED' : 'PENDING'}
                      </span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 sm:self-center">
                    {alert.status === 'NEW' && onAcknowledge && (
                      <Button size="sm" variant="warning" onClick={() => onAcknowledge(alert.id)}>
                        ACKNOWLEDGE
                      </Button>
                    )}
                    {alert.status !== 'RESOLVED' && onResolve && (
                      <Button size="sm" variant="primary" onClick={() => onResolve(alert.id)}>
                        RESOLVE
                      </Button>
                    )}
                    {onDismiss && (
                      <Button size="sm" variant="outline" onClick={() => onDismiss(alert.id)}>
                        DISMISS
                      </Button>
                    )}
                  </div>

                </div>
              </Card>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default EventsAlerts;
