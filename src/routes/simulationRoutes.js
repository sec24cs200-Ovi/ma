const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * Officially sourced & treaty-validated International Maritime Boundary Line (IMBL)
 * Historic Bilateral Agreements between India and Sri Lanka:
 * 1. 1974 Treaty: "Agreement on the Boundary in Historic Waters" (Palk Strait & Palk Bay)
 * 2. 1976 Treaty: "Agreement on the Maritime Boundary in the Gulf of Mannar & Bay of Bengal"
 */
const IMBL_OFFICIAL_TREATY_COORDINATES = [
  { id: 'POS-1', name: 'Position 1 (1974 Treaty)', lat: 10.0833, lng: 80.0500, desc: '10° 05.0′ N, 80° 03.0′ E - Palk Strait Entry' },
  { id: 'POS-2', name: 'Position 2 (1974 Treaty)', lat: 9.9500, lng: 79.5833, desc: '09° 57.0′ N, 79° 35.0′ E - Palk Bay North' },
  { id: 'POS-3', name: 'Position 3 (1974 Treaty)', lat: 9.6692, lng: 79.3767, desc: '09° 40.15′ N, 79° 22.60′ E - Central Palk Bay' },
  { id: 'POS-4', name: 'Position 4 (1974 Treaty)', lat: 9.3633, lng: 79.5117, desc: '09° 21.80′ N, 79° 30.70′ E - Katchatheevu Sector' },
  { id: 'POS-5', name: 'Position 5 (1974 Treaty)', lat: 9.2167, lng: 79.5333, desc: '09° 13.0′ N, 79° 32.0′ E - South Palk Bay' },
  { id: 'POS-6', name: 'Position 6 / 1m (1974 & 1976 Treaties)', lat: 9.1000, lng: 79.5333, desc: '09° 06.0′ N, 79° 32.0′ E - Adam’s Bridge Gap / Trijunction' },
  { id: 'POS-2M', name: 'Position 2m (1976 Treaty)', lat: 9.0000, lng: 79.5217, desc: '09° 00.0′ N, 79° 31.3′ E - Gulf of Mannar North' },
  { id: 'POS-3M', name: 'Position 3m (1976 Treaty)', lat: 8.8967, lng: 79.4883, desc: '08° 53.8′ N, 79° 29.3′ E - Gulf of Mannar Ridge' },
  { id: 'POS-4M', name: 'Position 4m (1976 Treaty)', lat: 8.6667, lng: 79.3033, desc: '08° 40.0′ N, 79° 18.2′ E - Gulf of Mannar Central' },
  { id: 'POS-5M', name: 'Position 5m (1976 Treaty)', lat: 8.6200, lng: 79.2167, desc: '08° 37.2′ N, 79° 13.0′ E - South-Western Approach' },
  { id: 'POS-6M', name: 'Position 6m (1976 Treaty)', lat: 8.5200, lng: 79.0783, desc: '08° 31.2′ N, 79° 04.7′ E - Deep Sea Sector' }
];

/**
 * Registered and authorized coastal safety contacts & rescue coordination stations
 */
const REGISTERED_SAFETY_STATIONS = [
  {
    id: 'STN-RMS-01',
    name: 'Rameswaram Coastal Marine Police Station',
    officer: 'Inspector S. Vignesh (Duty Commander)',
    phone: '8122566828',
    displayPhone: '+91 81225 66828',
    lat: 9.2876,
    lng: 79.3129,
    channel: 'VHF Ch 16 / NavIC Marine Net',
    verified: true,
    jurisdiction: 'Palk Bay & Dhanushkodi Northern Waters'
  },
  {
    id: 'STN-CG-MDM',
    name: 'Indian Coast Guard Station Mandapam (MRCC)',
    officer: 'Commandant R. K. Pillai (SAR Officer)',
    phone: '1554',
    displayPhone: '1554 (Toll-Free Coast Guard SAR)',
    lat: 9.2780,
    lng: 79.1240,
    channel: 'VHF Emergency Relay Ch 16 / NavIC Distress Gateway',
    verified: true,
    jurisdiction: 'Gulf of Mannar & Palk Strait International Buffer'
  },
  {
    id: 'STN-DNK-03',
    name: 'Dhanushkodi Marine Border Outpost',
    officer: 'Sub-Inspector M. Selvaraj',
    phone: '8122566828',
    displayPhone: '+91 81225 66828',
    lat: 9.1780,
    lng: 79.4180,
    channel: 'Direct Police Coastal Net',
    verified: true,
    jurisdiction: 'Arichal Munai & Adam’s Bridge Shoals'
  },
  {
    id: 'STN-TUT-04',
    name: 'Thoothukudi Maritime Rescue Sub-Centre (MRSC)',
    officer: 'Capt. A. Sundaram',
    phone: '0461-2352220',
    displayPhone: '+91 461 2352220',
    lat: 8.7850,
    lng: 78.1750,
    channel: 'INCOIS Marine Satellite Link',
    verified: true,
    jurisdiction: 'Gulf of Mannar Deepwater Commercial Corridor'
  }
];

/**
 * GET /api/simulation/config
 * Returns treaty coordinates, safety stations, and boundary configurations
 */
router.get('/config', (req, res) => {
  res.json({
    success: true,
    imbl: {
      treaty: 'Indo-Sri Lanka Maritime Agreements (1974 & 1976)',
      region: 'Rameswaram, Palk Strait, Palk Bay & Gulf of Mannar',
      coordinates: IMBL_OFFICIAL_TREATY_COORDINATES
    },
    defaultThresholds: {
      warningDistanceKm: 5.0,
      criticalDistanceKm: 1.5,
      gpsAccuracyMarginMeters: 200
    },
    emergencyProvider: {
      phone: '8122566828',
      formattedPhone: '+91 81225 66828',
      role: 'Designated Maritime Safety Officer / Coastal Response Team'
    },
    safetyStations: REGISTERED_SAFETY_STATIONS,
    isSimulation: true,
    disclaimer: 'SIMULATION MODE: Simulated alerts and early warnings only. Not connected to live defense transponders.'
  });
});

/**
 * GET /api/simulation/alerts
 * Returns recorded simulation alerts and their acknowledgement history
 */
router.get('/alerts', (req, res) => {
  try {
    const alerts = db.get('simulation_alerts') || [];
    res.json({
      success: true,
      total: alerts.length,
      alerts: Array.isArray(alerts) ? alerts : []
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/simulation/alerts
 * Logs a new geofence event (Warning, Critical, Recovery)
 */
router.post('/alerts', (req, res) => {
  const {
    vesselId = 'IND-TN-10-MM-4421',
    captain = 'K. Rameshan',
    lat,
    lng,
    distanceToImblKm,
    distanceToImblNM,
    riskStatus = 'EARLY_WARNING',
    heading = '090° E',
    speedKnots = 10,
    note = ''
  } = req.body;

  if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid coordinates provided for simulation alert'
    });
  }

  const now = new Date();
  const alertId = `SIM-ALERT-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const newAlert = {
    id: alertId,
    timestamp: now.toISOString(),
    displayTime: now.toLocaleTimeString(),
    vesselId,
    captain,
    lat: parseFloat(lat.toFixed(5)),
    lng: parseFloat(lng.toFixed(5)),
    coords: `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`,
    distanceToImblKm: typeof distanceToImblKm === 'number' ? parseFloat(distanceToImblKm.toFixed(2)) : 0,
    distanceToImblNM: typeof distanceToImblNM === 'number' ? parseFloat(distanceToImblNM.toFixed(2)) : 0,
    riskStatus, // 'SAFE_RECOVERY' | 'EARLY_WARNING' | 'CRITICAL_PROXIMITY' | 'CRITICAL_BREACH'
    heading,
    speedKnots,
    note,
    acknowledged: false,
    acknowledgedBy: null,
    acknowledgedAt: null,
    responseAction: null,
    isMockSimulation: true
  };

  try {
    db.insert('simulation_alerts', newAlert);
    res.json({
      success: true,
      message: 'Simulation event recorded in audit database',
      alert: newAlert
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PATCH /api/simulation/alerts/:id/ack
 * Safety officer acknowledges an alert and logs response status
 */
router.patch('/alerts/:id/ack', (req, res) => {
  const { id } = req.params;
  const {
    officerName = 'Inspector S. Vignesh (Duty Officer)',
    responseAction = 'Course correction advisory issued via VHF Ch 16',
    notes = 'Alert acknowledged by coastal safety station.'
  } = req.body;

  try {
    const alerts = db.get('simulation_alerts') || [];
    let updatedAlert = null;

    db.update(
      'simulation_alerts',
      (item) => item.id === id,
      (item) => {
        updatedAlert = {
          ...item,
          acknowledged: true,
          acknowledgedAt: new Date().toISOString(),
          acknowledgedBy: officerName,
          responseAction,
          officerNotes: notes
        };
        return updatedAlert;
      }
    );

    if (!updatedAlert) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }

    res.json({
      success: true,
      message: 'Alert response status successfully recorded',
      alert: updatedAlert
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/simulation/emergency-call
 * Generates mock emergency call receipt and logs intent without placing real external calls
 */
router.post('/emergency-call', (req, res) => {
  const {
    vesselId = 'IND-TN-10-MM-4421',
    coords = '09.2876° N, 79.3129° E',
    lat,
    lng,
    phone = '8122566828'
  } = req.body;

  const now = new Date();
  const receipt = {
    id: `SIM-CALL-${Date.now()}`,
    timestamp: now.toISOString(),
    displayTime: now.toLocaleTimeString(),
    vesselId,
    phone,
    dialLink: `tel:${phone}`,
    coords: coords || `${lat}° N, ${lng}° E`,
    status: 'SIMULATED_DIAL_TRIGGERED',
    note: 'Device dialer triggered. User confirmation required before line connection. No automated call dispatched.',
    isMock: true
  };

  res.json({
    success: true,
    message: 'Simulated emergency call confirmed. Dial link created for user approval.',
    receipt,
    emergencyPhone: '8122566828'
  });
});

/**
 * POST /api/simulation/reset
 * Clears simulation alert logs for a clean drill/demo
 */
router.post('/reset', (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, '..', '..', 'data', 'simulation_alerts.json');
    if (fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2), 'utf8');
    }
    res.json({ success: true, message: 'Simulation alert log reset successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
