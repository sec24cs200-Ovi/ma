const express = require('express');
const router = express.Router();

const PFZ_ZONES_DATA = {
  rameswaram: [
    {
      id: 'PFZ-RAM-01',
      name: 'Zone B – 12.4 Nautical Miles SSE',
      shortName: 'Zone B',
      coords: [9.1500, 79.4200],
      coordsFormatted: "9°09'00\" N, 79°25'12\" E",
      locationDesc: 'Gulf of Mannar, 12.4 NM South-Southeast of Rameswaram Harbor',
      sector: 'Sector SSE-2 (Southern Offshore)',
      status: 'High Potential',
      score: '94%',
      sst: '28.3°C',
      chl: '3.1 mg/m³',
      wind: '12 km/h SW',
      waveSwell: '0.8 m',
      species: ['Yellowfin Tuna', 'Indian Mackerel', 'Oil Sardine'],
      color: '#10b981',
      depth: '24 - 38 meters',
      imblClearance: '4.8 NM West of Indo-Sri Lanka IMBL (Safe Clearance)',
      imblClearanceKm: 8.9,
      heading: '158° SSE',
      distanceNM: 12.4,
      transitSpeed: '10 knots',
      transitTime: '1 hr 14 mins',
      fuelEstimate: '19.8 Litres (Diesel)',
      safetyStatus: '100% CLEAR - SAFE TO SAIL',
      waypoints: [
        { name: 'WP0: Rameswaram Jetty Fairway Buoy', coords: [9.2876, 79.3129], note: 'Depart harbor channel, steer heading 150°' },
        { name: 'WP1: Mandapam South Shoal Clearance', coords: [9.2200, 79.3600], note: 'Clear shallow coral bank by 1.2 NM, steer 158°' },
        { name: 'WP2: Zone B Center Arrival', coords: [9.1500, 79.4200], note: 'Arrive at thermal gradient plume, begin net deployment' }
      ],
      advisory: 'Optimal thermal chlorophyll convergence. Keep safe clearance from the southern coral shoals.'
    },
    {
      id: 'PFZ-RAM-02',
      name: 'Zone A – 8.1 Nautical Miles East',
      shortName: 'Zone A',
      coords: [9.3200, 79.4500],
      coordsFormatted: "9°19'12\" N, 79°27'00\" E",
      locationDesc: 'Palk Bay Eastern Fairway, 8.1 NM East of Rameswaram Harbor',
      sector: 'Sector East-1 (Palk Strait Inshore)',
      status: 'High Potential',
      score: '89%',
      sst: '28.1°C',
      chl: '2.8 mg/m³',
      wind: '11 km/h SW',
      waveSwell: '0.6 m',
      species: ['Seerfish (Vanjaram)', 'Anchovies', 'Tiger Prawns'],
      color: '#10b981',
      depth: '18 - 26 meters',
      imblClearance: '3.6 NM West of IMBL Border (Buffer Active)',
      imblClearanceKm: 6.7,
      heading: '085° E',
      distanceNM: 8.1,
      transitSpeed: '10 knots',
      transitTime: '49 mins',
      fuelEstimate: '13.2 Litres (Diesel)',
      safetyStatus: 'SAFE - MONITORED BORDER BUFFER',
      waypoints: [
        { name: 'WP0: Rameswaram Harbor Exit', coords: [9.2876, 79.3129], note: 'Steer eastwards clearing jetty breakwater' },
        { name: 'WP1: Dhanushkodi North Bank', coords: [9.3050, 79.3800], note: 'Maintain 085° true heading' },
        { name: 'WP2: Zone A PFZ Center', coords: [9.3200, 79.4500], note: 'Arrive at vanjaram feeding shelf' }
      ],
      advisory: 'Shallow sandbars on northern fringe. High concentration of seerfish and high-value tiger prawns.'
    },
    {
      id: 'PFZ-RAM-03',
      name: 'Zone C – 18.0 Nautical Miles SE',
      shortName: 'Zone C',
      coords: [9.1000, 79.5000],
      coordsFormatted: "9°06'00\" N, 79°30'00\" E",
      locationDesc: 'Outer Gulf Shelf, 18.0 NM Southeast of Rameswaram Harbor',
      sector: 'Sector SE-3 (Deep Shelf)',
      status: 'Moderate Potential',
      score: '76%',
      sst: '27.5°C',
      chl: '1.9 mg/m³',
      wind: '14 km/h SW',
      waveSwell: '1.1 m',
      species: ['Squid', 'Ribbonfish', 'Tuna'],
      color: '#f59e0b',
      depth: '40 - 55 meters',
      imblClearance: '2.8 NM West of IMBL Border (Caution Zone)',
      imblClearanceKm: 5.2,
      heading: '135° SE',
      distanceNM: 18.0,
      transitSpeed: '10 knots',
      transitTime: '1 hr 48 mins',
      fuelEstimate: '28.5 Litres (Diesel)',
      safetyStatus: 'CAUTION - CLOSE TO BORDER BUFFER',
      waypoints: [
        { name: 'WP0: Rameswaram Jetty Fairway', coords: [9.2876, 79.3129], note: 'Depart south fairway' },
        { name: 'WP1: Mandapam South Outer', coords: [9.2000, 79.4000], note: 'Steer 135° SE into deep water' },
        { name: 'WP2: Zone C Center', coords: [9.1000, 79.5000], note: 'Deep bathymetric shelf reached' }
      ],
      advisory: 'Moderate sea swell. Deep sea squid schools active during night trawling.'
    },
    {
      id: 'PFZ-RAM-04',
      name: 'Zone D – 25.2 Nautical Miles E (Restricted)',
      shortName: 'Zone D',
      coords: [9.2200, 79.6200],
      coordsFormatted: "9°13'12\" N, 79°37'12\" E",
      locationDesc: 'Near Indo-Sri Lanka International Maritime Boundary Line',
      sector: 'Sector Restricted (IMBL Border)',
      status: 'Unsafe (IMBL Proximity)',
      score: '12%',
      sst: '28.8°C',
      chl: '3.4 mg/m³',
      wind: '16 km/h SW',
      waveSwell: '1.4 m',
      species: ['Avoid - Border Area'],
      color: '#ef4444',
      depth: 'Border Shoal (15 - 22m)',
      imblClearance: '0.4 NM FROM IMBL (HIGH GEOFENCE ALERT)',
      imblClearanceKm: 0.7,
      heading: '102° ESE',
      distanceNM: 25.2,
      transitSpeed: '10 knots',
      transitTime: '2 hrs 31 mins',
      fuelEstimate: '41.0 Litres (Diesel)',
      safetyStatus: 'RESTRICTED / NO-GO ZONE - HIGH ARREST RISK',
      waypoints: [
        { name: 'NO-GO CORRIDOR', coords: [9.2200, 79.6200], note: 'Vessel transponder will trigger Coast Guard alert' }
      ],
      advisory: 'DO NOT SAIL: Active Sri Lankan Navy patrolling area. Strict geofence violation alert triggered on NavIC.'
    }
  ],
  visakhapatnam: [
    {
      id: 'PFZ-VIZ-01',
      name: 'Vizag Deepsea Zone 1',
      shortName: 'Vizag Zone 1',
      coords: [17.5500, 83.3800],
      coordsFormatted: "17°33'00\" N, 83°22'48\" E",
      locationDesc: 'Bay of Bengal Deep Shelf, 14.8 NM SSE of Vizag Harbor',
      sector: 'Sector South-East Bay',
      status: 'High Potential',
      score: '92%',
      sst: '28.9°C',
      chl: '3.6 mg/m³',
      wind: '9 km/h E',
      waveSwell: '0.7 m',
      species: ['Skipjack Tuna', 'King Prawns', 'Yellowfin'],
      color: '#10b981',
      depth: '60 - 90 meters',
      imblClearance: 'Clear Commercial Corridor (Safe)',
      imblClearanceKm: 12.0,
      heading: '142° SE',
      distanceNM: 14.8,
      transitSpeed: '10 knots',
      transitTime: '1 hr 29 mins',
      fuelEstimate: '23.6 Litres (Diesel)',
      safetyStatus: '100% CLEAR - EXCELLENT SEAS',
      waypoints: [
        { name: 'WP0: Vizag Outer Harbor', coords: [17.6868, 83.2185], note: 'Clear fairway navigation buoy' },
        { name: 'WP1: Dolphin Nose Deep Channel', coords: [17.6200, 83.2800], note: 'Steer 142° SE' },
        { name: 'WP2: Vizag Deepsea Zone 1', coords: [17.5500, 83.3800], note: 'Reach tuna concentration front' }
      ],
      advisory: 'Watch for deepsea shipping traffic. High density of skipjack tuna in the upper 30m column.'
    },
    {
      id: 'PFZ-VIZ-02',
      name: 'Gangavaram Outer',
      shortName: 'Gangavaram Outer',
      coords: [17.4800, 83.4200],
      coordsFormatted: "17°28'48\" N, 83°25'12\" E",
      locationDesc: 'Offshore Gangavaram Port, 18.2 NM South',
      sector: 'Sector Southern Shelf',
      status: 'Moderate Potential',
      score: '79%',
      sst: '28.4°C',
      chl: '2.1 mg/m³',
      wind: '10 km/h E',
      waveSwell: '0.9 m',
      species: ['Croaker', 'Snapper', 'Mackerel'],
      color: '#f59e0b',
      depth: '45 - 65 meters',
      imblClearance: 'Safe Coastal Shelf',
      imblClearanceKm: 15.0,
      heading: '155° SSE',
      distanceNM: 18.2,
      transitSpeed: '10 knots',
      transitTime: '1 hr 49 mins',
      fuelEstimate: '29.0 Litres (Diesel)',
      safetyStatus: 'SAFE - REGULAR PATROL',
      waypoints: [
        { name: 'WP0: Vizag Harbor Exit', coords: [17.6868, 83.2185], note: 'South transit corridor' },
        { name: 'WP1: Gangavaram Center', coords: [17.4800, 83.4200], note: 'Target reached' }
      ],
      advisory: 'Steady sea currents. Suitable for longline bottom trawling.'
    }
  ],
  kochi: [
    {
      id: 'PFZ-KOC-01',
      name: 'Malabar Shelf Zone 3',
      shortName: 'Malabar Zone 3',
      coords: [9.8500, 76.0500],
      coordsFormatted: "9°51'00\" N, 76°03'00\" E",
      locationDesc: 'Arabian Sea Malabar Shelf, 13.9 NM WSW of Kochi Port',
      sector: 'Sector West Malabar',
      status: 'High Potential',
      score: '95%',
      sst: '27.9°C',
      chl: '4.2 mg/m³',
      wind: '14 km/h WNW',
      waveSwell: '1.0 m',
      species: ['Oil Sardine', 'Indian Mackerel', 'Squid'],
      color: '#10b981',
      depth: '30 - 50 meters',
      imblClearance: 'Safe Malabar EEZ Waters',
      imblClearanceKm: 25.0,
      heading: '240° WSW',
      distanceNM: 13.9,
      transitSpeed: '10 knots',
      transitTime: '1 hr 23 mins',
      fuelEstimate: '22.1 Litres (Diesel)',
      safetyStatus: '100% CLEAR - PRIME HARVEST',
      waypoints: [
        { name: 'WP0: Fort Kochi Harbor Exit', coords: [9.9312, 76.2673], note: 'Clear harbor mouth channel' },
        { name: 'WP1: Kochi Offshore Shelf', coords: [9.8900, 76.1500], note: 'Steer 240° WSW' },
        { name: 'WP2: Malabar Shelf Zone 3', coords: [9.8500, 76.0500], note: 'Heavy sardine shoaling active' }
      ],
      advisory: 'High chlorophyll bloom upwelling. High oil sardine schools near surface.'
    }
  ],
  veraval: [
    {
      id: 'PFZ-VER-01',
      name: 'Saurashtra Bank A',
      shortName: 'Saurashtra Bank',
      coords: [20.7800, 70.2500],
      coordsFormatted: "20°46'48\" N, 70°15'00\" E",
      locationDesc: 'Saurashtra Coastal Shelf, 10.2 NM SW of Veraval Port',
      sector: 'Sector South-West Bank',
      status: 'High Potential',
      score: '91%',
      sst: '28.2°C',
      chl: '3.5 mg/m³',
      wind: '16 km/h W',
      waveSwell: '1.2 m',
      species: ['Silver Pomfret', 'Ribbonfish', 'Croaker'],
      color: '#10b981',
      depth: '35 - 55 meters',
      imblClearance: 'Well clear of Pakistan Maritime Boundary (>45 NM)',
      imblClearanceKm: 85.0,
      heading: '220° SW',
      distanceNM: 10.2,
      transitSpeed: '10 knots',
      transitTime: '1 hr 01 mins',
      fuelEstimate: '16.3 Litres (Diesel)',
      safetyStatus: 'SAFE - REGIONAL FISHING BANK',
      waypoints: [
        { name: 'WP0: Veraval Old Port Fairway', coords: [20.9042, 70.3670], note: 'Exit breakwater' },
        { name: 'WP1: Saurashtra Inshore Buoy', coords: [20.8400, 70.3000], note: 'Steer 220° SW' },
        { name: 'WP2: Saurashtra Bank A', coords: [20.7800, 70.2500], note: 'Pomfret concentration zone' }
      ],
      advisory: 'High market value Silver Pomfret harvest zone. Moderate westerly swell.'
    }
  ],
  paradip: [
    {
      id: 'PFZ-PAR-01',
      name: 'Mahanadi Plume Zone',
      shortName: 'Mahanadi Plume',
      coords: [20.2000, 86.7500],
      coordsFormatted: "20°12'00\" N, 86°45'00\" E",
      locationDesc: 'Mahanadi River Estuarine Plume, 10.8 NM SE of Paradip Port',
      sector: 'Sector Mahanadi Delta',
      status: 'High Potential',
      score: '95%',
      sst: '29.0°C',
      chl: '4.5 mg/m³',
      wind: '11 km/h SE',
      waveSwell: '0.8 m',
      species: ['Hilsa', 'Prawns', 'Threadfin Bream'],
      color: '#10b981',
      depth: '25 - 40 meters',
      imblClearance: 'Safe Bay of Bengal Coastal Zone',
      imblClearanceKm: 40.0,
      heading: '138° SE',
      distanceNM: 10.8,
      transitSpeed: '10 knots',
      transitTime: '1 hr 05 mins',
      fuelEstimate: '17.2 Litres (Diesel)',
      safetyStatus: '100% CLEAR - EXCELLENT CATCH',
      waypoints: [
        { name: 'WP0: Paradip Fishing Harbor', coords: [20.3164, 86.6114], note: 'Exit harbor channel' },
        { name: 'WP1: Mahanadi Estuary Fairway', coords: [20.2600, 86.6800], note: 'Steer 138° SE' },
        { name: 'WP2: Plume Zone Center', coords: [20.2000, 86.7500], note: 'Hilsa feeding area reached' }
      ],
      advisory: 'Nutrient-rich river plume attracting massive schools of prized Hilsa fish.'
    }
  ]
};

/**
 * GET /api/pfz/zones
 * Returns potential fishing zones by region
 */
router.get('/zones', (req, res) => {
  const region = (req.query.region || 'rameswaram').toLowerCase();
  const zones = PFZ_ZONES_DATA[region] || PFZ_ZONES_DATA.rameswaram;

  res.json({
    success: true,
    region,
    total: zones.length,
    zones,
    source: 'ISRO OceanSat-3 OCM-3 & INCOIS Marine Fishery Advisory'
  });
});

module.exports = router;
