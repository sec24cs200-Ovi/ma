import React from 'react';
import {
  ShieldCheck,
  Waves,
  Wind,
  CloudRain,
  Zap,
  HelpCircle,
  AlertTriangle,
  Compass,
} from 'lucide-react';
import { REGIONS } from '../../data/mockData';

interface SeaSafetyViewProps {
  activeRegion: string;
}

export const SeaSafetyView: React.FC<SeaSafetyViewProps> = ({ activeRegion }) => {
  const region = REGIONS[activeRegion] || REGIONS.rameswaram;

  return (
    <div className="flex flex-col gap-5 p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              INCOIS Sea Safety Forecast & Cyclone Early Warning
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">
                HIGH RESOLUTION WAVE MODEL
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              High-resolution wave state models, ocean swell analysis, and convective storm detection for {region.name}.
            </p>
          </div>
        </div>
      </div>

      {/* Safety Status Hero Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/40 flex items-center gap-4 shadow-xl">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-7 h-7 text-emerald-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-black text-emerald-300 uppercase tracking-wide">
              SAFE TO VENTURE INTO SEA
            </h3>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">
              INCOIS ADVISORY
            </span>
          </div>
          <p className="text-xs text-slate-200 mt-1">
            Suitable conditions for motorized & mechanized crafts in {region.name} waters tomorrow morning (04:00 AM – 11:30 AM). Swell is stable at 0.8m with gentle wind vectors.
          </p>
        </div>
      </div>

      {/* 6 Ocean Weather Parameter Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
          <Waves className="w-8 h-8 text-cyan-400 shrink-0" />
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Significant Wave Height</span>
            <div className="text-lg font-black text-white font-mono mt-0.5">0.8 m</div>
            <span className="text-[10px] text-emerald-400">Safe (&lt; 2.0m threshold)</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
          <Wind className="w-8 h-8 text-blue-400 shrink-0" />
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Surface Wind Velocity</span>
            <div className="text-lg font-black text-white font-mono mt-0.5">12 km/h (SSE)</div>
            <span className="text-[10px] text-emerald-400">Gentle Breeze (Beaufort 3)</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
          <CloudRain className="w-8 h-8 text-sky-400 shrink-0" />
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Rainfall Probability</span>
            <div className="text-lg font-black text-white font-mono mt-0.5">Low (5%)</div>
            <span className="text-[10px] text-emerald-400">Dry pelagic conditions</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
          <Zap className="w-8 h-8 text-amber-400 shrink-0" />
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Lightning Strikes</span>
            <div className="text-lg font-black text-white font-mono mt-0.5">0 Detected</div>
            <span className="text-[10px] text-emerald-400">Atmospheric shear neutral</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
          <AlertTriangle className="w-8 h-8 text-emerald-400 shrink-0" />
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Cyclone / Squall Alert</span>
            <div className="text-lg font-black text-emerald-300 font-mono mt-0.5">No Depression</div>
            <span className="text-[10px] text-emerald-400">Barometric pressure 1012 hPa</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
          <Compass className="w-8 h-8 text-teal-400 shrink-0" />
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Tidal Phase & Current</span>
            <div className="text-lg font-black text-white font-mono mt-0.5">+0.4m Flood Tide</div>
            <span className="text-[10px] text-teal-400">Slack current at 08:45 AM</span>
          </div>
        </div>
      </div>

      {/* Explainable AI Box */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-cyan-500/30 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold">
          <HelpCircle className="w-4 h-4 text-cyan-400" />
          <span>Why is it safe? (Explainable AI Decision Logic)</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Wind speeds remain well below the 15-knot danger threshold and ocean swells are stable at 0.8 meters. INSAT-3DR infrared sounders show zero convective storm cloud formation across the Gulf of Mannar and Palk Strait sectors. Water visibility exceeds 14 meters with favorable thermal layers for pelagic netting.
        </p>
      </div>
    </div>
  );
};
