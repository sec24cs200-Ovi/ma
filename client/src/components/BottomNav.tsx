import React from 'react';
import {
  LayoutDashboard,
  Compass,
  Map as MapIcon,
  BellRing,
  Menu,
} from 'lucide-react';
import { NavView, LanguageCode } from '../types';
import { TRANSLATIONS } from '../data/mockData';

interface BottomNavProps {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  language: LanguageCode;
  onOpenMenu: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentView,
  onSelectView,
  language,
  onOpenMenu,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const NAV_ITEMS = [
    {
      id: 'dashboard' as NavView,
      label: t.nav_dashboard || 'Home',
      icon: LayoutDashboard,
    },
    {
      id: 'boat-simulation' as NavView,
      label: 'Simulate',
      icon: Compass,
      badge: 'LIVE',
    },
    {
      id: 'gis-map' as NavView,
      label: t.nav_map || 'GIS Map',
      icon: MapIcon,
    },
    {
      id: 'alerts' as NavView,
      label: t.nav_alerts || 'Alerts',
      icon: BellRing,
      badge: '2',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#070e1b]/95 backdrop-blur-xl border-t border-sky-950/80 px-2 py-1.5 pb-safe md:hidden shadow-[0_-8px_25px_rgba(0,0,0,0.6)]">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={`relative flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'text-cyan-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              <div className="relative">
                <div
                  className={`p-1.5 rounded-xl transition-all ${
                    isActive
                      ? 'bg-cyan-500/15 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                      : 'bg-transparent'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {item.badge && (
                  <span
                    className={`absolute -top-1 -right-1 text-[9px] font-black px-1.5 py-0.2 rounded-full border leading-tight ${
                      item.badge === 'LIVE'
                        ? 'bg-amber-500 text-slate-950 border-amber-300 font-extrabold animate-pulse'
                        : 'bg-rose-500 text-white border-rose-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>

              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[64px]">
                {item.label}
              </span>

              {isActive && (
                <span className="absolute bottom-0 w-6 h-0.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400"></span>
              )}
            </button>
          );
        })}

        {/* 5th Button: Open Mobile Drawer Menu */}
        <button
          onClick={onOpenMenu}
          className="relative flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl text-slate-400 hover:text-slate-200 font-medium transition-all active:scale-95"
        >
          <div className="p-1.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <Menu className="w-5 h-5 text-slate-300" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight text-slate-300">
            Menu
          </span>
        </button>
      </div>
    </nav>
  );
};
