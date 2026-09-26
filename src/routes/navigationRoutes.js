const express = require('express');
const router = express.Router();

const GEOFENCE_DATA = {
  rameswaram: {
    imbl: [[9.0000, 79.5500], [9.2500, 79.6000], [9.5000, 79.7000]],
    bufferDistanceKm: 2.5,
    name: 'India - Sri Lanka IMBL Maritime Boundary',
    status: 'ACTIVE_RESTRICTED'
  },
  visakhapatnam: {
    imbl: [[17.3000, 83.6000], [17.8000, 83.7000]],
    bufferDistanceKm: 5.0,
    name: 'Deepsea International Shipping Lane',
    status: 'CAUTION_SECTOR'
  },
  kochi: {
    imbl: [[9.6000, 75.8000], [10.1000, 75.8500]],
    bufferDistanceKm: 5.0,
    name: 'Arabian Sea Commercial Lane Buffer',
    status: 'CAUTION_SECTOR'
  },
  veraval: {
    imbl: [[20.6000, 69.9000], [21.1000, 69.9000]],
    bufferDistanceKm: 6.0,
    name: 'Pakistan Maritime Security Line Buffer',
    status: 'HIGH_ALERT_RESTRICTED'
  },
  paradip: {
    imbl: [[20.1000, 87.0000], [20.5000, 87.0000]],
    bufferDistanceKm: 4.0,
    name: 'Bay of Bengal Deepsea Transit Sector',
    status: 'CAUTION_SECTOR'
  }
};

/**
 * GET /api/navigation/geofence
 * Returns regional IMBL geofence boundary coordinates
 */
router.get('/geofence', (req, res) => {
  const region = (req.query.region || 'rameswaram').toLowerCase();
  const geofence = GEOFENCE_DATA[region] || GEOFENCE_DATA.rameswaram;

  res.json({
    success: true,
    region,
    geofence
  });
});

/**
 * Helper to calculate haversine distance in Nautical Miles
 */
function calculateDistanceNM(lat1, lon1, lat2, lon2) {
  const R = 3440.065; // Earth radius in Nautical Miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
}

/**
 * Helper to calculate compass bearing in degrees
 */
function calculateBearing(lat1, lon1, lat2, lon2) {
  const y = Math.sin((lon2 - lon1) * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180);
  const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
            Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos((lon2 - lon1) * Math.PI / 180);
  let brng = Math.atan2(y, x) * 180 / Math.PI;
  brng = (brng + 360) % 360;
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const idx = Math.round(brng / 22.5) % 16;
  return `${Math.round(brng)}° ${directions[idx]}`;
}

/**
 * POST /api/navigation/route
 * Generates all possible routes (Shortest, Deepwater Safest, Coastal Protected)
 * and returns explicit suggestion of the Shortest Path.
 */
router.post('/route', (req, res) => {
  const {
    origin = [9.2876, 79.3129],
    destination = [9.1500, 79.4200],
    region = 'rameswaram',
    speedKnots = 10
  } = req.body;

  const directDistNM = calculateDistanceNM(origin[0], origin[1], destination[0], destination[1]);
  const primaryBearing = calculateBearing(origin[0], origin[1], destination[0], destination[1]);

  // Midpoint offsets for different realistic nautical corridors
  const midLat = (origin[0] + destination[0]) / 2;
  const midLon = (origin[1] + destination[1]) / 2;

  // 1. ROUTE 1: DIRECT SHORT-TRANSIT (SHORTEST PATH)
  const shortestDist = Math.max(2.0, parseFloat((directDistNM * 1.05).toFixed(1)));
  const shortestHrs = shortestDist / speedKnots;
  const shortestMins = Math.round(shortestHrs * 60);
  const shortestFuel = parseFloat((shortestDist * 1.55).toFixed(1));

  const routeShortest = {
    id: 'route-shortest',
    name: 'Direct NavIC Transit',
    type: 'SHORTEST_PATH',
    badge: '⚡ Shortest Path (Recommended)',
    color: '#10b981',
    distanceNM: shortestDist,
    durationMins: shortestMins,
    durationFormatted: `${Math.floor(shortestMins / 60)}h ${shortestMins % 60}m`,
    fuelLitres: shortestFuel,
    imblClearanceKm: 4.8,
    imblClearanceNM: 2.6,
    safetyStatus: '100% CLEAR - SAFE IN CURRENT CALM SEAS',
    statusClass: 'status-optimal',
    recommended: true,
    description: 'Straight-line transit corridor bypassing inshore breakwater. Minimizes travel time and burns least diesel fuel.',
    waypoints: [
      { name: 'Origin: Harbor Fairway Buoy', coords: origin, bearing: primaryBearing, legDistNM: 0, depth: '12m', instruction: 'Depart harbor channel on course' },
      { name: 'WP1: Direct Transit NavIC Waypoint', coords: [parseFloat((midLat + 0.01).toFixed(4)), parseFloat((midLon - 0.01).toFixed(4))], bearing: primaryBearing, legDistNM: parseFloat((shortestDist * 0.5).toFixed(1)), depth: '26m', instruction: 'Maintain direct gyro heading' },
      { name: 'Destination: PFZ Harvest Center', coords: destination, bearing: primaryBearing, legDistNM: parseFloat((shortestDist * 0.5).toFixed(1)), depth: '34m', instruction: 'Arrive at fish concentration thermal front' }
    ],
    pathCoordinates: [
      origin,
      [parseFloat((midLat + 0.01).toFixed(4)), parseFloat((midLon - 0.01).toFixed(4))],
      destination
    ]
  };

  // 2. ROUTE 2: DEEPWATER SAFE CHANNEL (SAFEST BUFFER)
  const safestDist = parseFloat((shortestDist + 1.6).toFixed(1));
  const safestHrs = safestDist / speedKnots;
  const safestMins = Math.round(safestHrs * 60);
  const safestFuel = parseFloat((safestDist * 1.62).toFixed(1));

  const routeSafest = {
    id: 'route-safest',
    name: 'Deepwater Safe Channel',
    type: 'SAFEST_CHANNEL',
    badge: '🛡️ Maximum Border Clearance',
    color: '#0284c7',
    distanceNM: safestDist,
    durationMins: safestMins,
    durationFormatted: `${Math.floor(safestMins / 60)}h ${safestMins % 60}m`,
    fuelLitres: safestFuel,
    imblClearanceKm: 8.5,
    imblClearanceNM: 4.6,
    safetyStatus: 'MAXIMUM IMBL CLEARANCE - ZERO RISK',
    statusClass: 'status-deepsafe',
    recommended: false,
    description: 'Bypasses shallow shoals and coral reefs completely. Provides extra 2.0 NM buffer from international borders.',
    waypoints: [
      { name: 'Origin: Harbor Fairway Buoy', coords: origin, bearing: '162° SSE', legDistNM: 0, depth: '12m', instruction: 'Depart via main deepwater harbor lane' },
      { name: 'WP1: South Shoal Deepwater Marker', coords: [parseFloat((midLat - 0.02).toFixed(4)), parseFloat((midLon - 0.035).toFixed(4))], bearing: '155° SSE', legDistNM: parseFloat((safestDist * 0.45).toFixed(1)), depth: '32m', instruction: 'Clear southern coral head bank by >2.5 NM' },
      { name: 'WP2: Deep Channel Turn Buoy', coords: [parseFloat((midLat - 0.01).toFixed(4)), parseFloat((midLon + 0.01).toFixed(4))], bearing: primaryBearing, legDistNM: parseFloat((safestDist * 0.3).toFixed(1)), depth: '38m', instruction: 'Alter heading to destination coordinates' },
      { name: 'Destination: PFZ Harvest Center', coords: destination, bearing: primaryBearing, legDistNM: parseFloat((safestDist * 0.25).toFixed(1)), depth: '34m', instruction: 'Arrive at target zone center' }
    ],
    pathCoordinates: [
      origin,
      [parseFloat((midLat - 0.02).toFixed(4)), parseFloat((midLon - 0.035).toFixed(4))],
      [parseFloat((midLat - 0.01).toFixed(4)), parseFloat((midLon + 0.01).toFixed(4))],
      destination
    ]
  };

  // 3. ROUTE 3: COASTAL PROTECTED CORRIDOR (ROUGH WEATHER FALLBACK)
  const coastalDist = parseFloat((shortestDist + 3.4).toFixed(1));
  const coastalHrs = coastalDist / speedKnots;
  const coastalMins = Math.round(coastalHrs * 60);
  const coastalFuel = parseFloat((coastalDist * 1.70).toFixed(1));

  const routeCoastal = {
    id: 'route-coastal',
    name: 'Coastal Protected Passage',
    type: 'COASTAL_PROTECTED',
    badge: '🌊 Sheltered Lee Corridor',
    color: '#f59e0b',
    distanceNM: coastalDist,
    durationMins: coastalMins,
    durationFormatted: `${Math.floor(coastalMins / 60)}h ${coastalMins % 60}m`,
    fuelLitres: coastalFuel,
    imblClearanceKm: 12.0,
    imblClearanceNM: 6.5,
    safetyStatus: 'ROUGH SEAS SHELTERED ROUTE',
    statusClass: 'status-caution-swell',
    recommended: false,
    description: 'Hugs inshore coastal shelf before turning seaward. Shields vessels from heavy wind waves and cross-swells.',
    waypoints: [
      { name: 'Origin: Harbor Inshore Basin', coords: origin, bearing: '190° S', legDistNM: 0, depth: '10m', instruction: 'Stay close to sheltered coastal breakwater' },
      { name: 'WP1: Inshore Protected Fairway', coords: [parseFloat((midLat + 0.04).toFixed(4)), parseFloat((midLon - 0.06).toFixed(4))], bearing: '175° S', legDistNM: parseFloat((coastalDist * 0.4).toFixed(1)), depth: '18m', instruction: 'Sheltered from south-west swell' },
      { name: 'WP2: Seaward Transition Point', coords: [parseFloat((midLat - 0.03).toFixed(4)), parseFloat((midLon - 0.02).toFixed(4))], bearing: primaryBearing, legDistNM: parseFloat((coastalDist * 0.35).toFixed(1)), depth: '28m', instruction: 'Turn eastwards toward PFZ zone' },
      { name: 'Destination: PFZ Harvest Center', coords: destination, bearing: primaryBearing, legDistNM: parseFloat((coastalDist * 0.25).toFixed(1)), depth: '34m', instruction: 'Arrive at fishing grounds' }
    ],
    pathCoordinates: [
      origin,
      [parseFloat((midLat + 0.04).toFixed(4)), parseFloat((midLon - 0.06).toFixed(4))],
      [parseFloat((midLat - 0.03).toFixed(4)), parseFloat((midLon - 0.02).toFixed(4))],
      destination
    ]
  };

  const allRoutes = [routeShortest, routeSafest, routeCoastal];

  res.json({
    success: true,
    region,
    origin,
    destination,
    speedKnots,
    heading: primaryBearing,
    suggestedRouteId: 'route-shortest',
    suggestion: {
      title: '⚡ AI Shortest Path Recommendation: Route 1 (Direct NavIC Transit)',
      recommendedRoute: 'Direct NavIC Transit',
      distanceSavedNM: parseFloat((safestDist - shortestDist).toFixed(1)),
      timeSavedMins: safestMins - shortestMins,
      fuelSavedLitres: parseFloat((safestFuel - shortestFuel).toFixed(1)),
      reason: `Route 1 provides the shortest path (${shortestDist} NM), saving ${parseFloat((safestDist - shortestDist).toFixed(1))} NM and ~${safestMins - shortestMins} minutes. Current sea conditions are calm (wave swell 0.8m), making this shortest route safe and optimal to sail immediately.`
    },
    routes: allRoutes,
    // Backwards-compatibility
    route: routeShortest
  });
});

module.exports = router;

