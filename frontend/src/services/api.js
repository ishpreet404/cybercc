/**
 * Cyber Chaukidaar - Frontend API Service Client
 */

const BASE_URL = (import.meta.env.VITE_APP_API_BASE_URL || 'http://localhost:8787').replace(/\/+$/, '');

async function fetchJson(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error((data && data.error && data.error.message) || data.message || `HTTP ${res.status}`);
  }
  return data;
}

export const api = {
  // Dashboard Overview
  getOverview: () => fetchJson(`${BASE_URL}/api/dashboard/overview`),

  // Nodes
  getNodes: () => fetchJson(`${BASE_URL}/api/nodes`),
  getNode: (id) => fetchJson(`${BASE_URL}/api/nodes/${id}`),
  updateNode: (id, updates) => fetchJson(`${BASE_URL}/api/nodes/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  getNodeVibration: (id) => fetchJson(`${BASE_URL}/api/nodes/${id}/vibration`),
  getNodeTelemetryHistory: (id, limit = 40) => fetchJson(`${BASE_URL}/api/nodes/${id}/telemetry?limit=${limit}`),

  // Alerts
  getAlerts: (status = '') => fetchJson(`${BASE_URL}/api/alerts${status ? `?status=${status}` : ''}`),
  acknowledgeAlert: (id) => fetchJson(`${BASE_URL}/api/alerts/${id}/ack`, { method: 'POST' }),
  resolveAlert: (id) => fetchJson(`${BASE_URL}/api/alerts/${id}/resolve`, { method: 'POST' }),
  dismissAlert: (id) => fetchJson(`${BASE_URL}/api/alerts/${id}/dismiss`, { method: 'POST' }),

  // Events
  getEvents: () => fetchJson(`${BASE_URL}/api/events`),

  // Demo Controls
  startDemo: (nodeId = 'NODE-001') => fetchJson(`${BASE_URL}/api/system/demo/start`, { method: 'POST', body: JSON.stringify({ nodeId }) }),
  stopDemo: () => fetchJson(`${BASE_URL}/api/system/demo/stop`, { method: 'POST' }),
  applyScenario: (scenarioId, nodeId = 'NODE-001') => fetchJson(`${BASE_URL}/api/system/demo/scenario`, {
    method: 'POST',
    body: JSON.stringify({ scenarioId, nodeId })
  }),
  setCameraMode: (mode) => fetchJson(`${BASE_URL}/api/system/camera/mode`, { method: 'POST', body: JSON.stringify({ mode }) })
};

export default api;
