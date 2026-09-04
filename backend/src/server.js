/**
 * Cyber Chaukidaar - Central Server & Gateway
 * 
 * Combines physical perimeter intelligence (ESP32 nodes, radar, dual seismic ADXL345,
 * local Random Forest ML, camera verification, multi-modal sensor fusion, alarms)
 * with existing digital OSINT threat intelligence (/api/breach-check).
 */

const http = require('http');
const express = require('express');
const cors = require('cors');
const config = require('./config');
const realtimeService = require('./services/realtime');
const nodeManager = require('./services/nodeManager');
const SimulationEngine = require('./simulation/simulationEngine');

// Import Route Handlers
const nodesRoutes = require('./routes/nodes');
const telemetryRoutes = require('./routes/telemetry');
const eventsRoutes = require('./routes/events');
const alertsRoutes = require('./routes/alerts');
const dashboardRoutes = require('./routes/dashboard');
const systemRoutes = require('./routes/system');
const breachRoutes = require('./routes/breach');

const app = express();
const server = http.createServer(app);

// Enable CORS for frontend Vite development & local deployment
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logger for audit and debugging
app.use((req, res, next) => {
  if (!req.url.includes('/vibration') && !req.url.includes('/radar') && !req.url.includes('/health')) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  }
  next();
});

// Mount Routes
app.use('/api/nodes', nodesRoutes);
app.use('/api/telemetry', telemetryRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/system', systemRoutes);
app.use('/api', breachRoutes); // Preserves exact endpoint /api/breach-check

// Initialize WebSocket Service
realtimeService.init(server);

// Initialize & Start Autonomous Simulation Engine
const simulationEngine = new SimulationEngine(nodeManager);
app.locals.simulationEngine = simulationEngine;
simulationEngine.start(2000); // Ticks every 2s

// Root health banner
app.get('/', (req, res) => {
  res.json({
    name: 'Cyber Chaukidaar Central Perimeter Intelligence Gateway',
    status: 'ONLINE',
    version: '1.0.0',
    endpoints: [
      '/api/dashboard/overview',
      '/api/nodes',
      '/api/telemetry',
      '/api/events',
      '/api/alerts',
      '/api/system/health',
      '/api/breach-check'
    ]
  });
});

// Start listening
server.listen(config.PORT, config.HOST, () => {
  console.log(`=======================================================`);
  console.log(`🛡️  CYBER CHAUKIDAAR CENTRAL GATEWAY LISTENING ON PORT ${config.PORT}`);
  console.log(`📡 WebSocket server active for real-time dashboard events`);
  console.log(`🤖 Local ML Vibration Classifier loaded & active`);
  console.log(`🔍 Digital Threat Intelligence (/api/breach-check) ready`);
  console.log(`🎯 Multi-node autonomous simulation engine running`);
  console.log(`=======================================================`);
});
