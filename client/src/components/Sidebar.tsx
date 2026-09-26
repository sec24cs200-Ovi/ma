import React from 'react';
import {
  LayoutDashboard,
  Bot,
  Map as MapIcon,
  Fish,
  ShieldAlert,
  Satellite,
  Cpu,
  Route,
  BellRing,
  Database,
  ShoppingBag,
  Landmark,
} from 'lucide-react';
import { NavView, LanguageCode } from '../types';
import { TRANSLATIONS } from '../data/mockData';

interface SidebarProps {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  language: LanguageCode;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  language,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const NAV_ITEMS: {
    id: NavView;
    label: string;
    icon: React.ReactNode;
    badge?: { text: string; color: string };
  }[] = [
    {
      id: 'dashboard',
      label: t.nav_dashboard,
      icon: <LayoutDashboard className="w-4 h-4" />,
      badge: { text: 'OVERVIEW', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
    },
    {
      id: 'ai-assistant',
      label: t.nav_assistant,
      icon: <Bot className="w-4 h-4 text-emerald-400" />,
      badge: { text: 'AI ACTIVE', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    },
    {
      id: 'gis-map',
      label: t.nav_map,
      icon: <MapIcon className="w-4 h-4 text-sky-400" />,
      badge: { text: 'GIS MAP', color: 'bg-sky-500/20 text-sky-300 border-sky-500/30' },
    },
    {
      id: 'pfz-zones',
      label: t.nav_pfz,
      icon: <Fish className="w-4 h-4 text-amber-400" />,
      badge: { text: '94% YIELD', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    },
    {
      id: 'sea-safety',
      label: t.nav_safety,
      icon: <ShieldAlert className="w-4 h-4 text-emerald-400" />,
      badge: { text: 'SAFE', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    },
    {
      id: 'satellite-telemetry',
      label: t.nav_telemetry,
      icon: <Satellite className="w-4 h-4 text-cyan-400" />,
      badge: { text: 'ISRO', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
    },
    {
      id: 'equipment',
      label: t.nav_equipment,
      icon: <Cpu className="w-4 h-4 text-teal-400" />,
      badge: { text: 'MCU LIVE', color: 'bg-teal-500/20 text-teal-300 border-teal-500/30' },
    },
    {
      id: 'route-planner',
      label: t.nav_route,
      icon: <Route className="w-4 h-4 text-blue-400" />,
      badge: { text: '158° SSE', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    },
    {
      id: 'alerts',
      label: t.nav_alerts,
      icon: <BellRing className="w-4 h-4 text-rose-400" />,
      badge: { text: '2 ALERTS', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
    },
    {
      id: 'marine-data',
      label: t.nav_data,
      icon: <Database className="w-4 h-4 text-indigo-400" />,
      badge: { text: 'INCOIS', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
    },
    {
      id: 'services',
      label: t.nav_services,
      icon: <ShoppingBag className="w-4 h-4 text-violet-400" />,
      badge: { text: 'AUCTIONS', color: 'bg-violet-500/20 text-violet-300 border-violet-500/30' },
    },
    {
      id: 'schemes',
      label: t.nav_schemes,
      icon: <Landmark className="w-4 h-4 text-teal-300" />,
      badge: { text: 'SCHEMES', color: 'bg-teal-500/20 text-teal-300 border-teal-500/30' },
    },
  ];

  return (
    <aside className="w-64 shrink-0 bg-[#060c16]/95 border-r border-sky-950/60 flex flex-col justify-between py-4 select-none">
      <div className="flex flex-col gap-1 px-3">
        <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center justify-between">
          <span>Sections & Features</span>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
        </div>

        <nav className="flex flex-col gap-1 mt-1">
          {NAV_ITEMS.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 text-left ${
                  isActive
                    ? 'bg-gradient-to-r from-sky-900/60 to-cyan-900/40 text-cyan-200 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className={`${isActive ? 'text-cyan-400' : 'text-slate-400'}`}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded border uppercase shrink-0 ${item.badge.color}`}
                  >
                    {item.badge.text}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Info Card */}
      <div className="px-4 pt-4 mt-4 border-t border-sky-950/50">
        <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              ORCA Agents
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">9/9 Online</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            INCOIS & ISRO OceanSat-3 satellite observation telemetry sync active.
          </p>
        </div>
      </div>
    </aside>
  );
};
