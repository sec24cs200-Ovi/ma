import React from 'react';
import { Database, Waves, Droplets, Wind, Compass, Thermometer } from 'lucide-react';
import { REGIONS } from '../../data/mockData';

interface MarineDataViewProps {
  activeRegion: string;
}

export const MarineDataView: React.FC<MarineDataViewProps> = ({ activeRegion }) => {
  const region = REGIONS[activeRegion] || REGIONS.rameswaram;

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
    <div className="flex flex-col gap-5 p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
            <Database className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Marine Oceanographic Data Engine
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-bold">
                OPEN-METEO & INCOIS API
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Live in-situ physical oceanography: wave directional spectra, salinity, and tidal harmonics for {region.name}.
            </p>
          </div>
        </div>
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
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Hourly Ocean Wave State & Sea Temperature Forecast
        </h3>

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
  );
};
