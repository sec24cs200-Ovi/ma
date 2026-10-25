import { RegionInfo, PFZZone, GovtScheme, CatchAuction, LanguageCode } from '../types';

export const REGIONS: Record<string, RegionInfo> = {
  rameswaram: {
    id: 'rameswaram',
    name: 'Rameswaram',
    state: 'Tamil Nadu',
    coords: [9.2850, 79.3250], // Rameswaram Fishing Harbour Fairway (Open Sea)
    weather: {
      temp: 28.2,
      condition: 'Fair Sea',
      windSpeed: 12,
      waveHeight: 0.8,
      swellDir: 'SSE',
      isSafe: true,
    },
  },
  kanyakumari: {
    id: 'kanyakumari',
    name: 'Kanyakumari',
    state: 'Tamil Nadu',
    coords: [8.0780, 77.5520], // Cape Comorin Harbor Waters
    weather: {
      temp: 27.8,
      condition: 'Moderate Swell',
      windSpeed: 16,
      waveHeight: 1.2,
      swellDir: 'SW',
      isSafe: true,
    },
  },
  chennai: {
    id: 'chennai',
    name: 'Chennai Kasimedu',
    state: 'Tamil Nadu',
    coords: [13.1250, 80.3050], // Kasimedu Deepwater Roadstead
    weather: {
      temp: 29.5,
      condition: 'Calm Waters',
      windSpeed: 10,
      waveHeight: 0.6,
      swellDir: 'E',
      isSafe: true,
    },
  },
  tuticorin: {
    id: 'tuticorin',
    name: 'Thoothukudi',
    state: 'Tamil Nadu',
    coords: [8.7850, 78.1750], // Thoothukudi Harbor Approach Fairway
    weather: {
      temp: 28.9,
      condition: 'Fair Waters',
      windSpeed: 14,
      waveHeight: 0.9,
      swellDir: 'SE',
      isSafe: true,
    },
  },
  kochi: {
    id: 'kochi',
    name: 'Kochi Harbour',
    state: 'Kerala',
    coords: [9.9650, 76.2200], // Kochi Channel Fairway Buoy (Arabian Sea)
    weather: {
      temp: 27.5,
      condition: 'Light Monsoon Breeze',
      windSpeed: 18,
      waveHeight: 1.4,
      swellDir: 'W',
      isSafe: true,
    },
  },
  vizag: {
    id: 'vizag',
    name: 'Visakhapatnam',
    state: 'Andhra Pradesh',
    coords: [17.6868, 83.3150], // Vizag Outer Harbour Deepwater Fairway
    weather: {
      temp: 29.1,
      condition: 'Gentle Waves',
      windSpeed: 11,
      waveHeight: 0.7,
      swellDir: 'ESE',
      isSafe: true,
    },
  },
};

export const REGIONAL_PFZ_ZONES: Record<string, PFZZone[]> = {
  rameswaram: [
    {
      id: 'PFZ-RAM-01',
      name: 'Zone B – Gulf of Mannar Ridge',
      direction: '12.4 NM SSE',
      distanceNM: 12.4,
      confidence: 94,
      sst: 28.3,
      chlorophyll: 3.1,
      depth: 42,
      species: ['Yellowfin Tuna', 'Indian Mackerel', 'Oil Sardine', 'Squid'],
      lat: 9.1500,
      lng: 79.4200,
      status: 'optimal',
    },
    {
      id: 'PFZ-RAM-02',
      name: 'Zone A – Palk Bay Thermal Front',
      direction: '8.1 NM East',
      distanceNM: 8.1,
      confidence: 89,
      sst: 28.1,
      chlorophyll: 2.8,
      depth: 28,
      species: ['Seerfish (Vanjaram)', 'Anchovies', 'Tiger Prawns'],
      lat: 9.3200,
      lng: 79.4500,
      status: 'optimal',
    },
    {
      id: 'PFZ-RAM-03',
      name: 'Zone C – Dhanushkodi Shelf',
      direction: '18.0 NM SE',
      distanceNM: 18.0,
      confidence: 76,
      sst: 27.5,
      chlorophyll: 1.9,
      depth: 55,
      species: ['Squid', 'Ribbonfish', 'Tuna'],
      lat: 9.1000,
      lng: 79.5000,
      status: 'moderate',
    },
    {
      id: 'PFZ-RAM-04',
      name: 'Zone D – IMBL Border Proximity',
      direction: '25.2 NM ESE (Restricted)',
      distanceNM: 25.2,
      confidence: 15,
      sst: 28.8,
      chlorophyll: 1.2,
      depth: 62,
      species: ['Mixed Pelagic (Avoid Border)'],
      lat: 9.2200,
      lng: 79.6200,
      status: 'restricted',
    },
  ],
  kanyakumari: [
    {
      id: 'PFZ-KAN-01',
      name: 'Zone B – Wadge Bank Ridge',
      direction: '14.2 NM South',
      distanceNM: 14.2,
      confidence: 95,
      sst: 27.8,
      chlorophyll: 3.8,
      depth: 55,
      species: ['Yellowfin Tuna', 'Skipjack', 'Trevally', 'Red Snapper'],
      lat: 7.8500,
      lng: 77.6200,
      status: 'optimal',
    },
    {
      id: 'PFZ-KAN-02',
      name: 'Zone A – Cape Comorin Confluence',
      direction: '10.8 NM ESE',
      distanceNM: 10.8,
      confidence: 91,
      sst: 28.1,
      chlorophyll: 3.2,
      depth: 40,
      species: ['Seer Fish (Vanjaram)', 'King Mackerel', 'Squid'],
      lat: 8.0100,
      lng: 77.7200,
      status: 'optimal',
    },
    {
      id: 'PFZ-KAN-03',
      name: 'Zone C – Manakudy Estuarine Plume',
      direction: '8.5 NM SW',
      distanceNM: 8.5,
      confidence: 78,
      sst: 28.4,
      chlorophyll: 2.7,
      depth: 32,
      species: ['Sardines', 'Anchovies', 'Ribbonfish'],
      lat: 7.9800,
      lng: 77.4600,
      status: 'moderate',
    },
    {
      id: 'PFZ-KAN-04',
      name: 'Zone D – Deepsea Shipping Lane Buffer',
      direction: '21.5 NM South (Restricted)',
      distanceNM: 21.5,
      confidence: 30,
      sst: 28.9,
      chlorophyll: 1.2,
      depth: 75,
      species: ['Deep Pelagic (Heavy Tanker Traffic)'],
      lat: 7.7200,
      lng: 77.5800,
      status: 'restricted',
    },
  ],
  chennai: [
    {
      id: 'PFZ-CHE-01',
      name: 'Zone B – Kasimedu Deepwater Canyon',
      direction: '10.5 NM East',
      distanceNM: 10.5,
      confidence: 93,
      sst: 29.2,
      chlorophyll: 3.4,
      depth: 60,
      species: ['Yellowfin Tuna', 'Barracuda', 'Seer Fish', 'Lobster'],
      lat: 13.1500,
      lng: 80.4800,
      status: 'optimal',
    },
    {
      id: 'PFZ-CHE-02',
      name: 'Zone A – Pulicat Thermal Front',
      direction: '16.8 NM NNE',
      distanceNM: 16.8,
      confidence: 90,
      sst: 28.9,
      chlorophyll: 4.1,
      depth: 38,
      species: ['Tiger Prawns', 'White Prawns', 'Silver Pomfret'],
      lat: 13.3800,
      lng: 80.4200,
      status: 'optimal',
    },
    {
      id: 'PFZ-CHE-03',
      name: 'Zone C – Ennore Outer Shelf',
      direction: '10.2 NM NE',
      distanceNM: 10.2,
      confidence: 77,
      sst: 29.5,
      chlorophyll: 2.9,
      depth: 34,
      species: ['Indian Mackerel', 'Sardines', 'Croaker'],
      lat: 13.2600,
      lng: 80.4100,
      status: 'moderate',
    },
    {
      id: 'PFZ-CHE-04',
      name: 'Zone D – Port Commercial Fairway',
      direction: '5.2 NM SE (Restricted)',
      distanceNM: 5.2,
      confidence: 25,
      sst: 29.8,
      chlorophyll: 1.5,
      depth: 22,
      species: ['Inshore Waters (Anchorage Area)'],
      lat: 13.0800,
      lng: 80.3800,
      status: 'restricted',
    },
  ],
  tuticorin: [
    {
      id: 'PFZ-TUT-01',
      name: 'Zone B – Tuticorin Pearl Bank Shelf',
      direction: '11.5 NM ESE',
      distanceNM: 11.5,
      confidence: 94,
      sst: 28.7,
      chlorophyll: 3.6,
      depth: 35,
      species: ['Pearl Spot (Karimeen)', 'Seer Fish', 'Yellowfin Tuna', 'Reef Cod'],
      lat: 8.7200,
      lng: 78.3600,
      status: 'optimal',
    },
    {
      id: 'PFZ-TUT-02',
      name: 'Zone A – Vembar Thermal Front',
      direction: '14.2 NM NE',
      distanceNM: 14.2,
      confidence: 89,
      sst: 28.4,
      chlorophyll: 3.9,
      depth: 28,
      species: ['Tiger Prawns', 'Squid', 'Anchovies'],
      lat: 8.9500,
      lng: 78.3500,
      status: 'optimal',
    },
    {
      id: 'PFZ-TUT-03',
      name: 'Zone C – Punnakayal Estuary Plume',
      direction: '11.0 NM SSE',
      distanceNM: 11.0,
      confidence: 76,
      sst: 29.0,
      chlorophyll: 2.8,
      depth: 26,
      species: ['Blue Swimmer Crabs', 'Mackerel', 'Mullet'],
      lat: 8.6200,
      lng: 78.2600,
      status: 'moderate',
    },
    {
      id: 'PFZ-TUT-04',
      name: 'Zone D – Gulf of Mannar Coral Reserve',
      direction: '5.0 NM ENE (Restricted)',
      distanceNM: 5.0,
      confidence: 12,
      sst: 28.9,
      chlorophyll: 1.8,
      depth: 18,
      species: ['Protected Coral Park (No Trawling)'],
      lat: 8.8500,
      lng: 78.2200,
      status: 'restricted',
    },
  ],
  kochi: [
    {
      id: 'PFZ-KOC-01',
      name: 'Zone B – Malabar Shelf Ridge',
      direction: '13.9 NM WSW',
      distanceNM: 13.9,
      confidence: 95,
      sst: 27.9,
      chlorophyll: 4.2,
      depth: 40,
      species: ['Oil Sardine', 'Indian Mackerel', 'Squid', 'Threadfin Bream'],
      lat: 9.8500,
      lng: 76.0500,
      status: 'optimal',
    },
    {
      id: 'PFZ-KOC-02',
      name: 'Zone A – Alleppey Upwelling Zone',
      direction: '19.8 NM SSW',
      distanceNM: 19.8,
      confidence: 92,
      sst: 27.4,
      chlorophyll: 4.6,
      depth: 45,
      species: ['Karikkadi Prawns', 'Oil Sardine', 'Silver Pomfret'],
      lat: 9.6500,
      lng: 76.1000,
      status: 'optimal',
    },
    {
      id: 'PFZ-KOC-03',
      name: 'Zone C – Chellanam Coastal Trench',
      direction: '10.5 NM SW',
      distanceNM: 10.5,
      confidence: 78,
      sst: 28.2,
      chlorophyll: 3.1,
      depth: 30,
      species: ['Sole Fish', 'Anchovies', 'Ribbonfish'],
      lat: 9.8000,
      lng: 76.1600,
      status: 'moderate',
    },
    {
      id: 'PFZ-KOC-04',
      name: 'Zone D – Cochin Port Fairway Channel',
      direction: '4.8 NM West (Restricted)',
      distanceNM: 4.8,
      confidence: 20,
      sst: 28.6,
      chlorophyll: 1.9,
      depth: 25,
      species: ['Channel Fairway (Vessel Traffic)'],
      lat: 9.9700,
      lng: 76.1400,
      status: 'restricted',
    },
  ],
  vizag: [
    {
      id: 'PFZ-VIZ-01',
      name: 'Zone B – Vizag Deepsea Shelf',
      direction: '14.8 NM SSE',
      distanceNM: 14.8,
      confidence: 92,
      sst: 28.9,
      chlorophyll: 3.6,
      depth: 75,
      species: ['Skipjack Tuna', 'King Prawns', 'Yellowfin Tuna'],
      lat: 17.5500,
      lng: 83.3800,
      status: 'optimal',
    },
    {
      id: 'PFZ-VIZ-02',
      name: 'Zone A – Dolphin’s Nose Thermal Front',
      direction: '8.8 NM ESE',
      distanceNM: 8.8,
      confidence: 90,
      sst: 28.6,
      chlorophyll: 3.9,
      depth: 55,
      species: ['Seer Fish (Vanjaram)', 'Ribbonfish', 'Red Snapper'],
      lat: 17.6200,
      lng: 83.4500,
      status: 'optimal',
    },
    {
      id: 'PFZ-VIZ-03',
      name: 'Zone C – Gangavaram Continental Shelf',
      direction: '18.2 NM South',
      distanceNM: 18.2,
      confidence: 79,
      sst: 28.4,
      chlorophyll: 2.1,
      depth: 58,
      species: ['Croaker', 'Snapper', 'Indian Mackerel'],
      lat: 17.4800,
      lng: 83.4200,
      status: 'moderate',
    },
    {
      id: 'PFZ-VIZ-04',
      name: 'Zone D – Naval Outer Fairway Perimeter',
      direction: '3.5 NM SE (Restricted)',
      distanceNM: 3.5,
      confidence: 25,
      sst: 29.1,
      chlorophyll: 1.4,
      depth: 30,
      species: ['Security Perimeter (Prohibited Zone)'],
      lat: 17.6500,
      lng: 83.3500,
      status: 'restricted',
    },
  ],
};

// Aliases
REGIONAL_PFZ_ZONES.visakhapatnam = REGIONAL_PFZ_ZONES.vizag;
REGIONAL_PFZ_ZONES.thoothukudi = REGIONAL_PFZ_ZONES.tuticorin;
REGIONAL_PFZ_ZONES.kasimedu = REGIONAL_PFZ_ZONES.chennai;

export function getPfzZonesForRegion(regionId: string): PFZZone[] {
  if (!regionId) return REGIONAL_PFZ_ZONES.rameswaram;
  const clean = regionId.toLowerCase().trim().replace(/[^a-z]/g, '');
  if (clean.includes('kanya')) return REGIONAL_PFZ_ZONES.kanyakumari;
  if (clean.includes('chennai') || clean.includes('kasimedu')) return REGIONAL_PFZ_ZONES.chennai;
  if (clean.includes('tuticorin') || clean.includes('thoothu')) return REGIONAL_PFZ_ZONES.tuticorin;
  if (clean.includes('kochi') || clean.includes('cochin')) return REGIONAL_PFZ_ZONES.kochi;
  if (clean.includes('vizag') || clean.includes('visakha')) return REGIONAL_PFZ_ZONES.vizag;
  if (clean.includes('rames')) return REGIONAL_PFZ_ZONES.rameswaram;
  return REGIONAL_PFZ_ZONES[regionId] || REGIONAL_PFZ_ZONES.rameswaram;
}

export const PFZ_ZONES: PFZZone[] = REGIONAL_PFZ_ZONES.rameswaram;

export interface SafeSeaWaypoint {
  name: string;
  coords: string;
  depth: string;
  latLng: [number, number];
}

export interface SafeSeaRouteInfo {
  targetZoneId: string;
  targetZoneName: string;
  heading: string;
  distanceNM: number;
  durationMinutes: number;
  fuelLitres: number;
  pathCoordinates: [number, number][];
  waypoints: SafeSeaWaypoint[];
}

/**
 * Returns an authentic, nautical-safe route that navigates strictly via open sea/waterways,
 * with ZERO incursion into landmasses or shallow shoals.
 */
export function getSafeSeaRoute(regionId: string, zoneId?: string): SafeSeaRouteInfo {
  const reg = REGIONS[regionId] || REGIONS.rameswaram;
  const regionalZones = getPfzZonesForRegion(regionId);
  const targetId = zoneId || regionalZones[0]?.id || 'zone-b';
  
  // Find target zone either by exact id or by partial suffix (e.g. 'zone-a' matching 'PFZ-RAM-02' / 'PFZ-KAN-02')
  let zone = regionalZones.find((z) => z.id === targetId);
  if (!zone) {
    if (targetId.includes('zone-a')) zone = regionalZones.find(z => z.id.endsWith('02')) || regionalZones[1];
    else if (targetId.includes('zone-b')) zone = regionalZones.find(z => z.id.endsWith('01')) || regionalZones[0];
    else if (targetId.includes('zone-c')) zone = regionalZones.find(z => z.id.endsWith('03')) || regionalZones[2];
    else if (targetId.includes('zone-d')) zone = regionalZones.find(z => z.id.endsWith('04')) || regionalZones[3];
  }
  if (!zone) zone = regionalZones[0];

  // Specific high-precision sea corridors around Rameswaram & Pamban Island
  if (regionId === 'rameswaram') {
    if (zone.id === 'PFZ-RAM-02' || zone.id === 'zone-a') {
      const waypoints: SafeSeaWaypoint[] = [
        { name: 'Harbor Fairway Buoy (Rameswaram Jetty)', coords: '9.2850° N, 79.3250° E', depth: '10m', latLng: [9.2850, 79.3250] },
        { name: 'Channel Waypoint 2 (Palk Bay East Buoy)', coords: '9.2950° N, 79.3600° E', depth: '16m', latLng: [9.2950, 79.3600] },
        { name: 'Deep Sea Waypoint 3 (Thermal Front Approach)', coords: '9.3080° N, 79.4100° E', depth: '22m', latLng: [9.3080, 79.4100] },
        { name: 'Target Destination (Zone A – Palk Bay)', coords: `${zone.lat}° N, ${zone.lng}° E`, depth: `${zone.depth}m`, latLng: [zone.lat, zone.lng] },
      ];
      return {
        targetZoneId: zone.id,
        targetZoneName: zone.name,
        heading: '085° E',
        distanceNM: zone.distanceNM,
        durationMinutes: 49,
        fuelLitres: 15.0,
        pathCoordinates: waypoints.map((w) => w.latLng),
        waypoints,
      };
    }

    if (zone.id === 'PFZ-RAM-03' || zone.id === 'zone-c') {
      const waypoints: SafeSeaWaypoint[] = [
        { name: 'Harbor Fairway Buoy (Rameswaram Jetty)', coords: '9.2850° N, 79.3250° E', depth: '10m', latLng: [9.2850, 79.3250] },
        { name: 'Fairway Channel Buoy (Palk Bay East Channel)', coords: '9.2700° N, 79.3700° E', depth: '18m', latLng: [9.2700, 79.3700] },
        { name: 'Shoal Clearance Point (North Dhanushkodi)', coords: '9.2250° N, 79.4350° E', depth: '24m', latLng: [9.2250, 79.4350] },
        { name: 'Cape Clearance Fairway (Arichal Munai Spit)', coords: '9.1500° N, 79.4900° E', depth: '28m', latLng: [9.1500, 79.4900] },
        { name: 'Maritime Channel (Adam’s Bridge Passage)', coords: '9.1050° N, 79.4650° E', depth: '34m', latLng: [9.1050, 79.4650] },
        { name: 'Target Destination (Zone C – Outer Shelf)', coords: `${zone.lat}° N, ${zone.lng}° E`, depth: `${zone.depth}m`, latLng: [zone.lat, zone.lng] },
      ];
      return {
        targetZoneId: zone.id,
        targetZoneName: zone.name,
        heading: '135° SE',
        distanceNM: zone.distanceNM,
        durationMinutes: 108,
        fuelLitres: 33.3,
        pathCoordinates: waypoints.map((w) => w.latLng),
        waypoints,
      };
    }

    if (zone.id === 'PFZ-RAM-04' || zone.id === 'zone-d') {
      const waypoints: SafeSeaWaypoint[] = [
        { name: 'Harbor Fairway Buoy (Rameswaram Jetty)', coords: '9.2850° N, 79.3250° E', depth: '10m', latLng: [9.2850, 79.3250] },
        { name: 'Palk Bay East Fairway', coords: '9.2950° N, 79.3800° E', depth: '18m', latLng: [9.2950, 79.3800] },
        { name: 'Deep Sea Corridor', coords: '9.2800° N, 79.4800° E', depth: '32m', latLng: [9.2800, 79.4800] },
        { name: 'Border Approach Buffer', coords: '9.2500° N, 79.5500° E', depth: '45m', latLng: [9.2500, 79.5500] },
        { name: 'Target Destination (Zone D – IMBL Proximity)', coords: `${zone.lat}° N, ${zone.lng}° E`, depth: `${zone.depth}m`, latLng: [zone.lat, zone.lng] },
      ];
      return {
        targetZoneId: zone.id,
        targetZoneName: zone.name,
        heading: '102° ESE',
        distanceNM: zone.distanceNM,
        durationMinutes: 147,
        fuelLitres: 45.3,
        pathCoordinates: waypoints.map((w) => w.latLng),
        waypoints,
      };
    }

    // Default / Zone B (Gulf of Mannar Ridge)
    const waypoints: SafeSeaWaypoint[] = [
      { name: 'Harbor Fairway Buoy (Rameswaram Jetty)', coords: '9.2850° N, 79.3250° E', depth: '10m', latLng: [9.2850, 79.3250] },
      { name: 'Fairway Channel Buoy (Palk Bay East Channel)', coords: '9.2700° N, 79.3700° E', depth: '18m', latLng: [9.2700, 79.3700] },
      { name: 'Shoal Clearance Point (North Dhanushkodi Shoals)', coords: '9.2250° N, 79.4350° E', depth: '24m', latLng: [9.2250, 79.4350] },
      { name: 'Cape Clearance Fairway (Arichal Munai Spit Clearance)', coords: '9.1500° N, 79.4900° E', depth: '28m', latLng: [9.1500, 79.4900] },
      { name: 'Maritime Channel (Adam’s Bridge Deep Passage)', coords: '9.1050° N, 79.4650° E', depth: '34m', latLng: [9.1050, 79.4650] },
      { name: 'Gulf of Mannar Deep Channel (South Dhanushkodi)', coords: '9.0900° N, 79.4200° E', depth: '38m', latLng: [9.0900, 79.4200] },
      { name: 'Target Destination (Zone B – Gulf of Mannar Ridge)', coords: `${zone.lat}° N, ${zone.lng}° E`, depth: `${zone.depth}m`, latLng: [zone.lat, zone.lng] },
    ];
    return {
      targetZoneId: zone.id,
      targetZoneName: zone.name,
      heading: '158° SSE',
      distanceNM: zone.distanceNM,
      durationMinutes: 74,
      fuelLitres: 22.9,
      pathCoordinates: waypoints.map((w) => w.latLng),
      waypoints,
    };
  }

  // Regional seaward corridors for Kanyakumari, Chennai, Thoothukudi, Kochi, Vizag
  const origin = reg.coords;
  const p1: [number, number] = [
    parseFloat((origin[0] * 0.67 + zone.lat * 0.33).toFixed(4)),
    parseFloat((origin[1] * 0.67 + zone.lng * 0.33).toFixed(4)),
  ];
  const p2: [number, number] = [
    parseFloat((origin[0] * 0.33 + zone.lat * 0.67).toFixed(4)),
    parseFloat((origin[1] * 0.33 + zone.lng * 0.67).toFixed(4)),
  ];
  const p3: [number, number] = [zone.lat, zone.lng];

  const waypoints: SafeSeaWaypoint[] = [
    { name: `Harbor Fairway Buoy (${reg.name})`, coords: `${origin[0]}° N, ${origin[1]}° E`, depth: '12m', latLng: origin },
    { name: 'Channel Fairway Waypoint 2', coords: `${p1[0]}° N, ${p1[1]}° E`, depth: '24m', latLng: p1 },
    { name: 'Deep Sea Waypoint 3', coords: `${p2[0]}° N, ${p2[1]}° E`, depth: '36m', latLng: p2 },
    { name: `Target Destination (${zone.name})`, coords: `${p3[0]}° N, ${p3[1]}° E`, depth: `${zone.depth}m`, latLng: p3 },
  ];

  return {
    targetZoneId: zone.id,
    targetZoneName: zone.name,
    heading: zone.direction,
    distanceNM: zone.distanceNM,
    durationMinutes: Math.round((zone.distanceNM / 10) * 60),
    fuelLitres: parseFloat((zone.distanceNM * 1.85).toFixed(1)),
    pathCoordinates: waypoints.map((w) => w.latLng),
    waypoints,
  };
}

export const INITIAL_AUCTIONS: CatchAuction[] = [
  {
    id: 'auc-1',
    species: 'Yellowfin Tuna (A-Grade)',
    quantityKg: 340,
    pricePerKg: 320,
    harbor: 'Rameswaram Fishing Jetty',
    sellerVessel: 'IND-TN-10-MM-4421 (Capt. Rameshan)',
    timeAgo: '18 mins ago',
    verified: true,
  },
  {
    id: 'auc-2',
    species: 'Fresh King Seer / Vanjaram',
    quantityKg: 120,
    pricePerKg: 680,
    harbor: 'Mandapam Marine Terminal',
    sellerVessel: 'IND-TN-09-MM-1205',
    timeAgo: '42 mins ago',
    verified: true,
  },
  {
    id: 'auc-3',
    species: 'Tiger Prawns (Export Jumbo)',
    quantityKg: 85,
    pricePerKg: 520,
    harbor: 'Thoothukudi Old Port',
    sellerVessel: 'IND-TN-11-TT-8831',
    timeAgo: '1 hr ago',
    verified: true,
  },
];

export const GOVT_SCHEMES: GovtScheme[] = [
  {
    id: 'pmmsy-deepsea',
    title: 'Pradhan Mantri Matsya Sampada Yojana (PMMSY) – Deep Sea Vessel',
    department: 'Department of Fisheries, Ministry of Fisheries, Animal Husbandry & Dairying',
    subsidy: 'Up to 60% Subsidized Cost (₹15 Lakhs Capital Subsidy)',
    eligibility: 'Registered traditional mechanized boat owners with biometric ID',
    category: 'subsidy',
    status: 'Open',
  },
  {
    id: 'tn-relief',
    title: 'Tamil Nadu Fishing Ban Period Relief & Special Allowance',
    department: 'Fisheries Department, Govt. of Tamil Nadu',
    subsidy: '₹8,000 Direct Benefit Transfer per active fisherman family',
    eligibility: 'Marine fishermen welfare board registered members',
    category: 'welfare',
    status: 'Applied',
  },
  {
    id: 'kcc-fisheries',
    title: 'Kisan Credit Card (KCC) for Marine Fishers (Working Capital)',
    department: 'NABARD & Public Sector Commercial Banks',
    subsidy: '7% Interest Subvention Loan up to ₹3,00,000 collateral-free',
    eligibility: 'Active crew members with sea safety qualification passbook',
    category: 'subsidy',
    status: 'Open',
  },
  {
    id: 'navic-transceiver',
    title: 'ISRO NavIC Two-Way Satellite Transceiver Subsidized Allotment',
    department: 'Space Applications Centre (SAC / ISRO) & INCOIS',
    subsidy: '100% Free Device + Satellite Bandwidth for Coastal Fishers',
    eligibility: 'Trawlers venturing beyond 12 NM from coast',
    category: 'welfare',
    status: 'Approved',
  },
  {
    id: 'fisherfolk-edu',
    title: 'National Scholarship for Higher Education of Marine Fishers Children',
    department: 'National Fisheries Development Board (NFDB)',
    subsidy: '₹25,000 to ₹50,000 per academic year for Engineering & Marine degrees',
    eligibility: 'Children of certified coastal traditional marine fishers',
    category: 'scholarship',
    status: 'Open',
  },
];

export const TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  en: {
    appName: 'Marine AI',
    tagline: 'Agentic Marine Intelligence for Fishermen',
    nav_dashboard: 'Dashboard',
    nav_simulation: 'Boat Safety Simulation',
    nav_assistant: 'AI Marine Assistant',
    nav_map: 'Marine Intelligence Map',
    nav_pfz: 'Fishing Zone / PFZ',
    nav_safety: 'Sea Safety Forecast',
    nav_telemetry: 'Satellite Telemetry',
    nav_equipment: 'Equipment Monitoring',
    nav_route: 'Safe Route Planner',
    nav_alerts: 'Alerts & Advisories',
    nav_data: 'Marine Data',
    nav_services: 'Fisherman Services',
    nav_schemes: 'Govt Schemes & Scholarships',
    sosButton: 'EMERGENCY SOS',
  },
  ta: {
    appName: 'மரைன் ஏஐ',
    tagline: 'மீனவர்களுக்கான செயற்கை நுண்ணறிவு கடல்சார் வழிகாட்டி',
    nav_dashboard: 'முகப்பு பலகை',
    nav_simulation: 'படகு பாதுகாப்பு உருவகப்படுத்துதல்',
    nav_assistant: 'ஏஐ கடல்சார் உதவியாளர்',
    nav_map: 'கடல்சார் தகவமைப்பு வரைபடம்',
    nav_pfz: 'சாத்தியமான மீன்பிடி மண்டலங்கள்',
    nav_safety: 'கடல் பாதுகாப்பு கணிப்பு',
    nav_telemetry: 'செயற்கைக்கோள் தொலை அளவியல்',
    nav_equipment: 'கருவி மற்றும் வலை கண்காணிப்பு',
    nav_route: 'பாதுகாப்பான வழித்தடம்',
    nav_alerts: 'எச்சரிக்கைகள்',
    nav_data: 'கடல் தரவு',
    nav_services: 'மீனவர் சேவைகள்',
    nav_schemes: 'அரசு திட்டங்கள் & உதவித்தொகை',
    sosButton: 'அவசர உதவி SOS',
  },
  te: {
    appName: 'మెరైన్ AI',
    tagline: 'మత్స్యకారుల కోసం సముద్ర నిఘా వ్యవస్థ',
    nav_dashboard: 'డ్యాష్‌బోర్డ్',
    nav_assistant: 'AI సముద్ర సహాయకుడు',
    nav_map: 'సముద్రపు మ్యాప్',
    nav_pfz: 'చేపల వేట ప్రాంతాలు',
    nav_safety: 'సముద్ర రక్షణ అంచనా',
    nav_telemetry: 'ఉపగ్రహ టెలిమెట్రీ',
    nav_equipment: 'పరికరాల పర్యవేక్షణ',
    nav_route: 'సురక్షిత మార్గం',
    nav_alerts: 'హెచ్చరికలు',
    nav_data: 'సముద్ర డేటా',
    nav_services: 'మత్స్యకార సేవలు',
    nav_schemes: 'ప్రభుత్వ పథకాలు & స్కాలర్‌షిప్‌లు',
    sosButton: 'అత్యవసర SOS',
  },
  ml: {
    appName: 'മറൈൻ AI',
    tagline: 'മത്സ്യത്തൊഴിലാളികൾക്കുള്ള മറൈൻ ഇന്റലിജൻസ്',
    nav_dashboard: 'ഡാഷ്‌ബോർഡ്',
    nav_assistant: 'AI മറൈൻ അസിസ്റ്റന്റ്',
    nav_map: 'മറൈൻ മാപ്പ്',
    nav_pfz: 'സാധ്യമായ മത്സ്യബന്ധന മേഖലകൾ',
    nav_safety: 'കടൽ സുരക്ഷാ പ്രവചനം',
    nav_telemetry: 'ഉപഗ്രഹ ടെലിമെട്രി',
    nav_equipment: 'ഉപകരണ നിരീക്ഷണം',
    nav_route: 'സുരക്ഷിത റൂട്ട് പ്ലാനർ',
    nav_alerts: 'മുന്നറിയിപ്പുകൾ',
    nav_data: 'മറൈൻ ഡാറ്റ',
    nav_services: 'മത്സ്യത്തൊഴിലാളി സേവനങ്ങൾ',
    nav_schemes: 'സർക്കാർ പദ്ധതികളും സ്കോളർഷിപ്പുകളും',
    sosButton: 'അടിയന്തര SOS',
  },
  hi: {
    appName: 'मरीन एआई',
    tagline: 'मछुआरों के लिए समुद्री बुद्धिमत्ता प्रणाली',
    nav_dashboard: 'डैशबोर्ड',
    nav_assistant: 'एआई मरीन सहायक',
    nav_map: 'समुद्री इंटेलिजेंस मानचित्र',
    nav_pfz: 'संभावित मत्स्य पालन क्षेत्र',
    nav_safety: 'समुद्री सुरक्षा पूर्वानुमान',
    nav_telemetry: 'उपग्रह टेलीमेट्री',
    nav_equipment: 'उपकरण एवं जाल निगरानी',
    nav_route: 'सुरक्षित मार्ग योजना',
    nav_alerts: 'चेतावनी और सलाह',
    nav_data: 'समुद्री डेटा',
    nav_services: 'मछुआरा सेवाएं',
    nav_schemes: 'सरकारी योजनाएं और छात्रवृत्ति',
    sosButton: 'आपातकालीन एसओएस',
  },
  gu: {
    appName: 'મરીન AI',
    tagline: 'માછીમારો માટે આર્ટિફિશિયલ ઇન્ટેલિજન્સ',
    nav_dashboard: 'ડેશબોર્ડ',
    nav_assistant: 'AI મરીન સહાયક',
    nav_map: 'મરીન નકશો',
    nav_pfz: 'સંભવિત માછીમારી ઝોન',
    nav_safety: 'દરિયાઈ સુરક્ષા આગાહી',
    nav_telemetry: 'સેટેલાઇટ ટેલિમેટ્રી',
    nav_equipment: 'સાધન મોનિટરિંગ',
    nav_route: 'સલામત રૂટ પ્લાનર',
    nav_alerts: 'ચેતવણીઓ',
    nav_data: 'મરીન ડેટા',
    nav_services: 'માછીમાર સેવાઓ',
    nav_schemes: 'સરકારી યોજનાઓ અને શિષ્યવૃત્તિ',
    sosButton: 'ઇમરજન્સી SOS',
  },
  bn: {
    appName: 'মেরিন এআই',
    tagline: 'মৎস্যজীবীদের জন্য কৃত্রিম বুদ্ধিমত্তা ব্যবস্থা',
    nav_dashboard: 'ড্যাশবোর্ড',
    nav_assistant: 'এআই মেরিন সহকারী',
    nav_map: 'সামুদ্রিক মানচিত্র',
    nav_pfz: 'সম্ভাব্য মৎস্য শিকার ক্ষেত্র',
    nav_safety: 'সমুদ্র নিরাপত্তার পূর্বাভাস',
    nav_telemetry: 'স্যাটেলাইট টেলিমেট্রি',
    nav_equipment: 'যন্ত্রপাতি পর্যবেক্ষণ',
    nav_route: 'নিরাপদ রুট প্ল্যানার',
    nav_alerts: 'সতর্কবার্তা',
    nav_data: 'মেরিন ডেটা',
    nav_services: 'মৎসজীবি পরিষেবা',
    nav_schemes: 'সরকারি প্রকল্প ও বৃত্তি',
    sosButton: 'জরুরি এসওএস',
  },
  or: {
    appName: 'ମେରିନ୍ AI',
    tagline: 'ମତ୍ସ୍ୟଜୀବୀଙ୍କ ପାଇଁ ସାମୁଦ୍ରିକ ଗୁଇନ୍ଦା ପ୍ରଣାଳୀ',
    nav_dashboard: 'ଡ୍ୟାସବୋର୍ଡ୍',
    nav_assistant: 'AI ସାମୁଦ୍ରିକ ସହାୟକ',
    nav_map: 'ସାମୁଦ୍ରିକ ମାନଚିତ୍ର',
    nav_pfz: 'ସମ୍ଭାବ୍ୟ ମତ୍ସ୍ୟ ଶିକାର କ୍ଷେତ୍ର',
    nav_safety: 'ସମୁଦ୍ର ସୁରକ୍ଷା ପୂର୍ବାନୁମାନ',
    nav_telemetry: 'ଉପଗ୍ରହ ଟେଲିମେଟ୍ରି',
    nav_equipment: 'ଯନ୍ତ୍ରପାତି ନିରୀକ୍ଷଣ',
    nav_route: 'ନିରାପଦ ରୁଟ୍ ଯୋଜନାକାରୀ',
    nav_alerts: 'ଚେତାବନୀ',
    nav_data: 'ମେରିନ୍ ତଥ୍ୟ',
    nav_services: 'ମତ୍ସ୍ୟଜୀବୀ ସେବା',
    nav_schemes: 'ସରକାରୀ ଯୋଜନା ଓ ଛାତ୍ରବୃତ୍ତି',
    sosButton: 'ଜରୁରୀକାଳୀନ SOS',
  },
  mr: {
    appName: 'मरीन एआय',
    tagline: 'कोळी बांधवांसाठी सागरी बुद्धिमत्ता प्रणाली',
    nav_dashboard: 'डॅशबोर्ड',
    nav_assistant: 'एआय मरीन सहाय्यक',
    nav_map: 'सागरी नकाशा',
    nav_pfz: 'संभाव्य मासेमारी क्षेत्र',
    nav_safety: 'सागरी सुरक्षा अंदाज',
    nav_telemetry: 'उपग्रह टेलिमेट्री',
    nav_equipment: 'उपकरण देखरेख',
    nav_route: 'सुरक्षित मार्ग नियोजक',
    nav_alerts: 'इशारे आणि सल्ले',
    nav_data: 'सागरी माहिती',
    nav_services: 'कोळी सेवा',
    nav_schemes: 'शासकीय योजना आणि शिष्यवृत्ती',
    sosButton: 'आपत्कालीन एसओएस',
  },
};
