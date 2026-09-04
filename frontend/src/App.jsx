import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import PerimeterDashboard from './pages/PerimeterDashboard';
import NodeDetails from './pages/NodeDetails';
import EventsAlerts from './pages/EventsAlerts';
import ThreatIntelligence from './pages/ThreatIntelligence';
import DemoController from './pages/DemoController';
import api from './services/api';
import realtimeClient from './services/websocket';

export function App() {
  const [activeTab, setActiveTab] = useState('command');
  const [nodes, setNodes] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [selectedNodeId, setSelectedNodeId] = useState('NODE-001');
  const [overview, setOverview] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);

  // 1. Initial REST fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [overviewRes, nodesRes, alertsRes] = await Promise.all([
          api.getOverview().catch(() => null),
          api.getNodes().catch(() => null),
          api.getAlerts('active').catch(() => null)
        ]);

        if (overviewRes?.success) setOverview(overviewRes.data);
        if (nodesRes?.success) {
          setNodes(nodesRes.data);
          if (nodesRes.data.length > 0) setSelectedNodeId(nodesRes.data[0].nodeId);
        }
        if (alertsRes?.success) setAlerts(alertsRes.data);
      } catch (err) {
        console.warn('Initial data load warning:', err);
      }
    };

    fetchInitialData();
  }, []);

  // 2. Real-time WebSocket subscriptions
  useEffect(() => {
    realtimeClient.connect();

    const unsubStatus = realtimeClient.onStatusChange(setWsConnected);

    // Live telemetry update from distributed nodes
    const unsubTelemetry = realtimeClient.on('TELEMETRY_UPDATE', (payload) => {
      if (!payload || !payload.node) return;
      setNodes(prev => {
        const idx = prev.findIndex(n => n.nodeId === payload.node.nodeId);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = payload.node;
          return updated;
        } else {
          return [...prev, payload.node];
        }
      });
    });

    // Alert events
    const unsubAlertCreated = realtimeClient.on('ALERT_CREATED', (newAlert) => {
      setAlerts(prev => {
        const exists = prev.some(a => a.id === newAlert.id);
        if (exists) return prev;
        return [newAlert, ...prev];
      });
    });

    const unsubAlertAck = realtimeClient.on('ALERT_ACKNOWLEDGED', (ackAlert) => {
      setAlerts(prev => prev.map(a => a.id === ackAlert.id ? ackAlert : a));
    });

    const unsubAlertResolved = realtimeClient.on('ALERT_RESOLVED', (resAlert) => {
      setAlerts(prev => prev.filter(a => a.id !== resAlert.id));
    });

    const unsubNodeOffline = realtimeClient.on('NODE_OFFLINE', ({ nodeId }) => {
      setNodes(prev => prev.map(n => n.nodeId === nodeId ? { ...n, status: 'OFFLINE' } : n));
    });

    return () => {
      unsubStatus();
      unsubTelemetry();
      unsubAlertCreated();
      unsubAlertAck();
      unsubAlertResolved();
      unsubNodeOffline();
    };
  }, []);

  // Alert action handlers
  const handleAcknowledgeAlert = async (id) => {
    try {
      const res = await api.acknowledgeAlert(id);
      if (res.success) {
        setAlerts(prev => prev.map(a => a.id === id ? res.data : a));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleResolveAlert = async (id) => {
    try {
      const res = await api.resolveAlert(id);
      if (res.success) {
        setAlerts(prev => prev.filter(a => a.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDismissAlert = async (id) => {
    try {
      const res = await api.dismissAlert(id);
      if (res.success) {
        setAlerts(prev => prev.filter(a => a.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleQuickDemo = async () => {
    try {
      await api.startDemo(selectedNodeId);
      setActiveTab('command');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-terminal-black text-gray-100 flex flex-col scanlines">
      {/* Top Tactical Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        alertCount={alerts.length}
        wsConnected={wsConnected}
      />

      {/* Main Command View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'command' && (
          <PerimeterDashboard
            nodes={nodes}
            alerts={alerts}
            selectedNodeId={selectedNodeId}
            onSelectNode={(nodeId) => {
              setSelectedNodeId(nodeId);
              setActiveTab('nodes');
            }}
            overviewData={overview}
            onAcknowledgeAlert={handleAcknowledgeAlert}
            onResolveAlert={handleResolveAlert}
            onDismissAlert={handleDismissAlert}
            onQuickDemo={handleQuickDemo}
          />
        )}

        {activeTab === 'nodes' && (
          <NodeDetails
            nodes={nodes}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
            onBack={() => setActiveTab('command')}
          />
        )}

        {activeTab === 'events' && (
          <EventsAlerts
            alerts={alerts}
            onAcknowledge={handleAcknowledgeAlert}
            onResolve={handleResolveAlert}
            onDismiss={handleDismissAlert}
          />
        )}

        {activeTab === 'threat' && (
          <ThreatIntelligence />
        )}

        {activeTab === 'demo' && (
          <DemoController
            onStartDemo={async (nodeId) => {
              await api.startDemo(nodeId);
            }}
            onStopDemo={async () => {
              await api.stopDemo();
            }}
            onApplyScenario={async (scenarioId, nodeId) => {
              await api.applyScenario(scenarioId, nodeId);
            }}
          />
        )}
      </main>

      {/* Bottom Global Status Ticker */}
      <footer className="border-t border-terminal-border bg-terminal-dark py-2 px-4 text-[10px] font-mono text-terminal-muted flex flex-col sm:flex-row items-center justify-between gap-2">
        <div>
          CYBER CHAUKIDAAR DEFENSE SUITE | MULTI-MODAL 3-POINT PERIMETER SENSING &amp; OSINT INTELLIGENCE
        </div>
        <div className="flex items-center gap-3">
          <span>PORT: 8787</span>
          <span>PROTOCOL: WS + REST</span>
          <span className="text-terminal-green">DEFENSE ACTIVE</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
