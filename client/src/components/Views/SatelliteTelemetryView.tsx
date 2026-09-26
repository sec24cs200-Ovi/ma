import React from 'react';
import { Satellite, Radio, CheckCircle, RefreshCw, Cpu, Layers } from 'lucide-react';
import { REGIONS } from '../../data/mockData';

interface SatelliteTelemetryViewProps {
  activeRegion: string;
  onShowToast: (title: string, msg: string, type: 'info' | 'success' | 'error') => void;
}

export const SatelliteTelemetryView: React.FC<SatelliteTelemetryViewProps> = ({
  activeRegion,
  onShowToast,
}) => {
  const region = REGIONS[activeRegion] || REGIONS.rameswaram;

  const handleRefresh = () => {
    onShowToast(
      'Telemetry Sync Requested',
      'Downloading latest L2 OceanSat-3 OCM-3 Chlorophyll raster and thermal front vectors...',
      'info'
    );
  };

  return (
    <div className="flex flex-col gap-5 p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
            <Satellite className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              ISRO Earth Observation & Oceanographic Telemetry Stream
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-bold">
                ISRO OCEANSAT-3 & INCOIS FEED
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Real-time Sea Surface Temperature (SST), Chlorophyll-a optical density, and NavIC telemetry.
            </p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Feed
        </button>
      </div>

      {/* 4 Main Satellites Constellation Status Cards */}
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
            <div className="text-xl font-black text-white font-mono">Gulf of Mannar</div>
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

      {/* Spectral Layer Breakdown Details */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          Oceanographic Spectral Bands & Sensor Diagnostics
        </h3>

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
      </div>
    </div>
  );
};
