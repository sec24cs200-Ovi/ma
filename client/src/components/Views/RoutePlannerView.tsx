import React, { useState } from 'react';
import { Route, Navigation, Compass, Fuel, Clock, ShieldCheck, CheckCircle } from 'lucide-react';
import { REGIONS, PFZ_ZONES } from '../../data/mockData';
import { PFZZone } from '../../types';

interface RoutePlannerViewProps {
  activeRegion: string;
  selectedZone: PFZZone | null;
  onShowToast: (title: string, msg: string, type: 'info' | 'success' | 'error') => void;
}

export const RoutePlannerView: React.FC<RoutePlannerViewProps> = ({
  activeRegion,
  selectedZone,
  onShowToast,
}) => {
  const region = REGIONS[activeRegion] || REGIONS.rameswaram;
  const [targetZoneId, setTargetZoneId] = useState(selectedZone ? selectedZone.id : 'zone-b');
  const [cruisingSpeed, setCruisingSpeed] = useState(8); // knots

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
    onShowToast(
      'NavIC Route Transmitted',
      `Waypoints uploaded to Vessel IND-TN-10 navigation autopilot & radar screen. Compass bearing 158° SSE locked.`,
      'success'
    );
  };

  return (
    <div className="flex flex-col gap-5 p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
            <Route className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Autonomous Safe Marine Route Planner
              <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-bold">
                IMBL GEOFENCE PROTECTED
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Optimal course calculation avoiding shallow shoals, coral hazards, and international border restrictions.
            </p>
          </div>
        </div>
      </div>

      {/* Configuration Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        {/* Safety Corridor & Bearing Summary */}
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
              <span className="text-[10px] text-slate-400">Total Distance</span>
              <div className="text-sm font-bold text-white font-mono mt-0.5">{distance} NM</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] text-slate-400">Transit Duration</span>
              <div className="text-sm font-bold text-cyan-300 font-mono mt-0.5">
                {Math.floor(transitMinutes / 60)}h {transitMinutes % 60}m
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] text-slate-400">Est. Fuel Usage</span>
              <div className="text-sm font-bold text-amber-300 font-mono mt-0.5">{fuelLiters} L</div>
            </div>
          </div>

          <button
            onClick={handleTransmitRoute}
            className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Navigation className="w-4 h-4" />
            Upload Course to Vessel NavIC Autopilot
          </button>
        </div>
      </div>

      {/* Waypoints Sequence List */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Compass className="w-4 h-4 text-cyan-400" />
          NavIC GPS Waypoint Sequence & Depth Sounder Profile
        </h3>

        <div className="flex flex-col gap-2">
          {waypoints.map((wp, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center font-bold text-[11px]">
                  {idx + 1}
                </span>
                <div>
                  <div className="font-bold text-white">{wp.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{wp.coords}</div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-cyan-400 font-bold font-mono">Depth: {wp.depth}</span>
                <div className="text-[10px] text-emerald-400">Safe Clearance</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
