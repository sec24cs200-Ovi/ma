import React, { useState, useEffect } from 'react';
import {
  Waves,
  MapPin,
  Clock,
  Radio,
  Globe2,
  AlertTriangle,
  ChevronDown,
  Wind,
  ShieldCheck,
} from 'lucide-react';
import { REGIONS, TRANSLATIONS } from '../data/mockData';
import { LanguageCode } from '../types';

interface HeaderProps {
  activeRegion: string;
  onRegionChange: (regionId: string) => void;
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onTriggerSos: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeRegion,
  onRegionChange,
  language,
  onLanguageChange,
  onTriggerSos,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const region = REGIONS[activeRegion] || REGIONS.rameswaram;
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        }) + ' IST'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#070d18]/95 backdrop-blur-md border-b border-sky-950/60 px-4 py-2.5 flex items-center justify-between gap-3 shadow-lg shadow-black/40">
      {/* Brand & Identity */}
      <div className="flex items-center gap-3.5">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 shadow-inner">
          <Waves className="w-5 h-5 text-cyan-400" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#070d18] animate-pulse"></span>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
              <span>Marine AI</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                ORCA v2.4
              </span>
            </h1>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block font-medium">
            {t.tagline}
          </p>
        </div>
      </div>

      {/* Center Group: Region & Weather & Clock */}
      <div className="flex items-center gap-2.5 md:gap-4">
        {/* Region Selector Dropdown */}
        <div className="relative">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 text-xs font-semibold text-slate-200 transition-all cursor-pointer">
            <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <select
              value={activeRegion}
              onChange={(e) => onRegionChange(e.target.value)}
              className="bg-transparent text-white outline-none cursor-pointer pr-1"
            >
              {Object.values(REGIONS).map((reg) => (
                <option key={reg.id} value={reg.id} className="bg-slate-900 text-slate-200">
                  {reg.name}, {reg.state}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Weather Capsule */}
        <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs font-medium text-slate-300">
          <span className="text-emerald-400 font-bold">{region.weather.temp}°C</span>
          <span className="text-slate-500">|</span>
          <span className="flex items-center gap-1 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            {region.weather.condition}
          </span>
          <span className="text-slate-500">|</span>
          <span className="flex items-center gap-1 text-slate-300">
            <Wind className="w-3.5 h-3.5 text-blue-400" />
            {region.weather.windSpeed} km/h
          </span>
        </div>

        {/* IST Clock */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300 font-mono">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>{timeStr}</span>
        </div>
      </div>

      {/* Right Group: Language, Vessel ID, Emergency SOS Button */}
      <div className="flex items-center gap-2.5">
        {/* Language Selector */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
          <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
            className="bg-transparent text-white outline-none cursor-pointer text-xs"
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

        {/* Vessel Badge */}
        <div className="hidden xl:flex flex-col text-right">
          <span className="text-[11px] font-bold text-white tracking-wide">
            Capt. K. Rameshan
          </span>
          <span className="text-[10px] text-cyan-400/80 font-mono">
            IND-TN-10-MM-4421
          </span>
        </div>

        {/* Emergency SOS Trigger Button */}
        <button
          onClick={onTriggerSos}
          className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-extrabold text-xs tracking-wider uppercase border border-red-400/40 shadow-lg shadow-red-900/50 transition-all hover:scale-105 active:scale-95 group"
        >
          <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
          <AlertTriangle className="w-4 h-4 text-white" />
          <span className="hidden sm:inline">{t.sosButton}</span>
        </button>
      </div>
    </header>
  );
};
