export type NavView =
  | 'dashboard'
  | 'boat-simulation'
  | 'ai-assistant'
  | 'gis-map'
  | 'pfz-zones'
  | 'sea-safety'
  | 'satellite-telemetry'
  | 'equipment'
  | 'route-planner'
  | 'alerts'
  | 'marine-data'
  | 'services'
  | 'schemes';

export type LanguageCode = 'en' | 'ta' | 'te' | 'ml' | 'hi' | 'gu' | 'bn' | 'or' | 'mr';

export interface RegionInfo {
  id: string;
  name: string;
  state: string;
  coords: [number, number];
  weather: {
    temp: number;
    condition: string;
    windSpeed: number;
    waveHeight: number;
    swellDir: string;
    isSafe: boolean;
  };
}

export interface PFZZone {
  id: string;
  name: string;
  direction: string;
  distanceNM: number;
  confidence: number;
  sst: number;
  chlorophyll: number;
  depth: number;
  species: string[];
  lat: number;
  lng: number;
  status: 'optimal' | 'moderate' | 'restricted';
}

export interface CatchAuction {
  id: string;
  species: string;
  quantityKg: number;
  pricePerKg: number;
  harbor: string;
  sellerVessel: string;
  photoUrl?: string;
  timeAgo: string;
  verified: boolean;
}

export interface GovtScheme {
  id: string;
  title: string;
  department: string;
  subsidy: string;
  eligibility: string;
  category: 'subsidy' | 'welfare' | 'insurance' | 'scholarship';
  status: 'Open' | 'Applied' | 'Approved';
}

export interface McuTelemetry {
  loadKg: number;
  loadG?: number;
  tensionKn: number;
  tangleRisk: 'LOW' | 'MODERATE' | 'HIGH';
  stressPercent: number;
  rawLine?: string;
  isHalted?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  metadata?: {
    sst?: number;
    depth?: string;
    recommendedZone?: string;
  };
}

export type SimulationRiskStatus =
  | 'SAFE'
  | 'EARLY_WARNING'
  | 'CRITICAL_PROXIMITY'
  | 'CRITICAL_BREACH';

export interface IMBLPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  desc?: string;
}

export interface SafetyStation {
  id: string;
  name: string;
  officer: string;
  phone: string;
  displayPhone: string;
  lat: number;
  lng: number;
  channel: string;
  verified: boolean;
  jurisdiction: string;
  distanceKm?: number;
  distanceNM?: number;
}

export interface BoatTelemetry {
  lat: number;
  lng: number;
  coords: string;
  speedKnots: number;
  heading: number;
  headingCompass: string;
  distanceToImblKm: number;
  distanceToImblNM: number;
  distanceToWarningKm: number;
  distanceToWarningNM: number;
  riskStatus: SimulationRiskStatus;
  isCrossedIMBL: boolean;
  closestImblPoint: [number, number];
  closestStation?: SafetyStation;
}

export interface GeofenceSettings {
  warningDistanceKm: number;
  criticalDistanceKm: number;
  gpsAccuracyMarginMeters: number;
}

export interface SimulationAlert {
  id: string;
  timestamp: string;
  displayTime: string;
  vesselId: string;
  captain: string;
  lat: number;
  lng: number;
  coords: string;
  distanceToImblKm: number;
  distanceToImblNM: number;
  riskStatus: SimulationRiskStatus | 'SAFE_RECOVERY';
  heading: string;
  speedKnots: number;
  note?: string;
  acknowledged: boolean;
  acknowledgedBy?: string | null;
  acknowledgedAt?: string | null;
  responseAction?: string | null;
  officerNotes?: string;
  isMockSimulation: boolean;
}
