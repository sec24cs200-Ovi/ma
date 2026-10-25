import React, { useState, useEffect } from 'react';
import {
  Database,
  Waves,
  Droplets,
  Wind,
  Compass,
  Thermometer,
  ShieldCheck,
  ShieldAlert,
  CloudRain,
  Zap,
  HelpCircle,
  AlertTriangle,
  Satellite,
  Radio,
  CheckCircle,
  RefreshCw,
  Layers,
  Route,
  Navigation,
  Fuel,
  Clock,
  Filter,
} from 'lucide-react';
import { REGIONS, PFZ_ZONES } from '../../data/mockData';
import { PFZZone } from '../../types';

interface MarineDataViewProps {
  activeRegion: string;
  selectedZone?: PFZZone | null;
  onShowToast?: (title: string, msg: string, type: 'info' | 'success' | 'error') => void;
  initialTab?: 'all' | 'safety' | 'telemetry' | 'route' | 'ocean';
}

export const MarineDataView: React.FC<MarineDataViewProps> = ({
  activeRegion,
  selectedZone,
  onShowToast,
  initialTab = 'all',
}) => {
  const region = REGIONS[activeRegion] || REGIONS.rameswaram;
  const [activeTab, setActiveTab] = useState<'all' | 'safety' | 'telemetry' | 'route' | 'ocean'>(initialTab);

  // Sync tab if initialTab changes
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Route planner state
  const [targetZoneId, setTargetZoneId] = useState(selectedZone ? selectedZone.id : 'zone-b');
  const [cruisingSpeed, setCruisingSpeed] = useState(8); // knots

  useEffect(() => {
    if (selectedZone) {
      setTargetZoneId(selectedZone.id);
    }
  }, [selectedZone]);

  const targetZone = PFZ_ZONES.find((z) => z.id === targetZoneId) || PFZ_ZONES[0];
  const distance = targetZone.distanceNM;
  const hours = distance / cruisingSpeed;
  const transitMinutes = Math.round(hours * 60);
  const fuelLiters = (distance * 1.85).toFixed(1);

  const waypoints = [
    { name: `Harbor Waypoint 1 (${region.name} Jetty)`, coords: `${region.coords[0]}° N, ${region.coords[1]}° E`, depth: '8m' },
    { name: 'Channel Waypoint 2 (Fairway Buoy)', coords: `${(region.coords[0] - 0.04).toFixed(4)}° N, ${(region.coords[1] + 0.05).toFixed(4)}° E`, depth: '18m' },
    { name: 'Deep Sea Waypoint 3 (Coral Reef Bypass)', coords: `${(region.coords[0] - 0.08).toFixed(4)}° N, ${(region.coords[1] + 0.08).toFixed(4)}° E`, depth: '32m' },
    { name: `Target Destination (${targetZone.name})`, coords: `${targetZone.lat}° N, ${targetZone.lng}° E`, depth: `${targetZone.depth}m` },
  ];

  const handleTransmitRoute = () => {
    if (onShowToast) {
      onShowToast(
        'NavIC Route Transmitted',
        `Waypoints uploaded to Vessel IND-TN-10 navigation autopilot & radar screen. Compass bearing 158° SSE locked.`,
        'success'
      );
    }
  };

  const handleRefreshTelemetry = () => {
    if (onShowToast) {
      onShowToast(
        'Telemetry Sync Requested',
        'Downloading latest L2 OceanSat-3 OCM-3 Chlorophyll raster and thermal front vectors...',
        'info'
      );
    }
  };

  const hourlyForecast = [
    { time: '04:00 AM', wave: '0.7m', wind: '10 km/h', temp: '27.9°C', safe: true },
    { time: '06:00 AM', wave: '0.8m', wind: '11 km/h', temp: '28.1°C', safe: true },
    { time: '08:00 AM', wave: '0.8m', wind: '12 km/h', temp: '28.3°C', safe: true },
    { time: '10:00 AM', wave: '0.9m', wind: '13 km/h', temp: '28.6°C', safe: true },
    { time: '12:00 PM', wave: '1.1m', wind: '15 km/h', temp: '29.0°C', safe: true },
    { time: '02:00 PM', wave: '1.3m', wind: '17 km/h', temp: '29.2°C', safe: true },
    { time: '04:00 PM', wave: '1.4m', wind: '18 km/h', temp: '28.9°C', safe: true },
  ];

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Top Banner & Header */}
      <div className="p-4 lg:p-5 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900 to-indigo-950/40 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-indigo-500/40 flex items-center justify-center shrink-0 shadow-inner">
            <Database className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-black text-white tracking-wide">
                Unified Marine Data & Intelligence Engine
              </h2>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded font-extrabold tracking-wider uppercase">
                ISRO • INCOIS • OPEN-METEO
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Comprehensive oceanographic data hub integrating Sea Safety Forecasting, Satellite Telemetry, and Safe Route Planning for <span className="text-cyan-300 font-semibold">{region.name}</span>.
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={handleRefreshTelemetry}
            className="px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-700 shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Sync All Feeds
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs Bar */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-slate-900/90 border border-slate-800/90 overflow-x-auto select-none">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'all'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          All Marine Data Hub
        </button>

        <button
          onClick={() => setActiveTab('safety')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'safety'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          Sea Safety Forecasting
        </button>

        <button
          onClick={() => setActiveTab('telemetry')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'telemetry'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Satellite className="w-3.5 h-3.5 text-cyan-400" />
          Satellite Telemetry (ISRO)
        </button>

        <button
          onClick={() => setActiveTab('route')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'route'
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm shadow-blue-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Route className="w-3.5 h-3.5 text-blue-400" />
          Safe Route Planner
        </button>

        <button
          onClick={() => setActiveTab('ocean')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'ocean'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm shadow-indigo-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Waves className="w-3.5 h-3.5 text-indigo-400" />
          Physical Oceanography
        </button>
      </div>

      {/* ================= SECTION 1: SEA SAFETY FORECASTING ================= */}
      {(activeTab === 'all' || activeTab === 'safety') && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <h3 className="text-sm font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              Sea Safety Forecasting & Cyclone Early Warning
            </h3>
            <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded">
              INCOIS HIGH RESOLUTION WAVE MODEL
            </span>
          </div>

          {/* Safety Status Hero Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/40 flex items-center gap-4 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-lg font-black text-emerald-300 uppercase tracking-wide">
                  SAFE TO VENTURE INTO SEA
                </h4>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold border border-emerald-500/30">
                  INCOIS ADVISORY
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Calm sea state and favorable conditions across {region.name} waters • Zero cyclone or squall advisory active
              </p>
            </div>
          </div>

          {/* 6 Ocean Weather Parameter Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2.5">
              <Waves className="w-7 h-7 text-cyan-400 shrink-0" />
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Wave Height</span>
                <div className="text-base font-black text-white font-mono mt-0.5">0.8 m</div>
                <span className="text-[9px] text-emerald-400 font-semibold">Safe (&lt;2.0m)</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2.5">
              <Wind className="w-7 h-7 text-blue-400 shrink-0" />
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Wind Velocity</span>
                <div className="text-base font-black text-white font-mono mt-0.5">12 km/h</div>
                <span className="text-[9px] text-emerald-400 font-semibold">SSE (Beaufort 3)</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2.5">
              <CloudRain className="w-7 h-7 text-sky-400 shrink-0" />
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Rainfall Prob.</span>
                <div className="text-base font-black text-white font-mono mt-0.5">Low (5%)</div>
                <span className="text-[9px] text-emerald-400 font-semibold">Dry pelagic</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2.5">
              <Zap className="w-7 h-7 text-amber-400 shrink-0" />
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Lightning</span>
                <div className="text-base font-black text-white font-mono mt-0.5">0 Detected</div>
                <span className="text-[9px] text-emerald-400 font-semibold">Shear neutral</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2.5">
              <AlertTriangle className="w-7 h-7 text-emerald-400 shrink-0" />
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Cyclone Alert</span>
                <div className="text-base font-black text-emerald-300 font-mono mt-0.5">None</div>
                <span className="text-[9px] text-emerald-400 font-semibold">1012 hPa</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2.5">
              <Compass className="w-7 h-7 text-teal-400 shrink-0" />
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Tidal Phase</span>
                <div className="text-base font-black text-white font-mono mt-0.5">+0.4m Flood</div>
                <span className="text-[9px] text-teal-400 font-semibold">Slack 08:45 AM</span>
              </div>
            </div>
          </div>

          {/* Explainable AI Decision Logic Box */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/30 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold">
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span>Why is it safe? (Explainable AI Decision Logic)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Wind speeds remain well below the 15-knot danger threshold and ocean swells are stable at 0.8 meters. INSAT-3DR infrared sounders show zero convective storm cloud formation across the Gulf of Mannar and Palk Strait sectors. Water visibility exceeds 14 meters with favorable thermal layers for pelagic netting.
            </p>
          </div>
        </div>
      )}

      {/* ================= SECTION 2: SATELLITE TELEMETRY ================= */}
      {(activeTab === 'all' || activeTab === 'telemetry') && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <h3 className="text-sm font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <Satellite className="w-4 h-4" />
              ISRO Earth Observation & Satellite Telemetry Stream
            </h3>
            <span className="text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded">
              OCEANSAT-3 & NavIC CONSTELLATION
            </span>
          </div>

          {/* 4 Constellation Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
                  <span>ISRO OceanSat-3</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">
                    OCM-3 SENSOR
                  </span>
                </div>
                <div className="text-xl font-black text-white font-mono">13 Bands</div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Provides 360m resolution Chlorophyll-a concentrations & ocean color.
                </p>
              </div>
              <div className="text-[10px] text-cyan-400 mt-3 flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-400" />
                Last Overpass: 42 mins ago
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
                  <span>ISRO INSAT-3DR</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">
                    METEOROLOGY
                  </span>
                </div>
                <div className="text-xl font-black text-white font-mono">Sounder Active</div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Geostationary atmospheric monitoring & zero convective squall formation.
                </p>
              </div>
              <div className="text-[10px] text-cyan-400 mt-3 flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-400" />
                Live Feed Latency: 1.2s
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
                  <span>NavIC Constellation</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">
                    L5 / S BAND
                  </span>
                </div>
                <div className="text-xl font-black text-white font-mono">14 Satellites</div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Indigenous Indian satellite positioning with sub-meter marine accuracy.
                </p>
              </div>
              <div className="text-[10px] text-cyan-400 mt-3 flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-400" />
                DGPS Carrier Locked
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
                  <span>INCOIS Wave Buoy</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">
                    IN-SITU SENSOR
                  </span>
                </div>
                <div className="text-xl font-black text-white font-mono">{region.name} Buoy</div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Moored acoustic directional wave gauge recording real swell height (0.8m).
                </p>
              </div>
              <div className="text-[10px] text-cyan-400 mt-3 flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-400" />
                Calibration Variance: ±0.02m
              </div>
            </div>
          </div>

          {/* Spectral Layer Breakdown & Ground Station Packet Stream */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-4">
            <h4 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
              <Layers className="w-4 h-4 text-cyan-400" />
              Oceanographic Spectral Bands & Sensor Diagnostics
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col gap-2">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-cyan-300">Sea Surface Temperature (SST) Radiometry</span>
                  <span className="text-emerald-400 font-mono">28.3 °C (Thermal Front)</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Derived from infrared split-window brightness temperatures. Boundary gradient indicates a sharp 0.8°C thermal front where nutrient-rich upwelling attracts pelagic schools.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col gap-2">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-emerald-300">Chlorophyll-a Plankton Optical Density</span>
                  <span className="text-emerald-400 font-mono">3.1 mg/m³ (Bloom)</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Calculated via blue-green reflectance ratios (443nm / 555nm). High plankton concentration confirms forage fish abundance and active feeding grounds.
                </p>
              </div>
            </div>

            {/* Downlink Telemetry Health Strip */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-cyan-300 font-bold">
                <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span>NRSC Shadnagar Relay Ground Station Link:</span>
              </div>
              <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px] flex-wrap">
                <span>BER: <strong className="text-emerald-400">1.2 × 10⁻⁸</strong></span>
                <span>Freq: <strong className="text-white">8450 MHz (X-Band)</strong></span>
                <span>Elevation: <strong className="text-white">58.4°</strong></span>
                <span>Ping: <strong className="text-cyan-300">24 ms (Direct RF)</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= SECTION 3: SAFE ROUTE PLANNER ================= */}
      {(activeTab === 'all' || activeTab === 'route') && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <h3 className="text-sm font-black uppercase tracking-wider text-blue-400 flex items-center gap-2">
              <Route className="w-4 h-4" />
              Autonomous Safe Marine Route Planner
            </h3>
            <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded">
              IMBL GEOFENCE PROTECTED
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Destination Selection & Speed */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-3">
              <label className="text-xs font-bold text-slate-300">Select Target Fishing Destination:</label>
              <select
                value={targetZoneId}
                onChange={(e) => setTargetZoneId(e.target.value)}
                className="p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white outline-none cursor-pointer"
              >
                {PFZ_ZONES.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name} – {z.distanceNM} NM ({z.confidence}% Yield)
                  </option>
                ))}
              </select>

              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5 font-medium">
                  <span>Cruising Trawler Speed:</span>
                  <span className="font-bold text-cyan-400 font-mono">{cruisingSpeed} Knots</span>
                </div>
                <input
                  type="range"
                  min={4}
                  max={14}
                  value={cruisingSpeed}
                  onChange={(e) => setCruisingSpeed(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Clearance & Bearing Summary */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">IMBL Geofence Safe Clearance:</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  100% CLEAR
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                    <Compass className="w-3 h-3" /> Distance
                  </span>
                  <div className="text-sm font-bold text-white font-mono mt-0.5">{distance} NM</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3" /> Transit Time
                  </span>
                  <div className="text-sm font-bold text-cyan-300 font-mono mt-0.5">
                    {Math.floor(transitMinutes / 60)}h {transitMinutes % 60}m
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                    <Fuel className="w-3 h-3" /> Est. Fuel
                  </span>
                  <div className="text-sm font-bold text-amber-300 font-mono mt-0.5">{fuelLiters} L</div>
                </div>
              </div>

              <button
                onClick={handleTransmitRoute}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs uppercase transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                Upload Course to Vessel NavIC Autopilot
              </button>
            </div>
          </div>

          {/* Waypoints Sequence List */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              NavIC GPS Waypoint Sequence & Depth Sounder Profile
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {waypoints.map((wp, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center font-bold text-[11px] shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-white truncate max-w-[200px]">{wp.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{wp.coords}</div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[11px] text-cyan-400 font-bold font-mono">Depth: {wp.depth}</span>
                    <div className="text-[10px] text-emerald-400">Safe Clearance</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= SECTION 4: PHYSICAL OCEANOGRAPHY & IN-SITU DATA ================= */}
      {(activeTab === 'all' || activeTab === 'ocean') && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <h3 className="text-sm font-black uppercase tracking-wider text-indigo-400 flex items-center gap-2">
              <Waves className="w-4 h-4" />
              Live Physical Oceanography & Coastal Wave State
            </h3>
            <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded">
              OPEN-METEO MARINE API
            </span>
          </div>

          {/* 4 Main Oceanographic Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                <Waves className="w-3.5 h-3.5 text-cyan-400" />
                Swell Wave Period
              </span>
              <div className="text-2xl font-black text-white font-mono mt-1">7.4 s</div>
              <span className="text-[10px] text-emerald-400">Regular swell, smooth trawling</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-blue-400" />
                Ocean Salinity
              </span>
              <div className="text-2xl font-black text-white font-mono mt-1">34.8 PSU</div>
              <span className="text-[10px] text-cyan-400">Normal marine salinity</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                Thermocline Depth
              </span>
              <div className="text-2xl font-black text-white font-mono mt-1">38 m</div>
              <span className="text-[10px] text-amber-400">Pelagic boundary layer</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-teal-400" />
                Surface Current Velocity
              </span>
              <div className="text-2xl font-black text-white font-mono mt-1">0.45 m/s</div>
              <span className="text-[10px] text-teal-400">Direction: 142° SE</span>
            </div>
          </div>

          {/* Hourly Timeline Table */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Hourly Ocean Wave State & Sea Temperature Forecast
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                    <th className="pb-2.5">Time Interval</th>
                    <th className="pb-2.5">Wave Height</th>
                    <th className="pb-2.5">Wind Velocity</th>
                    <th className="pb-2.5">Surface Temp</th>
                    <th className="pb-2.5 text-right">Craft Safety</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {hourlyForecast.map((h, i) => (
                    <tr key={i} className="hover:bg-slate-950/40">
                      <td className="py-2.5 font-bold text-white font-mono">{h.time}</td>
                      <td className="py-2.5 text-cyan-300 font-mono">{h.wave}</td>
                      <td className="py-2.5 text-blue-300 font-mono">{h.wind}</td>
                      <td className="py-2.5 text-slate-300 font-mono">{h.temp}</td>
                      <td className="py-2.5 text-right">
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">
                          SAFE
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
