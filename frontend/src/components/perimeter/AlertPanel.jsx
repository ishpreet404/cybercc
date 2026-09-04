import React from 'react';
import { AlertTriangle, ShieldCheck, CheckCircle2, XCircle, Clock, Eye, Radio, Activity } from 'lucide-react';
import Card from '../Card';
import Button from '../Button';

export const AlertPanel = ({ alerts = [], onAcknowledge, onResolve, onDismiss }) => {
  return (
    <Card title={`▸ ACTIVE PERIMETER ALARMS (${alerts.length})`}>
      <div className="flex-1 flex flex-col justify-between font-mono">
        
        {alerts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center border border-terminal-green/30 bg-terminal-green/5 text-terminal-green min-h-[220px]">
            <ShieldCheck className="w-10 h-10 mb-2 text-terminal-green opacity-80" />
            <div className="text-xs sm:text-sm font-bold tracking-wider uppercase">
              PERIMETER INTEGRITY SECURE
            </div>
            <div className="text-[11px] text-terminal-muted mt-1 max-w-[260px]">
              No active intrusion candidates flagged by sensor fusion.
            </div>
          </div>
        ) : (
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {alerts.map((alert) => {
              const isCritical = alert.severity === 'CRITICAL';
              const isHigh = alert.severity === 'HIGH';

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
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={`w-4 h-4 flex-shrink-0 ${isCritical ? 'text-terminal-red animate-pulse' : 'text-terminal-amber'}`} />
                      <div>
                        <div className={`text-xs font-bold uppercase tracking-wider ${isCritical ? 'text-terminal-red' : 'text-terminal-amber'}`}>
                          [{alert.severity}] {alert.title}
                        </div>
                        <div className="text-[10px] text-terminal-muted mt-0.5">
                          NODE: <span className="text-gray-200 font-bold">{alert.nodeId}</span> | CONF:{' '}
                          <span className="text-white font-bold">{Math.round((alert.confidence || 0.85) * 100)}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {alert.status === 'NEW' && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold bg-terminal-red text-white uppercase animate-pulse leading-none">
                          NEW
                        </span>
                      )}
                      {alert.status === 'ACKNOWLEDGED' && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold bg-terminal-amber text-black uppercase leading-none">
                          ACK
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Evidence Modalities Checklist */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1.5 bg-terminal-black/80 border border-terminal-border text-[9px] mb-2.5">
                    <div className="flex items-center gap-1">
                      <Radio className="w-2.5 h-2.5 text-terminal-muted flex-shrink-0" />
                      <span className="text-terminal-muted">RADAR:</span>
                      <span className={alert.evidence?.radar ? 'text-terminal-green font-bold' : 'text-gray-500'}>
                        {alert.evidence?.radar ? 'DET' : 'CLR'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Activity className="w-2.5 h-2.5 text-terminal-muted flex-shrink-0" />
                      <span className="text-terminal-muted">ADXL1:</span>
                      <span className={alert.evidence?.vibrationSensor1 ? 'text-terminal-amber font-bold' : 'text-gray-500'}>
                        {alert.evidence?.vibrationSensor1 ? 'DET' : 'CLR'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Activity className="w-2.5 h-2.5 text-terminal-muted flex-shrink-0" />
                      <span className="text-terminal-muted">ADXL2:</span>
                      <span className={alert.evidence?.vibrationSensor2 ? 'text-terminal-amber font-bold' : 'text-gray-500'}>
                        {alert.evidence?.vibrationSensor2 ? 'DET' : 'CLR'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Eye className="w-2.5 h-2.5 text-terminal-muted flex-shrink-0" />
                      <span className="text-terminal-muted">CAM:</span>
                      <span className={alert.evidence?.camera ? 'text-terminal-cyan font-bold' : 'text-gray-500'}>
                        {alert.evidence?.camera ? 'VER' : 'PND'}
                      </span>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="text-[10px] text-gray-300 mb-2 leading-tight">
                    {alert.message}
                  </div>

                  {/* Action Buttons: Acknowledge / Resolve / Dismiss */}
                  <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-terminal-border/60">
                    {alert.status === 'NEW' && onAcknowledge && (
                      <Button
                        size="sm"
                        variant="warning"
                        onClick={() => onAcknowledge(alert.id)}
                        className="text-[10px] px-2 py-1"
                      >
                        ACKNOWLEDGE
                      </Button>
                    )}
                    {onResolve && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => onResolve(alert.id)}
                        className="text-[10px] px-2 py-1"
                      >
                        RESOLVE
                      </Button>
                    )}
                    {onDismiss && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDismiss(alert.id)}
                        className="text-[10px] px-2 py-1"
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

      </div>
    </Card>
  );
};

export default AlertPanel;
