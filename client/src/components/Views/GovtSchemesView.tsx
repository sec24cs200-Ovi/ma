import React, { useState } from 'react';
import { Landmark, CheckCircle, Clock, ExternalLink, ShieldCheck } from 'lucide-react';
import { GOVT_SCHEMES } from '../../data/mockData';
import { GovtScheme } from '../../types';

interface GovtSchemesViewProps {
  onSelectSchemeForApplication: (scheme: GovtScheme) => void;
  appliedSchemes: Record<string, boolean>;
}

export const GovtSchemesView: React.FC<GovtSchemesViewProps> = ({
  onSelectSchemeForApplication,
  appliedSchemes,
}) => {
  const [filter, setFilter] = useState<'all' | 'subsidy' | 'welfare' | 'scholarship'>('all');

  const filtered = GOVT_SCHEMES.filter(
    (s) => filter === 'all' || s.category === filter
  );

  return (
    <div className="flex flex-col gap-5 p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center">
            <Landmark className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Government Schemes, Welfare Benefits & Scholarships
              <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded font-bold">
                DBT VERIFIED PORTAL
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Apply directly with your registered vessel ID (IND-TN-10-MM-4421) and Aadhaar biometric fisherman card.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'All Schemes (5)' },
          { id: 'subsidy', label: 'Capital Subsidies & Loans' },
          { id: 'welfare', label: 'Welfare & Ban Relief' },
          { id: 'scholarship', label: 'Educational Scholarships' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              filter === tab.id
                ? 'bg-teal-500/20 text-teal-300 border-teal-500/50 shadow-md'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((scheme) => {
          const isApplied = appliedSchemes[scheme.id] || scheme.status === 'Applied';
          const isApproved = scheme.status === 'Approved';

          return (
            <div
              key={scheme.id}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-teal-500/40 transition-all flex flex-col justify-between gap-4 shadow-md"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-sm font-bold text-white leading-snug">{scheme.title}</h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase shrink-0 ${
                      isApproved
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : isApplied
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    }`}
                  >
                    {isApproved ? 'APPROVED / ACTIVE' : isApplied ? 'APPLICATION SUBMITTED' : 'OPEN'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 my-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Direct Benefit / Amount:</span>
                  <div className="text-xs font-bold text-emerald-400 mt-0.5">{scheme.subsidy}</div>
                </div>

                <div className="text-xs text-slate-400">
                  <span className="text-slate-500">Department:</span> {scheme.department}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  <span className="text-slate-500">Eligibility:</span> {scheme.eligibility}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-teal-400 flex items-center gap-1 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Auto-link Vessel IND-TN-10
                </span>

                {isApplied || isApproved ? (
                  <button
                    disabled
                    className="px-3.5 py-2 rounded-xl bg-slate-800 text-emerald-400 text-xs font-bold cursor-default flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    {isApproved ? 'Granted' : 'In Review'}
                  </button>
                ) : (
                  <button
                    onClick={() => onSelectSchemeForApplication(scheme)}
                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                  >
                    Apply Now
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
