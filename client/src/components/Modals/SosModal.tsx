import React, { useState, useEffect } from 'react';
import {
  AlertOctagon,
  Radio,
  PhoneCall,
  PhoneOff,
  Copy,
  Check,
  Send,
  ShieldAlert,
  Users,
  X,
} from 'lucide-react';
import { REGIONS } from '../../data/mockData';

interface SosModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeRegion: string;
  onShowToast: (title: string, msg: string, type: 'info' | 'success' | 'error') => void;
}

export const SosModal: React.FC<SosModalProps> = ({
  isOpen,
  onClose,
  activeRegion,
  onShowToast,
}) => {
  const [isInCall, setIsInCall] = useState(false);
  const [callTimer, setCallTimer] = useState(0);
  const [copied, setCopied] = useState(false);
  const region = REGIONS[activeRegion] || REGIONS.rameswaram;
  const lat = region.coords[0].toFixed(4);
  const lng = region.coords[1].toFixed(4);
  const mapsLink = `https://maps.google.com/?q=${lat},${lng}`;

  useEffect(() => {
    let interval: any;
    if (isInCall) {
      interval = setInterval(() => setCallTimer((prev) => prev + 1), 1000);
    } else {
      setCallTimer(0);
    }
    return () => clearInterval(interval);
  }, [isInCall]);

  if (!isOpen) return null;

  const copyLink = () => {
    navigator.clipboard.writeText(mapsLink);
    setCopied(true);
    onShowToast('Tracking Link Copied', mapsLink, 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartCall = () => {
    setIsInCall(true);
    onShowToast(
      'NavIC Marine Intercom Connected',
      'Encrypted RF Satellite carrier active. Speaking with Coast Guard MRCC 1554.',
      'error'
    );
  };

  const handleEndCall = () => {
    setIsInCall(false);
    onShowToast('Call Ended', 'Satellite voice session terminated.', 'info');
  };

  const handleSendWhatsApp = () => {
    const text = `🚨 *EMERGENCY DISTRESS AT SEA* 🚨%0A%0A*Vessel:* IND-TN-10-MM-4421 (Capt. K. Rameshan)%0A*Live Location:* ${lat}° N, ${lng}° E (${region.name})%0A*Live Tracking Link:* ${mapsLink}%0A%0AImmediate rescue coordination requested with Coast Guard MRCC 1554.`;
    window.open(`https://api.whatsapp.com/send?phone=919840123456&text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#090f1d] border-2 border-red-500/80 shadow-2xl shadow-red-950/60 p-6 flex flex-col gap-5 text-white max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-red-500/30">
          <div className="flex items-center gap-3">
            <span className="w-3.5 h-3.5 rounded-full bg-red-500 animate-ping"></span>
            <div>
              <h3 className="text-base font-black tracking-wide text-red-400 uppercase flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-red-500" />
                NavIC Autonomous Emergency Distress Broadcast
              </h3>
              <p className="text-xs text-slate-300">
                Transmitting vessel location to Indian Coast Guard MRCC & Family Contacts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live GPS Telemetry Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400">Vessel ID</span>
            <div className="text-sm font-bold text-cyan-400 font-mono mt-0.5">IND-TN-10-MM-4421</div>
            <span className="text-[10px] text-emerald-400">Capt. K. Rameshan</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400">Live GPS Coordinates</span>
            <div className="text-sm font-bold text-amber-400 font-mono mt-0.5">
              {lat}° N, {lng}° E
            </div>
            <span className="text-[10px] text-emerald-400">NavIC 14 Satellites Locked</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 col-span-2 md:col-span-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Dispatch Status</span>
            <div className="text-sm font-bold text-red-400 mt-0.5">SOS BEACON ACTIVE</div>
            <span className="text-[10px] text-slate-300">MRCC Chennai / Base 1554</span>
          </div>
        </div>

        {/* Google Maps Tracking Link Box */}
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 flex items-center justify-between gap-3">
          <div className="truncate">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Live Google Maps GPS Link:</span>
            <div className="text-xs text-cyan-300 truncate font-mono">{mapsLink}</div>
          </div>
          <button
            onClick={copyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold shrink-0 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>
        </div>

        {/* In-App Direct Satellite Voice Intercom Panel */}
        {isInCall ? (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/50 flex flex-col items-center gap-3 text-center animate-in zoom-in-95">
            <div className="flex items-center gap-2 text-xs font-bold text-red-300">
              <Radio className="w-4 h-4 text-red-400 animate-spin" />
              <span>LIVE SATELLITE RF CARRIER – INDIAN COAST GUARD (1554)</span>
            </div>

            {/* Audio Waveform Animation */}
            <div className="flex items-center gap-1.5 h-8">
              {[12, 24, 18, 28, 14, 22, 10, 26, 16, 20].map((h, i) => (
                <span
                  key={i}
                  style={{
                    height: `${h}px`,
                    animation: `wave-anim 0.8s ease-in-out infinite ${i * 0.1}s`,
                  }}
                  className="w-1.5 bg-red-400 rounded-full"
                ></span>
              ))}
            </div>

            <div className="text-lg font-mono font-black text-white">
              {Math.floor(callTimer / 60)
                .toString()
                .padStart(2, '0')}
              :{(callTimer % 60).toString().padStart(2, '0')}
            </div>

            <button
              onClick={handleEndCall}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase transition-all shadow-lg"
            >
              <PhoneOff className="w-4 h-4" />
              End Satellite Intercom
            </button>
          </div>
        ) : null}

        {/* Family Automated Dispatch Status Matrix */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              Family Emergency Contacts Status (Automatic Dispatch)
            </span>
            <span className="text-[10px] text-emerald-400 font-bold uppercase">ACK RECEIVED</span>
          </div>

          <div className="flex flex-col gap-1.5 text-xs text-slate-300">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span>Father: M. Karuppan (+91 98401 23456)</span>
              <span className="text-emerald-400 font-semibold text-[11px]">✓ Coordinates SMS Sent</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span>Mother: K. Lakshmi (+91 98402 34567)</span>
              <span className="text-emerald-400 font-semibold text-[11px]">✓ Emergency Audio Call Alerted</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span>Spouse: R. Selvi (+91 94432 78901)</span>
              <span className="text-emerald-400 font-semibold text-[11px]">✓ WhatsApp Location Delivered</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {!isInCall && (
            <button
              onClick={handleStartCall}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-red-900/40"
            >
              <PhoneCall className="w-4 h-4" />
              Direct Satellite Radio to Coast Guard (1554)
            </button>
          )}

          <button
            onClick={handleSendWhatsApp}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-900/40"
          >
            <Send className="w-4 h-4" />
            Distress WhatsApp to Family Contacts
          </button>
        </div>
      </div>
    </div>
  );
};
