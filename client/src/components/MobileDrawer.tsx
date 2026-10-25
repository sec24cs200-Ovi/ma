import React from 'react';
import {
  X,
  LayoutDashboard,
  Compass,
  Bot,
  Map as MapIcon,
  Fish,
  Cpu,
  BellRing,
  Database,
  ShoppingBag,
  Landmark,
  Clock,
  Waves,
  MapPin,
  Globe2,
  AlertTriangle,
  Radio,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { NavView, LanguageCode } from '../types';
import { REGIONS, TRANSLATIONS } from '../data/mockData';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  activeRegion: string;
  onRegionChange: (reg: string) => void;
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onTriggerSos: () => void;
  onOpenScheduler: () => void;
  onOpenAuction: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  currentView,
  onSelectView,
  activeRegion,
  onRegionChange,
  language,
  onLanguageChange,
  onTriggerSos,
  onOpenScheduler,
  onOpenAuction,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const currentRegion = REGIONS[activeRegion] || REGIONS.rameswaram;

  if (!isOpen) return null;

  const handleNavClick = (view: NavView) => {
    onSelectView(view);
    onClose();
  };

  const DRAWER_ITEMS: {
    id: NavView;
    label: string;
    icon: React.ReactNode;
    badge?: { text: string; color: string };
  }[] = [
    {
      id: 'dashboard',
      label: t.nav_dashboard || 'Dashboard Overview',
      icon: <LayoutDashboard className="w-5 h-5 text-cyan-400" />,
      badge: { text: 'OVERVIEW', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
    },
    {
      id: 'boat-simulation',
      label: 'Boat Simulation & Border Geofence',
      icon: <Compass className="w-5 h-5 text-amber-400" />,
      badge: { text: 'SIMULATION', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
    },
    {
      id: 'gis-map',
      label: t.nav_map || 'GIS Interactive Map',
      icon: <MapIcon className="w-5 h-5 text-sky-400" />,
      badge: { text: 'LIVE GIS', color: 'bg-sky-500/20 text-sky-300 border-sky-500/30' },
    },
    {
      id: 'pfz-zones',
      label: t.nav_pfz || 'Potential Fishing Zones (PFZ)',
      icon: <Fish className="w-5 h-5 text-emerald-400" />,
      badge: { text: '94% YIELD', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    },
    {
      id: 'ai-assistant',
      label: t.nav_assistant || 'AI Marine Assistant',
      icon: <Bot className="w-5 h-5 text-cyan-300" />,
      badge: { text: 'VOICE + AI', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
    },
    {
      id: 'equipment',
      label: t.nav_equipment || 'MCU Net Monitor & Snags',
      icon: <Cpu className="w-5 h-5 text-teal-400" />,
      badge: { text: 'HARDWARE', color: 'bg-teal-500/20 text-teal-300 border-teal-500/30' },
    },
    {
      id: 'alerts',
      label: t.nav_alerts || 'Border & Storm Advisories',
      icon: <BellRing className="w-5 h-5 text-rose-400" />,
      badge: { text: '2 ACTIVE', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
    },
    {
      id: 'marine-data',
      label: t.nav_data || 'Marine Telemetry Hub',
      icon: <Database className="w-5 h-5 text-blue-400" />,
      badge: { text: 'ALL-IN-1', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    },
    {
      id: 'services',
      label: t.nav_services || 'Catch Auctions & Logistics',
      icon: <ShoppingBag className="w-5 h-5 text-violet-400" />,
      badge: { text: 'MARKET', color: 'bg-violet-500/20 text-violet-300 border-violet-500/30' },
    },
    {
      id: 'schemes',
      label: t.nav_schemes || 'Govt PMMSY & DBT Schemes',
      icon: <Landmark className="w-5 h-5 text-teal-300" />,
      badge: { text: 'SUBSIDIES', color: 'bg-teal-500/20 text-teal-300 border-teal-500/30' },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex md:hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer Slide-in Panel */}
      <div className="relative w-full max-w-xs bg-[#070e1b] border-r border-sky-950/80 shadow-2xl flex flex-col h-full z-10 overflow-hidden">
        {/* Drawer Header */}
        <div className="p-4 border-b border-sky-950/80 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-inner">
              <Waves className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-white">Marine AI</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  v2.4
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                IND-TN-10-MM-4421
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Vessel & Captain Info Card */}
        <div className="p-3 mx-3 mt-3 rounded-xl bg-gradient-to-r from-sky-950/40 to-slate-900 border border-cyan-950/60 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Capt. K. Rameshan
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {currentRegion.name} • NavIC Active
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            LIVE
          </div>
        </div>

        {/* Quick Settings: Region & Language */}
        <div className="px-3 pt-3 flex flex-col gap-2">
          {/* Region Picker */}
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800">
            <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
            <select
              value={activeRegion}
              onChange={(e) => onRegionChange(e.target.value)}
              className="bg-transparent text-white text-xs outline-none w-full font-medium cursor-pointer"
            >
              {Object.values(REGIONS).map((reg) => (
                <option key={reg.id} value={reg.id} className="bg-slate-900 text-white">
                  {reg.name}, {reg.state}
                </option>
              ))}
            </select>
          </div>

          {/* Language Picker */}
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800">
            <Globe2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
              className="bg-transparent text-white text-xs outline-none w-full font-medium cursor-pointer"
            >
              <option value="en" className="bg-slate-900">English</option>
              <option value="ta" className="bg-slate-900">தமிழ் (Tamil)</option>
              <option value="te" className="bg-slate-900">తెలుగు (Telugu)</option>
              <option value="ml" className="bg-slate-900">മലയാളം (Malayalam)</option>
              <option value="hi" className="bg-slate-900">हिन्दी (Hindi)</option>
              <option value="gu" className="bg-slate-900">ગુજરાતી (Gujarati)</option>
              <option value="bn" className="bg-slate-900">বাংলা (Bengali)</option>
              <option value="or" className="bg-slate-900">ଓଡ଼ିଆ (Odia)</option>
              <option value="mr" className="bg-slate-900">मराठी (Marathi)</option>
            </select>
          </div>

          {/* Quick SOS Trigger Button in Drawer */}
          <button
            onClick={() => {
              onTriggerSos();
              onClose();
            }}
            className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 text-white text-xs font-black uppercase tracking-wider border border-red-400/40 shadow-lg shadow-red-950/60 active:scale-95"
          >
            <AlertTriangle className="w-4 h-4 animate-bounce" />
            <span>Emergency SOS Distress Beacon</span>
          </button>
        </div>

        {/* Scrollable Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-1">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 px-2 py-1 flex items-center justify-between">
            <span>Navigation Modules</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
          </div>

          {DRAWER_ITEMS.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all active:scale-98 ${
                  isActive
                    ? 'bg-gradient-to-r from-sky-900/60 to-cyan-900/40 text-cyan-200 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-300 hover:bg-slate-900/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  {item.icon}
                  <span className="truncate">{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {item.badge && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${item.badge.color}`}
                    >
                      {item.badge.text}
                    </span>
                  )}
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </div>
              </button>
            );
          })}

          {/* Direct Action Links */}
          <div className="mt-2 pt-2 border-t border-slate-800/80 flex flex-col gap-1.5">
            <button
              onClick={() => {
                onOpenScheduler();
                onClose();
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 text-xs font-semibold text-emerald-300 active:scale-98"
            >
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Family Location Ping</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </button>

            <button
              onClick={() => {
                onOpenAuction();
                onClose();
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 text-xs font-semibold text-cyan-300 active:scale-98"
            >
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-4 h-4 text-cyan-400" />
                <span>Upload Catch for Auction</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-3 border-t border-sky-950/80 bg-slate-950/80 text-center">
          <p className="text-[10px] text-slate-500">
            ISRO OceanSat-3 & NavIC Satellite Mesh Active
          </p>
        </div>
      </div>
    </div>
  );
};
