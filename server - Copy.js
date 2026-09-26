/**
 * ============================================================================
 * Marine AI – Backend Server
 * Agentic Marine Intelligence & Smart Fishing Decision Support
 * ISRO / Department of Space – PS 26176
 * ============================================================================
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');

// Route Handlers
const aiRoutes = require('./src/routes/aiRoutes');
const telemetryRoutes = require('./src/routes/telemetryRoutes');
const pfzRoutes = require('./src/routes/pfzRoutes');
const navigationRoutes = require('./src/routes/navigationRoutes');
const emergencyRoutes = require('./src/routes/emergencyRoutes');
const servicesRoutes = require('./src/routes/servicesRoutes');

const app = express();
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    if (req.path.startsWith('/api')) {
      const duration = Date.now() - start;
      console.log(`[API] ${req.method} ${req.path} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// API Routes
app.use('/api/ai', aiRoutes);
app.use('/api/telemetry', telemetryRoutes);
app.use('/api/pfz', pfzRoutes);
app.use('/api/navigation', navigationRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/schemes', servicesRoutes);
app.use('/api/market', servicesRoutes);

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'Marine AI Backend Engine',
    version: '2.0.0',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    activeModules: [
      'ORCA Multi-Agent Reasoning Core',
      'ISRO OceanSat-3 & Telemetry Processor',
      'Potential Fishing Zone (PFZ) Engine',
      'Autonomous NavIC SOS Distress Gateway',
      'Smart Net Load Cell Ingestion Service',
      'Government Schemes & DBT Linkage'
    ]
  });
});

// Serve Static Frontend Assets (Vite React + TS Build in client/dist)
const fs = require('fs');
const { execSync } = require('child_process');
const distPath = path.join(__dirname, 'client', 'dist');

// If client/dist doesn't exist yet (e.g. fresh git clone), automatically build it
if (!fs.existsSync(distPath)) {
  console.log('⚡ [Marine AI] client/dist not found. Automatically building React frontend...');
  try {
    execSync('npm --prefix client run build', { stdio: 'inherit' });
    console.log('✅ [Marine AI] React frontend built successfully!');
  } catch (err) {
    console.warn('⚠️ [Marine AI] Auto-build failed. Run "cd client && npm install && npm run build" manually.');
  }
}

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.use(express.static(__dirname));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(__dirname, 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Server Error]:', err.stack || err);
  res.status(500).json({
    error: 'Internal Marine AI Server Error',
    message: err.message
  });
});

// Start Server with Port Availability Fallback
function startServer(port) {
  const server = http.createServer(app);

  server.listen(port, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 Marine AI Full-Stack Server is running!`);
    console.log(`📡 URL: http://localhost:${port}`);
    console.log(`🧭 API Health: http://localhost:${port}/api/health`);
    console.log(`======================================================\n`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[Port ${port} in use, attempting port ${port + 1}...]`);
      startServer(port + 1);
    } else {
      console.error('[Server Fatal Error]:', err);
    }
  });

  return server;
}

startServer(DEFAULT_PORT);

module.exports = app;
