import React, { useState } from 'react';
import {
  Waves,
  ShieldCheck,
  Fish,
  Satellite,
  Compass,
  Sparkles,
  ShoppingBag,
  Clock,
  ChevronRight,
  TrendingUp,
  Cpu,
  RotateCcw,
} from 'lucide-react';
import { MarineMap } from '../Map/MarineMap';
import { BoatSimulationView } from './BoatSimulationView';
import { REGIONS, getPfzZonesForRegion } from '../../data/mockData';
import { NavView, PFZZone } from '../../types';

interface DashboardViewProps {
  activeRegion: string;
  onNavigate: (view: NavView) => void;
  onSelectZone: (zone: PFZZone) => void;
  onOpenScheduler: () => void;
  onOpenAuction: () => void;
  onShowToast?: (title: string, message: string, type?: 'info' | 'success' | 'error') => void;
  initialSimulationMode?: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  activeRegion,
  onNavigate,
  onSelectZone,
  onOpenScheduler,
  onOpenAuction,
  onShowToast,
  initialSimulationMode = false,
}) => {
  const [isSimulationMode, setIsSimulationMode] = useState<boolean>(initialSimulationMode);
  const region = REGIONS[activeRegion] || REGIONS.rameswaram;
  const regionalPfzZones = getPfzZonesForRegion(activeRegion);

  return (
    <div className="flex flex-col gap-4 p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto">
      {/* High-End Minimal Intelligence & Safety Command Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Card 1: Marine Intelligence Advisory */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-cyan-950/20 border border-slate-800/90 hover:border-cyan-500/30 p-3.5 backdrop-blur-xl transition-all duration-300 shadow-lg flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center shrink-0 text-cyan-400 group-hover:scale-105 transition-transform shadow-inner">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-white tracking-wide">Marine Intelligence Advisory</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Optimal Pelagic Yield
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate mt-0.5 font-medium">
                Thermal front convergence & favorable catch zone active
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('ai-assistant')}
            className="shrink-0 px-3.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 hover:text-white border border-cyan-500/30 text-xs font-bold transition-all flex items-center gap-1 shadow-sm active:scale-95"
          >
            <span>Ask AI</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 2: Interactive Vessel Simulation & Safety */}
        <div
          className={`group relative overflow-hidden rounded-2xl border p-3.5 backdrop-blur-xl transition-all duration-300 shadow-lg flex items-center justify-between gap-3 ${
            isSimulationMode
              ? 'bg-gradient-to-br from-cyan-950/40 via-slate-900/80 to-[#071324] border-cyan-500/40 ring-1 ring-cyan-500/20'
              : 'bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-blue-950/20 border-slate-800/90 hover:border-cyan-500/30'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-inner ${
                isSimulationMode
                  ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300'
                  : 'bg-blue-500/10 border-blue-500/25 text-blue-400'
              }`}
            >
              <Compass className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-white tracking-wide">Vessel Simulation & Geofence</span>
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isSimulationMode
                      ? 'text-cyan-300 bg-cyan-500/15 border-cyan-500/40'
                      : 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSimulationMode ? 'bg-cyan-400 animate-ping' : 'bg-amber-400'
                    }`}
                  />
                  {isSimulationMode ? 'Simulation Active' : 'Boundary Alert'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate mt-0.5 font-medium">
                Real-time IMBL boundary navigation & safety alerts
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              const nextMode = !isSimulationMode;
              setIsSimulationMode(nextMode);
              if (onShowToast) {
                onShowToast(
                  nextMode ? 'Simulation Active' : 'Live Map Active',
                  nextMode
                    ? 'Interactive boat simulation & geofencing enabled.'
                    : 'Standard GIS map view restored.',
                  'info'
                );
              }
            }}
            className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 ${
              isSimulationMode
                ? 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40'
                : 'bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white shadow-cyan-900/30'
            }`}
          >
            <span>{isSimulationMode ? 'Exit Mode' : 'Simulate'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Marine Intelligence Map or Embedded Simulation */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-white flex items-center gap-2 tracking-wide">
            <Waves className="w-4 h-4 text-cyan-400" />
            {isSimulationMode
              ? 'Interactive Vessel Simulation & Geofence Intelligence'
              : 'Live GIS Marine Intelligence Map'}
          </h2>
          <div className="flex items-center gap-2">
            {!isSimulationMode && (
              <button
                onClick={() => onNavigate('gis-map')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-slate-800/60 transition-colors"
              >
                Fullscreen Map <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {isSimulationMode ? (
          <div className="rounded-2xl border border-cyan-500/40 bg-[#060c18] overflow-hidden shadow-2xl">
            <BoatSimulationView
              onShowToast={onShowToast || (() => {})}
              onExitSimulation={() => setIsSimulationMode(false)}
              isEmbedded={true}
            />
          </div>
        ) : (
          <MarineMap activeRegion={activeRegion} onSelectZone={onSelectZone} />
        )}
      </div>

      {/* Quick Action Cards Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={onOpenAuction}
          className="p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-cyan-500/40 transition-all flex items-center gap-3 text-left group"
        >
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <ShoppingBag className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Sell Catch</div>
            <div className="text-[10px] text-slate-400">Upload Auction Photo</div>
          </div>
        </button>

        <button
          onClick={onOpenScheduler}
          className="p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-emerald-500/40 transition-all flex items-center gap-3 text-left group"
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Family Safe Ping</div>
            <div className="text-[10px] text-slate-400">Auto Location Dispatch</div>
          </div>
        </button>

        <button
          onClick={() => onNavigate('equipment')}
          className="p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-teal-500/40 transition-all flex items-center gap-3 text-left group"
        >
          <div className="w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Cpu className="w-4 h-4 text-teal-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">MCU Net Monitor</div>
            <div className="text-[10px] text-slate-400">Live Strain & Snags</div>
          </div>
        </button>

        <button
          onClick={() => onNavigate('route-planner')}
          className="p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-blue-500/40 transition-all flex items-center gap-3 text-left group"
        >
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Compass className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Safe Route</div>
            <div className="text-[10px] text-slate-400">158° SSE to Zone B</div>
          </div>
        </button>
      </div>

      {/* 3-Column Lower Row: Ocean Telemetry, Sea Safety, and PFZ Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Oceanographic Telemetry */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Satellite className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Live Satellite Telemetry
                </h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">
                ISRO ONLINE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400">Sea Surface Temp</span>
                <div className="text-sm font-bold text-cyan-300 font-mono mt-0.5">28.3 °C</div>
                <span className="text-[10px] text-emerald-400">Thermal Front Active</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400">Chlorophyll-a</span>
                <div className="text-sm font-bold text-emerald-300 font-mono mt-0.5">3.1 mg/m³</div>
                <span className="text-[10px] text-emerald-400">High Plankton Density</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400">NavIC Satellites</span>
                <div className="text-sm font-bold text-white font-mono mt-0.5">14 Locked</div>
                <span className="text-[10px] text-cyan-400">Sub-meter accuracy</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400">Weather Satellite</span>
                <div className="text-sm font-bold text-white font-mono mt-0.5">INSAT-3DR</div>
                <span className="text-[10px] text-emerald-400">Zero Squall Risk</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('satellite-telemetry')}
            className="w-full mt-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-cyan-300 transition-colors"
          >
            View Satellite Feeds
          </button>
        </div>

        {/* Card 2: Sea Safety Forecast */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Sea Safety Forecast
                </h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">
                INCOIS VERIFIED
              </span>
            </div>

            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center gap-3 mb-3">
              <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <div className="text-xs font-black text-emerald-300 uppercase">SAFE TO GO</div>
                <p className="text-[10px] text-slate-300 mt-0.5">
                  Optimal sea state • Calm waters and favorable weather conditions
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400">Wave Height</span>
                <div className="text-xs font-bold text-white mt-0.5">0.8 m</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400">Wind Speed</span>
                <div className="text-xs font-bold text-white mt-0.5">12 km/h</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400">Cyclone Risk</span>
                <div className="text-xs font-bold text-emerald-400 mt-0.5">None</div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('sea-safety')}
            className="w-full mt-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-emerald-300 transition-colors"
          >
            Explainable AI Why It's Safe
          </button>
        </div>

        {/* Card 3: Potential Fishing Zones */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Fish className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Potential Fishing Zones
                </h3>
              </div>
              <button
                onClick={() => onNavigate('pfz-zones')}
                className="text-[10px] font-bold text-amber-400 hover:underline"
              >
                View All
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {regionalPfzZones.slice(0, 3).map((zone) => (
                <div
                  key={zone.id}
                  onClick={() => onSelectZone(zone)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    zone.status === 'optimal'
                      ? 'bg-emerald-950/20 hover:bg-emerald-950/30 border-emerald-500/30'
                      : 'bg-slate-950/40 hover:bg-slate-900 border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">{zone.name.split('–')[0]}</span>
                      <span className="text-[10px] text-slate-400">({zone.distanceNM} NM)</span>
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>SST {zone.sst}°C</span>
                      <span>Chl {zone.chlorophyll} mg/m³</span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      zone.confidence > 90
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {zone.confidence}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('pfz-zones')}
            className="w-full mt-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-amber-300 transition-colors"
          >
            Explore All 4 Zones
          </button>
        </div>
      </div>
    </div>
  );
};
