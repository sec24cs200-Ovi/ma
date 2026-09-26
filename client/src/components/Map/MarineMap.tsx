import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Layers, Eye, ShieldAlert, Fish, Sparkles, Navigation } from 'lucide-react';
import { REGIONS, PFZ_ZONES } from '../../data/mockData';
import { PFZZone } from '../../types';

interface MarineMapProps {
  activeRegion: string;
  onSelectZone?: (zone: PFZZone) => void;
  fullScreen?: boolean;
}

export const MarineMap: React.FC<MarineMapProps> = ({
  activeRegion,
  onSelectZone,
  fullScreen = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  const [activeLayers, setActiveLayers] = useState({
    pfz: true,
    sst: true,
    chlorophyll: true,
    wind: false,
    geofence: true,
  });

  const toggleLayer = (key: keyof typeof activeLayers) => {
    setActiveLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const region = REGIONS[activeRegion] || REGIONS.rameswaram;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: region.coords,
        zoom: 10,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // OpenStreetMap Base Tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const layerGroup = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
      layerGroupRef.current = layerGroup;
    } else {
      mapInstanceRef.current.setView(region.coords, 10, { animate: true });
    }

    return () => {
      // Keep map alive during tab transitions
    };
  }, [activeRegion]);

  // Update Layers when toggles or region change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();
    const region = REGIONS[activeRegion] || REGIONS.rameswaram;

    // 1. Boat Marker (Vessel IND-TN-10)
    const boatIcon = L.divIcon({
      className: 'custom-boat-marker',
      html: `
        <div style="position:relative; display:flex; align-items:center; justify-content:center; width:36px; height:36px; background:#0284c7; border:2px solid #38bdf8; border-radius:50%; box-shadow:0 0 15px #0284c7;">
          <span style="font-size:16px;">🚤</span>
          <span style="position:absolute; width:100%; height:100%; border-radius:50%; border:2px solid #38bdf8; animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></span>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    const boatMarker = L.marker(region.coords, { icon: boatIcon }).bindPopup(`
      <div style="font-family:sans-serif; padding:4px;">
        <h4 style="font-weight:bold; color:#0284c7; margin:0 0 4px 0;">Vessel IND-TN-10-MM-4421</h4>
        <div style="font-size:12px; color:#cbd5e1;">Captain: K. Rameshan</div>
        <div style="font-size:11px; color:#10b981; margin-top:2px;">Status: Active / NavIC Satellite Locked</div>
        <div style="font-size:11px; color:#94a3b8; font-family:monospace; margin-top:2px;">Coords: ${region.coords[0]}° N, ${region.coords[1]}° E</div>
      </div>
    `);
    layerGroup.addLayer(boatMarker);

    // 2. PFZ Zones
    if (activeLayers.pfz) {
      PFZ_ZONES.forEach((zone) => {
        const color =
          zone.status === 'optimal'
            ? '#10b981'
            : zone.status === 'moderate'
            ? '#f59e0b'
            : '#ef4444';

        const circle = L.circle([zone.lat, zone.lng], {
          color: color,
          fillColor: color,
          fillOpacity: 0.25,
          radius: zone.status === 'optimal' ? 3800 : 2500,
          weight: 2,
        });

        circle.bindPopup(`
          <div style="font-family:sans-serif; padding:4px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
              <strong style="color:${color}; font-size:13px;">${zone.name}</strong>
              <span style="background:${color}25; color:${color}; font-size:10px; font-weight:bold; padding:2px 6px; border-radius:4px;">
                ${zone.confidence}% YIELD
              </span>
            </div>
            <div style="font-size:11px; color:#cbd5e1; margin-bottom:4px;">Distance: ${zone.distanceNM} NM (${zone.direction})</div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; font-size:10px; background:#0f172a; padding:6px; border-radius:4px; margin-bottom:6px;">
              <div>SST: <strong style="color:#38bdf8;">${zone.sst}°C</strong></div>
              <div>Chlorophyll: <strong style="color:#34d399;">${zone.chlorophyll} mg/m³</strong></div>
              <div>Depth: <strong>${zone.depth}m</strong></div>
              <div>Species: <strong>${zone.species[0]}</strong></div>
            </div>
            <button id="btn-target-${zone.id}" style="width:100%; background:#0284c7; color:#fff; border:none; padding:5px 8px; border-radius:4px; font-size:11px; font-weight:bold; cursor:pointer;">
              Target This PFZ Route
            </button>
          </div>
        `);

        circle.on('popupopen', () => {
          const btn = document.getElementById(`btn-target-${zone.id}`);
          if (btn && onSelectZone) {
            btn.onclick = () => onSelectZone(zone);
          }
        });

        layerGroup.addLayer(circle);
      });
    }

    // 3. Recommended Route to Zone B
    const targetZone = PFZ_ZONES[0];
    const routeCoords: [number, number][] = [
      region.coords,
      [(region.coords[0] + targetZone.lat) / 2 - 0.02, (region.coords[1] + targetZone.lng) / 2 + 0.03],
      [targetZone.lat, targetZone.lng],
    ];

    const routeLine = L.polyline(routeCoords, {
      color: '#06b6d4',
      weight: 3,
      dashArray: '8, 8',
      opacity: 0.9,
    }).bindPopup(`
      <div style="font-size:12px; font-family:sans-serif;">
        <strong style="color:#06b6d4;">Recommended Navigation Route</strong>
        <div style="color:#cbd5e1; margin-top:2px;">Safe path to Zone B bypassing shallow reefs & IMBL border.</div>
      </div>
    `);
    layerGroup.addLayer(routeLine);

    // 4. IMBL Geofence Border Line (India - Sri Lanka International Maritime Boundary)
    if (activeLayers.geofence) {
      const imblCoords: [number, number][] = [
        [10.05, 79.88],
        [9.75, 79.75],
        [9.35, 79.62],
        [9.1, 79.52],
        [8.7, 79.35],
      ];

      const imblLine = L.polyline(imblCoords, {
        color: '#ef4444',
        weight: 3,
        dashArray: '6, 6',
        opacity: 0.85,
      }).bindPopup(`
        <div style="font-family:sans-serif;">
          <strong style="color:#ef4444;">🚨 RESTRICTED: IMBL International Boundary</strong>
          <div style="font-size:11px; color:#f87171; margin-top:2px;">
            Crossing is strictly prohibited. Vessel NavIC Geofence Alert active.
          </div>
        </div>
      `);
      layerGroup.addLayer(imblLine);
    }
  }, [activeRegion, activeLayers, onSelectZone]);

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-sky-950/70 shadow-2xl ${
        fullScreen ? 'h-[calc(100vh-140px)]' : 'h-[440px]'
      }`}
    >
      {/* Map Header Controls */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/60 shadow-lg text-xs font-bold text-white">
          <Navigation className="w-3.5 h-3.5 text-cyan-400" />
          <span>ISRO OceanSat-3 GIS Overlay</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1"></span>
        </div>

        {/* Toggle Layers Filter Pills */}
        <div className="pointer-events-auto flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/60 shadow-lg">
          <button
            onClick={() => toggleLayer('pfz')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeLayers.pfz
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Fish className="w-3 h-3" />
            <span>PFZ</span>
          </button>

          <button
            onClick={() => toggleLayer('sst')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeLayers.sst
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>SST Fronts</span>
          </button>

          <button
            onClick={() => toggleLayer('geofence')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeLayers.geofence
                ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3 h-3" />
            <span>IMBL Geofence</span>
          </button>
        </div>
      </div>

      {/* Actual Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Legend Overlay at bottom */}
      <div className="absolute bottom-3 left-3 z-[1000] hidden md:flex items-center gap-4 px-3 py-2 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/60 shadow-lg text-[11px] text-slate-300 font-medium">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span>Favourable PFZ</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span>Moderate Zone</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-0 border-t-2 border-dashed border-cyan-400"></span>
          <span>Safe Route</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-0 border-t-2 border-dashed border-red-500"></span>
          <span>Restricted IMBL</span>
        </div>
      </div>
    </div>
  );
};
