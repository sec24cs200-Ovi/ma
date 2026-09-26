export type NavView =
  | 'dashboard'
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
  tensionKn: number;
  tangleRisk: 'LOW' | 'MODERATE' | 'HIGH';
  stressPercent: number;
  rawLine?: string;
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
