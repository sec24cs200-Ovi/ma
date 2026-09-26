import React from 'react';
import { Map, Layers, Navigation } from 'lucide-react';
import { MarineMap } from '../Map/MarineMap';
import { PFZZone } from '../../types';

interface GisMapViewProps {
  activeRegion: string;
  onSelectZone: (zone: PFZZone) => void;
}

export const GisMapView: React.FC<GisMapViewProps> = ({ activeRegion, onSelectZone }) => {
  return (
    <div className="flex flex-col gap-4 p-4 lg:p-6 max-w-7xl mx-auto h-[calc(100vh-80px)]">
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center">
            <Map className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Full Widescreen Marine Intelligence GIS Map
              <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded font-bold">
                HIGH RESOLUTION
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Interactive multi-layer geospatial view with NavIC GPS vessel beacon, PFZ thermal gradients, and IMBL geofence boundary.
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full rounded-2xl overflow-hidden border border-slate-800">
        <MarineMap activeRegion={activeRegion} onSelectZone={onSelectZone} fullScreen={true} />
      </div>
    </div>
  );
};
