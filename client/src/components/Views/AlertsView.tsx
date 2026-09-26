import React from 'react';
import { BellRing, AlertTriangle, ShieldAlert, CheckCircle2, Radio } from 'lucide-react';
import { REGIONS } from '../../data/mockData';

interface AlertsViewProps {
  activeRegion: string;
}

export const AlertsView: React.FC<AlertsViewProps> = ({ activeRegion }) => {
  const region = REGIONS[activeRegion] || REGIONS.rameswaram;

  const alerts = [
    {
      id: 'alt-1',
      title: 'IMBL International Boundary Line Geofence Warning',
      severity: 'high',
      time: '15 mins ago',
      desc: 'Zone D is located 1.5 NM west of the maritime boundary with Sri Lanka. NavIC proximity alert is active. Do not cross the dashed red geofence.',
      source: 'Indian Coast Guard & NavIC Geofence Subsystem',
    },
    {
      id: 'alt-2',
      title: 'High Plankton Density & Potential Fishing Alert (Zone B)',
      severity: 'info',
      time: '42 mins ago',
      desc: 'OceanSat-3 OCM-3 infrared sounder reports high Chlorophyll-a (3.1 mg/m³) with sharp 28.3°C thermal front. Favorable schooling for Yellowfin Tuna & Mackerel.',
      source: 'ISRO Space Applications Centre (SAC)',
    },
    {
      id: 'alt-3',
      title: 'Normal Sea State – No Cyclone Depression Warning',
      severity: 'safe',
      time: '1 hour ago',
      desc: 'Barometric pressure across Tamil Nadu & Gulf of Mannar coast is stable at 1012 hPa. Wind velocities will remain under 15 km/h until tomorrow 14:00 IST.',
      source: 'India Meteorological Department (IMD) & INCOIS',
    },
  ];

  return (
    <div className="flex flex-col gap-5 p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center">
            <BellRing className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Marine Alerts, Advisories & Border Geofence Warnings
              <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded font-bold">
                LIVE NAVIC BROADCAST
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Direct emergency satellite broadcasts received on vessel NavIC receiver for {region.name}.
            </p>
          </div>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="flex flex-col gap-3">
        {alerts.map((alt) => (
          <div
            key={alt.id}
            className={`p-5 rounded-2xl border flex flex-col gap-2 shadow-md ${
              alt.severity === 'high'
                ? 'bg-red-950/20 border-red-500/50'
                : alt.severity === 'safe'
                ? 'bg-emerald-950/20 border-emerald-500/40'
                : 'bg-cyan-950/20 border-cyan-500/40'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                {alt.severity === 'high' ? (
                  <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
                ) : alt.severity === 'safe' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <Radio className="w-5 h-5 text-cyan-400 shrink-0" />
                )}
                <h3 className="text-sm font-bold text-white">{alt.title}</h3>
              </div>

              <span className="text-[10px] text-slate-400 shrink-0 font-mono">{alt.time}</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed pl-7">{alt.desc}</p>

            <div className="text-[10px] text-slate-500 font-semibold pl-7 mt-1">
              Source: {alt.source}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
