import * as turf from '@turf/turf';
import {
  IMBLPoint,
  SafetyStation,
  GeofenceSettings,
  BoatTelemetry,
  SimulationRiskStatus,
} from '../types';

/**
 * Officially sourced & treaty-validated International Maritime Boundary Line (IMBL)
 * Source: Bilateral Indo-Sri Lanka Maritime Agreements (1974 & 1976),
 * codified under UN Treaty Series & Sri Lanka Maritime Zones Law No. 22 of 1976.
 */
export const OFFICIAL_IMBL_POINTS: IMBLPoint[] = [
  { id: 'POS-1', name: 'Position 1 (1974 Treaty)', lat: 10.0833, lng: 80.0500, desc: '10° 05.0′ N, 80° 03.0′ E (Palk Strait Entry)' },
  { id: 'POS-2', name: 'Position 2 (1974 Treaty)', lat: 9.9500, lng: 79.5833, desc: '09° 57.0′ N, 79° 35.0′ E (Palk Bay North)' },
  { id: 'POS-3', name: 'Position 3 (1974 Treaty)', lat: 9.6692, lng: 79.3767, desc: '09° 40.15′ N, 79° 22.60′ E (Central Palk Bay)' },
  { id: 'POS-4', name: 'Position 4 (1974 Treaty)', lat: 9.3633, lng: 79.5117, desc: '09° 21.80′ N, 79° 30.70′ E (Katchatheevu Sector)' },
  { id: 'POS-5', name: 'Position 5 (1974 Treaty)', lat: 9.2167, lng: 79.5333, desc: '09° 13.0′ N, 79° 32.0′ E (South Palk Bay)' },
  { id: 'POS-6', name: 'Position 6 / 1m (1974 & 1976 Treaties)', lat: 9.1000, lng: 79.5333, desc: '09° 06.0′ N, 79° 32.0′ E (Adam’s Bridge Gap / Trijunction)' },
  { id: 'POS-2M', name: 'Position 2m (1976 Treaty)', lat: 9.0000, lng: 79.5217, desc: '09° 00.0′ N, 79° 31.3′ E (Gulf of Mannar North)' },
  { id: 'POS-3M', name: 'Position 3m (1976 Treaty)', lat: 8.8967, lng: 79.4883, desc: '08° 53.8′ N, 79° 29.3′ E (Gulf of Mannar Ridge)' },
  { id: 'POS-4M', name: 'Position 4m (1976 Treaty)', lat: 8.6667, lng: 79.3033, desc: '08° 40.0′ N, 79° 18.2′ E (Gulf of Mannar Central)' },
  { id: 'POS-5M', name: 'Position 5m (1976 Treaty)', lat: 8.6200, lng: 79.2167, desc: '08° 37.2′ N, 79° 13.0′ E (South-Western Approach)' },
  { id: 'POS-6M', name: 'Position 6m (1976 Treaty)', lat: 8.5200, lng: 79.0783, desc: '08° 31.2′ N, 79° 04.7′ E (Deep Sea Sector)' },
];

/**
 * GeoJSON LineString of the IMBL for Turf.js calculations [lng, lat]
 */
export const IMBL_LINESTRING = turf.lineString(
  OFFICIAL_IMBL_POINTS.map((pt) => [pt.lng, pt.lat])
);

/**
 * Array of Leaflet-friendly [lat, lng] pairs for the IMBL polyline
 */
export const IMBL_LEAFLET_COORDS: [number, number][] = OFFICIAL_IMBL_POINTS.map(
  (pt) => [pt.lat, pt.lng]
);

/**
 * Registered and authorized coastal safety contacts & rescue coordination stations
 */
export const REGISTERED_SAFETY_STATIONS: SafetyStation[] = [
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
    jurisdiction: 'Palk Bay & Dhanushkodi Northern Waters',
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
    jurisdiction: 'Gulf of Mannar & Palk Strait International Buffer',
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
    jurisdiction: 'Arichal Munai & Adam’s Bridge Shoals',
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
    jurisdiction: 'Gulf of Mannar Deepwater Commercial Corridor',
  },
];

/**
 * Pre-defined simulation movement routes for testing and training drills
 */
export interface SimulationRoute {
  id: string;
  name: string;
  description: string;
  expectedResult: 'SAFE' | 'EARLY_WARNING' | 'CRITICAL_PROXIMITY' | 'CRITICAL_BREACH';
  waypoints: [number, number][]; // [lat, lng]
}

export const SIMULATION_ROUTES: SimulationRoute[] = [
  {
    id: 'route-safe-inshore',
    name: '1. Safe Inshore Corridor (Within National Waters)',
    description: 'Vessel departs Rameswaram Fishing Jetty, sails southeast inside Gulf of Mannar, remaining > 10 km clear of the IMBL.',
    expectedResult: 'SAFE',
    waypoints: [
      [9.2850, 79.3250],
      [9.2550, 79.3500],
      [9.2100, 79.3750],
      [9.1600, 79.3900],
      [9.1200, 79.3650],
      [9.0900, 79.3300],
    ],
  },
  {
    id: 'route-warning-drift',
    name: '2. Early Warning Zone Incursion (Safety Buffer Test)',
    description: 'Drifting eastward past Dhanushkodi into the configured 5.0 km early warning zone. Confirms early safety alert triggers before reaching IMBL.',
    expectedResult: 'EARLY_WARNING',
    waypoints: [
      [9.2450, 79.3800],
      [9.2250, 79.4300],
      [9.2000, 79.4750],
      [9.1850, 79.5050], // Enters warning buffer (< 5 km from IMBL)
      [9.1750, 79.5150],
    ],
  },
  {
    id: 'route-critical-breach',
    name: '3. Critical Proximity & IMBL Breach Drill',
    description: 'Drifting directly east toward Katchatheevu / IMBL Position 5. Enters critical zone (< 1.5 km) and breaches the international line into Sri Lankan waters.',
    expectedResult: 'CRITICAL_BREACH',
    waypoints: [
      [9.2400, 79.4200],
      [9.2300, 79.4800],
      [9.2220, 79.5150], // Warning zone
      [9.2180, 79.5250], // Critical zone (< 1.5 km)
      [9.2150, 79.5450], // Breaches IMBL (Crossed to Sri Lankan side)
      [9.2120, 79.5600],
    ],
  },
  {
    id: 'route-safe-recovery',
    name: '4. Course Correction & Recovery Route',
    description: 'From critical boundary proximity, captain alters heading 270° West, returning vessel back to Indian safe maritime territory.',
    expectedResult: 'SAFE',
    waypoints: [
      [9.2150, 79.5350], // Near IMBL
      [9.2180, 79.5100], // Warning zone
      [9.2250, 79.4600], // Safe boundary crossed
      [9.2400, 79.4000], // Safe zone fully recovered
      [9.2650, 79.3500], // Approaching jetty
    ],
  },
];

/**
 * Converts a decimal bearing (0-360) into 16-point compass heading string
 */
export function bearingToCompass(bearing: number): string {
  const norm = (bearing + 360) % 360;
  const directions = [
    'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
  ];
  const idx = Math.round(norm / 22.5) % 16;
  return `${Math.round(norm)}° ${directions[idx]}`;
}

/**
 * Formats coordinates into nautical degrees and minutes format
 */
export function formatCoordinates(lat: number, lng: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  const absLat = Math.abs(lat);
  const absLng = Math.abs(lng);

  const latDeg = Math.floor(absLat);
  const latMin = ((absLat - latDeg) * 60).toFixed(3);
  const lngDeg = Math.floor(absLng);
  const lngMin = ((absLng - lngDeg) * 60).toFixed(3);

  return `${String(latDeg).padStart(2, '0')}° ${latMin}' ${latDir}, ${String(lngDeg).padStart(3, '0')}° ${lngMin}' ${lngDir}`;
}

/**
 * Checks if a coordinate is across the IMBL into foreign (Sri Lankan) waters.
 * The Indo-Sri Lanka IMBL runs roughly NNE to SSW. India is on the West / NW side,
 * Sri Lanka is on the East / SE side.
 */
export function isBoatCrossedIMBL(lat: number, lng: number): boolean {
  const pt = turf.point([lng, lat]);
  const nearest = turf.nearestPointOnLine(IMBL_LINESTRING, pt);
  const nearestLng = nearest.geometry.coordinates[0];

  // If boat is further East than the nearest point on the IMBL line,
  // it has crossed into the Sri Lankan side.
  return lng > nearestLng;
}

/**
 * Generates parallel offset coordinates for the Early Safety Warning boundary line
 * on the safe (Indian / West) side of the IMBL line.
 */
export function computeEarlySafetyBoundaryLine(
  offsetKm: number
): [number, number][] {
  // Approximate offset in degrees longitude on the Indian (west) side
  // 1 degree longitude at 9.2°N is approx 109.8 km
  const lonOffset = offsetKm / 109.8;

  return OFFICIAL_IMBL_POINTS.map((pt) => [
    pt.lat,
    parseFloat((pt.lng - lonOffset).toFixed(5)),
  ]);
}

/**
 * Computes live boat telemetry, distance to IMBL, and geofence status using Turf.js
 */
export function calculateBoatTelemetry(
  lat: number,
  lng: number,
  speedKnots: number,
  heading: number,
  settings: GeofenceSettings
): BoatTelemetry {
  const boatPt = turf.point([lng, lat]);

  // Turf.js point-to-line shortest distance calculation
  const distanceKm = turf.pointToLineDistance(boatPt, IMBL_LINESTRING, {
    units: 'kilometers',
  });
  const distanceNM = distanceKm * 0.539957;

  // Nearest point on IMBL
  const nearestOnLine = turf.nearestPointOnLine(IMBL_LINESTRING, boatPt);
  const closestImblCoord: [number, number] = [
    nearestOnLine.geometry.coordinates[1],
    nearestOnLine.geometry.coordinates[0],
  ];

  const crossed = isBoatCrossedIMBL(lat, lng);

  // Apply GPS accuracy margin (in meters converted to km)
  const gpsMarginKm = settings.gpsAccuracyMarginMeters / 1000;
  const effectiveWarningKm = settings.warningDistanceKm + gpsMarginKm;
  const effectiveCriticalKm = settings.criticalDistanceKm + gpsMarginKm;

  // Distance remaining before breaching warning line
  const distanceToWarningKm = Math.max(0, distanceKm - effectiveWarningKm);
  const distanceToWarningNM = distanceToWarningKm * 0.539957;

  // Risk Status evaluation
  let riskStatus: SimulationRiskStatus = 'SAFE';
  if (crossed) {
    riskStatus = 'CRITICAL_BREACH';
  } else if (distanceKm <= effectiveCriticalKm) {
    riskStatus = 'CRITICAL_PROXIMITY';
  } else if (distanceKm <= effectiveWarningKm) {
    riskStatus = 'EARLY_WARNING';
  } else {
    riskStatus = 'SAFE';
  }

  // Find nearest registered safety contact station
  let closestStation: SafetyStation | undefined;
  let minStationDist = Infinity;

  REGISTERED_SAFETY_STATIONS.forEach((station) => {
    const stationPt = turf.point([station.lng, station.lat]);
    const dist = turf.distance(boatPt, stationPt, { units: 'kilometers' });
    if (dist < minStationDist) {
      minStationDist = dist;
      closestStation = {
        ...station,
        distanceKm: parseFloat(dist.toFixed(2)),
        distanceNM: parseFloat((dist * 0.539957).toFixed(2)),
      };
    }
  });

  return {
    lat: parseFloat(lat.toFixed(5)),
    lng: parseFloat(lng.toFixed(5)),
    coords: formatCoordinates(lat, lng),
    speedKnots,
    heading,
    headingCompass: bearingToCompass(heading),
    distanceToImblKm: parseFloat(distanceKm.toFixed(2)),
    distanceToImblNM: parseFloat(distanceNM.toFixed(2)),
    distanceToWarningKm: parseFloat(distanceToWarningKm.toFixed(2)),
    distanceToWarningNM: parseFloat(distanceToWarningNM.toFixed(2)),
    riskStatus,
    isCrossedIMBL: crossed,
    closestImblPoint: closestImblCoord,
    closestStation,
  };
}

/**
 * Web Audio API synthesizer for marine buzzer, alarms, and confirmation beeps
 * Runs entirely client-side without external asset dependencies.
 */
class MarineSoundSystem {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    // Lazy initialized on first user interaction
  }

  private getContext(): AudioContext | null {
    if (this.isMuted) return null;
    try {
      if (!this.audioCtx) {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.audioCtx = new AudioContextClass();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      return this.audioCtx;
    } catch {
      return null;
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Gentle two-tone warning chime for early safety line crossing
   */
  public playWarningChime() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.15); // A5

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.45);
    } catch {
      // Audio playback suppressed safely
    }
  }

  /**
   * Prominent maritime emergency siren for critical IMBL proximity & breach
   */
  public playCriticalSiren() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(750, now);
      osc.frequency.linearRampToValueAtTime(1050, now + 0.18);
      osc.frequency.linearRampToValueAtTime(750, now + 0.36);
      osc.frequency.linearRampToValueAtTime(1050, now + 0.54);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.02, now + 0.7);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.72);
    } catch {
      // Audio playback suppressed safely
    }
  }

  /**
   * Recovery confirmation chime
   */
  public playRecoveryChime() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.12); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.24); // G5

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.52);
    } catch {
      // Audio playback suppressed safely
    }
  }
}

export const marineSound = new MarineSoundSystem();
