import React from 'react';
import { AlertTriangle, ShieldCheck, CheckCircle2, XCircle, Clock, Eye, Radio, Activity } from 'lucide-react';
import Card from '../Card';
import Button from '../Button';

export const AlertPanel = ({ alerts = [], onAcknowledge, onResolve, onDismiss }) => {
  return (
    <Card title={`▸ ACTIVE PERIMETER ALARMS (${alerts.length})`}>
      {alerts.length === 0 ? (
        <div className="p-6 text-center border border-terminal-green/30 bg-terminal-green/5 text-terminal-green font-mono">
          <ShieldCheck className="w-8 h-8 mx-auto mb-2 opacity-80" />
          <div className="text-sm font-bold tracking-wider uppercase">PERIMETER INTEGRITY SECURE</div>
          <div className="text-[11px] text-terminal-muted mt-1">No active intrusion candidates flagged by sensor fusion.</div>
        </div>
      ) : (
        <div className="space-y-3 font-mono">
          {alerts.map((alert) => {
            const isCritical = alert.severity === 'CRITICAL';
            const isHigh = alert.severity === 'HIGH';
            const isAck = alert.status === 'ACKNOWLEDGED';

            const severityBorder = isCritical
              ? 'border-terminal-red bg-terminal-red/10'
              : isHigh
              ? 'border-terminal-amber bg-terminal-amber/10'
              : 'border-terminal-border bg-terminal-surface';

            return (
              <div
                key={alert.id}
                className={`p-3 border transition-all ${severityBorder}`}
              >
                {/* Alert Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`w-5 h-5 flex-shrink-0 ${isCritical ? 'text-terminal-red animate-pulse' : 'text-terminal-amber'}`} />
                    <div>
                      <div className={`text-xs font-bold uppercase tracking-wider ${isCritical ? 'text-terminal-red' : 'text-terminal-amber'}`}>
                        [{alert.severity}] {alert.title}
                      </div>
                      <div className="text-[10px] text-terminal-muted">
                        NODE: <span className="text-gray-200 font-bold">{alert.nodeId}</span> | CONFIDENCE:{' '}
                        <span className="text-white font-bold">{Math.round((alert.confidence || 0.85) * 100)}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {alert.status === 'NEW' && (
                      <span className="px-2 py-0.5 text-[9px] font-bold bg-terminal-red text-white uppercase animate-pulse">
                        NEW ALARM
                      </span>
                    )}
                    {alert.status === 'ACKNOWLEDGED' && (
                      <span className="px-2 py-0.5 text-[9px] font-bold bg-terminal-amber text-black uppercase">
                        ACKNOWLEDGED
                      </span>
                    )}
                  </div>
                </div>

                {/* Evidence Modalities Checklist */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-2 bg-terminal-black/70 border border-terminal-border text-[10px] mb-3">
                  <div className="flex items-center gap-1">
                    <Radio className="w-3 h-3 text-terminal-muted" />
                    <span className="text-terminal-muted">RADAR:</span>
                    <span className={alert.evidence?.radar ? 'text-terminal-green font-bold' : 'text-gray-500'}>
                      {alert.evidence?.radar ? 'DETECTED' : 'CLEAR'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Activity className="w-3 h-3 text-terminal-muted" />
                    <span className="text-terminal-muted">ADXL-01:</span>
                    <span className={alert.evidence?.vibrationSensor1 ? 'text-terminal-amber font-bold' : 'text-gray-500'}>
                      {alert.evidence?.vibrationSensor1 ? 'DETECTED' : 'CLEAR'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Activity className="w-3 h-3 text-terminal-muted" />
                    <span className="text-terminal-muted">ADXL-02:</span>
                    <span className={alert.evidence?.vibrationSensor2 ? 'text-terminal-amber font-bold' : 'text-gray-500'}>
                      {alert.evidence?.vibrationSensor2 ? 'DETECTED' : 'CLEAR'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3 text-terminal-muted" />
                    <span className="text-terminal-muted">CAMERA:</span>
                    <span className={alert.evidence?.camera ? 'text-terminal-cyan font-bold' : 'text-gray-500'}>
                      {alert.evidence?.camera ? 'VERIFIED' : 'PENDING'}
                    </span>
                  </div>
                </div>

                {/* Estimated Position & Message */}
                <div className="text-[11px] text-gray-300 mb-3 leading-tight">
                  {alert.message}
                </div>

                {/* Action Buttons: Acknowledge / Resolve / Dismiss */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-terminal-border/60">
                  {alert.status === 'NEW' && onAcknowledge && (
                    <Button
                      size="sm"
                      variant="warning"
                      onClick={() => onAcknowledge(alert.id)}
                    >
                      ACKNOWLEDGE
                    </Button>
                  )}
                  {onResolve && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => onResolve(alert.id)}
                    >
                      RESOLVE
                    </Button>
                  )}
                  {onDismiss && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDismiss(alert.id)}
                    >
                      DISMISS
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};

export default AlertPanel;
