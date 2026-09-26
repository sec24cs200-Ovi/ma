import React from 'react';
import { Fish, Sparkles, Navigation, Anchor, AlertTriangle, ShieldCheck } from 'lucide-react';
import { PFZ_ZONES } from '../../data/mockData';
import { PFZZone } from '../../types';

interface PfzZonesViewProps {
  onSelectZone: (zone: PFZZone) => void;
  onNavigateToRoute: () => void;
  onShowToast: (title: string, msg: string, type: 'info' | 'success' | 'error') => void;
}

export const PfzZonesView: React.FC<PfzZonesViewProps> = ({
  onSelectZone,
  onNavigateToRoute,
  onShowToast,
}) => {
  const handleLockZone = (zone: PFZZone) => {
    onSelectZone(zone);
    onShowToast('Target PFZ Locked', `${zone.name} selected as active destination.`, 'success');
    onNavigateToRoute();
  };

  return (
    <div className="flex flex-col gap-5 p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
            <Fish className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              ISRO OceanSat-3 Potential Fishing Zones (PFZ)
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold">
                OCM-3 SATELLITE DERIVED
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Generated via chlorophyll concentration and sea surface temperature thermal boundary gradients.
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Zones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PFZ_ZONES.map((zone) => {
          const isOptimal = zone.status === 'optimal';
          const isRestricted = zone.status === 'restricted';

          return (
            <div
              key={zone.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                isOptimal
                  ? 'bg-emerald-950/20 border-emerald-500/40 hover:border-emerald-500/70 shadow-lg shadow-emerald-950/30'
                  : isRestricted
                  ? 'bg-red-950/20 border-red-500/40 hover:border-red-500/70'
                  : 'bg-slate-900/80 border-slate-800 hover:border-amber-500/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      {zone.name}
                      {isOptimal && <Sparkles className="w-4 h-4 text-amber-400" />}
                    </h3>
                    <span className="text-xs text-slate-400">
                      {zone.distanceNM} NM ({zone.direction})
                    </span>
                  </div>

                  <span
                    className={`text-xs font-black px-2.5 py-1 rounded-xl uppercase ${
                      zone.confidence > 90
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : zone.confidence > 70
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-red-500/20 text-red-300 border border-red-500/40'
                    }`}
                  >
                    {zone.confidence}% YIELD
                  </span>
                </div>

                {/* Oceanographic Metrics */}
                <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400">Sea Surface Temp</span>
                    <div className="text-sm font-bold text-cyan-300 font-mono mt-0.5">
                      {zone.sst} °C
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400">Chlorophyll-a</span>
                    <div className="text-sm font-bold text-emerald-300 font-mono mt-0.5">
                      {zone.chlorophyll} mg/m³
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400">Water Depth</span>
                    <div className="text-sm font-bold text-white font-mono mt-0.5">
                      {zone.depth} m
                    </div>
                  </div>
                </div>

                {/* Target Species List */}
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                    Target Pelagic & Demersal Species:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {zone.species.map((sp, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-slate-800 text-[11px] text-slate-200 border border-slate-700/60"
                      >
                        🐟 {sp}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              {isRestricted ? (
                <div className="p-2.5 rounded-xl bg-red-950/50 border border-red-500/40 text-xs text-red-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>Restricted Zone – Within 1.5 NM of IMBL Boundary. Route blocked.</span>
                </div>
              ) : (
                <button
                  onClick={() => handleLockZone(zone)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <Navigation className="w-4 h-4" />
                  Lock Route & Calculate Compass Bearing
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
