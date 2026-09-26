import React from 'react';
import { Landmark, ShieldCheck, CheckCircle2, X } from 'lucide-react';
import { GovtScheme } from '../../types';

interface GovtSchemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  scheme: GovtScheme | null;
  onApply: (schemeId: string) => void;
}

export const GovtSchemeModal: React.FC<GovtSchemeModalProps> = ({
  isOpen,
  onClose,
  scheme,
  onApply,
}) => {
  if (!isOpen || !scheme) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#090f1d] border border-teal-500/40 shadow-2xl p-6 flex flex-col gap-4 text-white">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Landmark className="w-5 h-5 text-teal-400" />
            <h3 className="text-base font-bold text-white">Direct Scheme Application</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-3 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Scheme Title</span>
            <h4 className="text-sm font-bold text-teal-300 mt-0.5">{scheme.title}</h4>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400">Financial Benefit / Subsidy</span>
            <div className="text-xs font-bold text-emerald-400 mt-1">{scheme.subsidy}</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400">Department</span>
            <div className="text-xs text-slate-200 mt-0.5">{scheme.department}</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400">Eligibility Criteria</span>
            <div className="text-xs text-slate-300 mt-0.5 leading-relaxed">{scheme.eligibility}</div>
          </div>

          <div className="p-3 rounded-xl bg-teal-950/40 border border-teal-500/30 flex items-center gap-2.5 text-teal-200">
            <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
            <span>
              Your verified Vessel ID (<strong>IND-TN-10-MM-4421</strong>) and biometric fisherman card will be automatically attached.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onApply(scheme.id);
              onClose();
            }}
            className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            Submit DBT Application
          </button>
        </div>
      </div>
    </div>
  );
};
