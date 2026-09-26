import React, { useState } from 'react';
import { Clock, Send, Users, ShieldCheck, X } from 'lucide-react';
import { REGIONS } from '../../data/mockData';

interface FamilySchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeRegion: string;
  onShowToast: (title: string, msg: string, type: 'info' | 'success' | 'error') => void;
}

export const FamilySchedulerModal: React.FC<FamilySchedulerModalProps> = ({
  isOpen,
  onClose,
  activeRegion,
  onShowToast,
}) => {
  const [frequency, setFrequency] = useState<'15min' | '1hour' | '2hour' | 'daywise'>('1hour');
  const region = REGIONS[activeRegion] || REGIONS.rameswaram;
  const lat = region.coords[0].toFixed(4);
  const lng = region.coords[1].toFixed(4);

  if (!isOpen) return null;

  const handleSave = () => {
    onShowToast(
      'Family Location Scheduler Saved',
      `Periodic automated safe check-in configured to ${frequency.toUpperCase()}. Transmitting GPS to Parents & Spouse.`,
      'success'
    );
    onClose();
  };

  const handleManualTestPing = () => {
    onShowToast(
      'Manual Test Ping Dispatched',
      `Location ${lat}° N, ${lng}° E sent to Parents (Father: +91 98401 23456) & Spouse via SMS/WhatsApp.`,
      'info'
    );
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-xl rounded-2xl bg-[#090f1d] border border-cyan-500/40 shadow-2xl p-6 flex flex-col gap-5 text-white max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-base font-bold text-white">
                Automated Family Location Scheduler
              </h3>
              <p className="text-xs text-slate-400">
                Periodically sends live coordinates to your parents & spouse so they never worry
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Frequency Picker */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-300">
            Automated Safe Check-In Frequency:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: '15min', label: 'Every 15 Min' },
              { id: '1hour', label: 'Every 1 Hour' },
              { id: '2hour', label: 'Every 2 Hours' },
              { id: 'daywise', label: 'Morning & Eve' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setFrequency(item.id as any)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                  frequency === item.id
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-md'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Message Preview */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-1.5">
          <span className="text-[10px] uppercase font-bold text-slate-400">
            Live Check-In Message Preview:
          </span>
          <p className="text-xs text-cyan-200/90 italic font-mono leading-relaxed">
            "Marine AI Safe Sea Check-In: Vessel IND-TN-10 is SAFE at coordinates {lat}° N, {lng}° E ({region.name}). Speed: 6.2 kts. Swell: 0.8m. Crew all safe. Next automated ping in {frequency === '15min' ? '15m' : frequency === '2hour' ? '2 hrs' : frequency === 'daywise' ? '12 hrs' : '1 hr'}. Live Map: https://maps.google.com/?q={lat},{lng}"
          </p>
        </div>

        {/* Configured Contacts */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            Configured Family Contacts
          </span>
          <div className="flex flex-col gap-1.5 text-xs text-slate-300">
            <div className="flex justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
              <span>Father (M. Karuppan)</span>
              <span className="font-mono text-cyan-400">+91 98401 23456</span>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
              <span>Mother (K. Lakshmi)</span>
              <span className="font-mono text-cyan-400">+91 98402 34567</span>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
              <span>Spouse (R. Selvi)</span>
              <span className="font-mono text-cyan-400">+91 94432 78901</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleManualTestPing}
            className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            Send Test Ping Now
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Save & Activate
          </button>
        </div>
      </div>
    </div>
  );
};
