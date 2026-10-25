import React, { useEffect, useState } from 'react';
import {
  PhoneCall,
  ShieldAlert,
  AlertTriangle,
  RotateCcw,
  Volume2,
  CheckCircle2,
  X,
  Radio,
} from 'lucide-react';
import { triggerEmergencyCall } from '../../utils/callHelper';

interface BorderBreachCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  coords: string;
  distanceNM: string;
  headingCompass: string;
  onCorrectCourse?: () => void;
  onTriggerSos?: () => void;
}

export const BorderBreachCallModal: React.FC<BorderBreachCallModalProps> = ({
  isOpen,
  onClose,
  coords,
  distanceNM,
  headingCompass,
  onCorrectCourse,
  onTriggerSos,
}) => {
  const emergencyPersonNumber = '8122566828';
  const [callStatus, setCallStatus] = useState<'CONNECTING' | 'DIALED'>('CONNECTING');
  const [countdown, setCountdown] = useState<number>(3);

  useEffect(() => {
    if (!isOpen) return;

    setCallStatus('CONNECTING');
    setCountdown(3);

    // Initial automated call trigger
    triggerEmergencyCall(emergencyPersonNumber, 'Automatic IMBL Border Breach');

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCallStatus('DIALED');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleManualRedial = () => {
    setCallStatus('CONNECTING');
    triggerEmergencyCall(emergencyPersonNumber, 'User Redial Button');
    setTimeout(() => setCallStatus('DIALED'), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#19080b] via-[#0f0e1a] to-[#070d18] border-2 border-red-500/80 rounded-3xl shadow-[0_0_50px_rgba(239,68,68,0.4)] p-5 flex flex-col gap-4 text-center overflow-hidden">
        {/* Pulsing Red Emergency Beacon Strip */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-amber-400 to-red-600 animate-pulse" />

        {/* Top Dismiss Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-xl bg-slate-900/80 text-slate-400 hover:text-white transition-all active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon Badge */}
        <div className="mx-auto mt-1 relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-red-600/20 border-2 border-red-500 flex items-center justify-center animate-ping absolute inset-0" />
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-600 to-rose-700 border-2 border-red-400 flex items-center justify-center shadow-lg shadow-red-950/80 relative z-10">
            <PhoneCall className="w-8 h-8 text-white animate-bounce" />
          </div>
        </div>

        {/* Header Title */}
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-black tracking-wider uppercase mb-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            BORDER BREACH DETECTED
          </span>
          <h2 className="text-xl font-black text-white tracking-tight">
            Emergency Call Dispatched!
          </h2>
          <p className="text-xs text-rose-200/90 mt-1">
            Vessel IND-TN-10 crossed the Indo-Sri Lanka IMBL border. Auto-connecting to safety authorities.
          </p>
        </div>

        {/* Dialed Contact Card */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-red-500/40 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Emergency Contact:</span>
            <span className="font-bold text-white">Duty Officer / Inspector S. Vignesh</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Target Phone:</span>
            <span className="text-lg font-black font-mono text-cyan-300 tracking-wider">
              {emergencyPersonNumber}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
            <span className="text-slate-400">GPS Position:</span>
            <span className="font-mono text-slate-200">{coords}</span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Heading & Drift:</span>
            <span className="font-mono text-amber-300 font-bold">{headingCompass}</span>
          </div>
        </div>

        {/* Status Chip */}
        <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-500/30 flex items-center justify-center gap-2 text-xs font-bold text-rose-200">
          <Radio className="w-4 h-4 text-red-400 animate-pulse" />
          {callStatus === 'CONNECTING' ? (
            <span>Dialer Triggering in {countdown}s...</span>
          ) : (
            <span className="text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Call Initiated to {emergencyPersonNumber}
            </span>
          )}
        </div>

        {/* Big Action Buttons */}
        <div className="flex flex-col gap-2 pt-1">
          {/* Direct 1-Tap Call / Redial Button */}
          <button
            onClick={handleManualRedial}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm tracking-wide uppercase border border-emerald-400/50 shadow-lg shadow-emerald-950/80 flex items-center justify-center gap-2.5 transition-all active:scale-95"
          >
            <PhoneCall className="w-5 h-5 fill-current" />
            <span>📞 Call Person ({emergencyPersonNumber})</span>
          </button>

          {/* Quick Course Correction Button */}
          {onCorrectCourse && (
            <button
              onClick={() => {
                onCorrectCourse();
                onClose();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Turn Boat Back 180° to Indian Waters</span>
            </button>
          )}

          {/* SOS Dispatch Button */}
          {onTriggerSos && (
            <button
              onClick={() => {
                onTriggerSos();
                onClose();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900/80 text-rose-300 border border-red-900/60 font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Broadcast ISRO NavIC SOS Distress Transponder</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
