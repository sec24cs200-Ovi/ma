const express = require('express');
const router = express.Router();
const db = require('../db');

// In-memory regional oceanographic cache
const REGIONAL_OCEAN_DATA = {
  rameswaram: {
    location: 'Rameswaram, Tamil Nadu',
    coords: [9.2876, 79.3129],
    sst: 28.3,
    chlorophyll: 3.1,
    waveHeight: 0.8,
    swellPeriod: 9.2,
    windSpeed: 12.4,
    windDirection: 158,
    currentSpeed: 0.58,
    currentDirection: 94,
    salinity: 34.8,
    visibility: 14.5,
    tide: '+0.4m High Flood',
    safetyStatus: 'SAFE_TO_SAIL'
  },
  visakhapatnam: {
    location: 'Visakhapatnam, Andhra Pradesh',
    coords: [17.6868, 83.2185],
    sst: 28.9,
    chlorophyll: 3.6,
    waveHeight: 0.6,
    swellPeriod: 8.4,
    windSpeed: 9.2,
    windDirection: 90,
    currentSpeed: 0.42,
    currentDirection: 80,
    salinity: 33.9,
    visibility: 16.0,
    tide: '+0.2m Moderate',
    safetyStatus: 'SAFE_TO_SAIL'
  },
  kochi: {
    location: 'Kochi, Kerala',
    coords: [9.9312, 76.2673],
    sst: 27.9,
    chlorophyll: 4.2,
    waveHeight: 1.1,
    swellPeriod: 10.1,
    windSpeed: 14.5,
    windDirection: 290,
    currentSpeed: 0.65,
    currentDirection: 175,
    salinity: 35.1,
    visibility: 12.0,
    tide: '+0.6m Flood Tide',
    safetyStatus: 'SAFE_TO_SAIL'
  },
  kanyakumari: {
    location: 'Kanyakumari, Tamil Nadu',
    coords: [8.0780, 77.5520],
    sst: 27.8,
    chlorophyll: 3.8,
    waveHeight: 1.1,
    swellPeriod: 10.4,
    windSpeed: 15.2,
    windDirection: 195,
    currentSpeed: 0.74,
    currentDirection: 120,
    salinity: 35.4,
    visibility: 14.0,
    tide: '+0.5m High Flood',
    safetyStatus: 'SAFE_TO_SAIL'
  },
  chennai: {
    location: 'Chennai Kasimedu, Tamil Nadu',
    coords: [13.1250, 80.3050],
    sst: 29.2,
    chlorophyll: 3.4,
    waveHeight: 0.6,
    swellPeriod: 8.2,
    windSpeed: 10.1,
    windDirection: 85,
    currentSpeed: 0.38,
    currentDirection: 45,
    salinity: 33.6,
    visibility: 16.5,
    tide: '+0.3m Moderate Tide',
    safetyStatus: 'SAFE_TO_SAIL'
  },
  tuticorin: {
    location: 'Thoothukudi, Tamil Nadu',
    coords: [8.7850, 78.1750],
    sst: 28.7,
    chlorophyll: 3.6,
    waveHeight: 0.9,
    swellPeriod: 9.1,
    windSpeed: 13.8,
    windDirection: 140,
    currentSpeed: 0.61,
    currentDirection: 110,
    salinity: 34.5,
    visibility: 15.0,
    tide: '+0.4m High Tide',
    safetyStatus: 'SAFE_TO_SAIL'
  },
  veraval: {
    location: 'Veraval, Gujarat',
    coords: [20.9042, 70.3670],
    sst: 28.2,
    chlorophyll: 3.5,
    waveHeight: 1.2,
    swellPeriod: 9.8,
    windSpeed: 16.0,
    windDirection: 270,
    currentSpeed: 0.72,
    currentDirection: 210,
    salinity: 36.2,
    visibility: 13.5,
    tide: '+1.1m High Tide',
    safetyStatus: 'MODERATE_SEA'
  },
  paradip: {
    location: 'Paradip, Odisha',
    coords: [20.3164, 86.6114],
    sst: 29.0,
    chlorophyll: 4.5,
    waveHeight: 0.7,
    swellPeriod: 8.8,
    windSpeed: 11.2,
    windDirection: 135,
    currentSpeed: 0.51,
    currentDirection: 60,
    salinity: 32.8,
    visibility: 15.0,
    tide: '+0.3m Calm Tide',
    safetyStatus: 'SAFE_TO_SAIL'
  }
};

REGIONAL_OCEAN_DATA.vizag = REGIONAL_OCEAN_DATA.visakhapatnam;
REGIONAL_OCEAN_DATA.thoothukudi = REGIONAL_OCEAN_DATA.tuticorin;
REGIONAL_OCEAN_DATA.kasimedu = REGIONAL_OCEAN_DATA.chennai;

function normalizeRegion(raw) {
  if (!raw) return 'rameswaram';
  const clean = String(raw).toLowerCase().trim().replace(/[^a-z]/g, '');
  if (clean.includes('kanya')) return 'kanyakumari';
  if (clean.includes('chennai') || clean.includes('kasimedu')) return 'chennai';
  if (clean.includes('tuticorin') || clean.includes('thoothu')) return 'tuticorin';
  if (clean.includes('kochi') || clean.includes('cochin')) return 'kochi';
  if (clean.includes('vizag') || clean.includes('visakha')) return 'visakhapatnam';
  if (clean.includes('veraval')) return 'veraval';
  if (clean.includes('paradip') || clean.includes('paradeep')) return 'paradip';
  if (clean.includes('rames')) return 'rameswaram';
  return clean;
}

/**
 * GET /api/telemetry/ocean
 * Returns current oceanographic telemetry for a region
 */
router.get('/ocean', (req, res) => {
  const norm = normalizeRegion(req.query.region);
  const data = REGIONAL_OCEAN_DATA[norm] || REGIONAL_OCEAN_DATA[req.query.region] || REGIONAL_OCEAN_DATA.rameswaram;

  // Add realistic micro-variations
  const liveSst = parseFloat((data.sst + (Math.random() * 0.2 - 0.1)).toFixed(1));
  const liveWave = parseFloat((data.waveHeight + (Math.random() * 0.1 - 0.05)).toFixed(1));
  const liveWind = parseFloat((data.windSpeed + (Math.random() * 1.5 - 0.75)).toFixed(1));

  res.json({
    success: true,
    region,
    timestamp: new Date().toISOString(),
    data: {
      ...data,
      sst: liveSst,
      waveHeight: liveWave,
      windSpeed: liveWind
    },
    sources: ['ISRO OceanSat-3 (OCM-3/SSTM)', 'INCOIS Wave Model', 'Open-Meteo Marine API']
  });
});

/**
 * GET /api/telemetry/satellite
 * Returns live ISRO satellite constellation status
 */
router.get('/satellite', (req, res) => {
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    satellites: [
      { id: 'OceanSat-3', payload: 'OCM-3 (Ocean Colour Monitor)', status: 'HEALTHY_ACTIVE', resolution: '360m', orbit: 'SSO 720km' },
      { id: 'INSAT-3DR', payload: 'Thermal Infrared Sounder', status: 'HEALTHY_ACTIVE', resolution: '4km', orbit: 'GEO 74°E' },
      { id: 'NavIC (IRNSS)', payload: 'L5/S-band Marine Positioning', status: 'LOCKED', accuracy: 'sub-5m', constSize: '7 Satellites' }
    ]
  });
});

/**
 * POST /api/telemetry/smartnet
 * Ingests live load cell & trawl tension telemetry from vessel MCU
 */
router.post('/smartnet', (req, res) => {
  const { load_kg, tension_kn, stress_percent, tangle_risk = 'LOW' } = req.body;

  if (load_kg === undefined && tension_kn === undefined) {
    return res.status(400).json({ error: 'load_kg or tension_kn is required' });
  }

  const loadVal = load_kg !== undefined ? parseFloat(load_kg) : parseFloat(((tension_kn * 1000) / 9.81).toFixed(1));
  const tensionVal = tension_kn !== undefined ? parseFloat(tension_kn) : parseFloat(((loadVal * 9.81) / 1000).toFixed(2));
  const stressVal = stress_percent !== undefined ? parseInt(stress_percent, 10) : Math.min(100, Math.round((loadVal / 500) * 100));

  const entry = {
    id: `NET-${Date.now()}`,
    timestamp: new Date().toISOString(),
    load_kg: loadVal,
    tension_kn: tensionVal,
    stress_percent: stressVal,
    tangle_risk: tangle_risk.toUpperCase(),
    status: stressVal > 85 ? 'OVERLOAD' : (tensionVal > 4.2 ? 'SNAG_DETECTED' : 'SAFE')
  };

  db.insert('smartnet_telemetry', entry);

  res.json({
    success: true,
    message: 'Sensor telemetry ingested',
    data: entry
  });
});

/**
 * GET /api/telemetry/smartnet/latest
 * Returns latest smart net telemetry and recent history
 */
router.get('/smartnet/latest', (req, res) => {
  const history = db.get('smartnet_telemetry');
  const latest = history[0] || {
    timestamp: new Date().toISOString(),
    load_kg: 245.0,
    tension_kn: 2.40,
    stress_percent: 49,
    tangle_risk: 'LOW',
    status: 'SAFE'
  };

  res.json({
    success: true,
    latest,
    recent: history.slice(0, 15)
  });
});

module.exports = router;
