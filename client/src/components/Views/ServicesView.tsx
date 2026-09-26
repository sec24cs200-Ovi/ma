import React from 'react';
import { ShoppingBag, Camera, Users, Building, Plus, CheckCircle, Clock } from 'lucide-react';
import { CatchAuction } from '../../types';

interface ServicesViewProps {
  auctions: CatchAuction[];
  onOpenAuctionModal: () => void;
  onShowToast: (title: string, msg: string, type: 'info' | 'success' | 'error') => void;
}

export const ServicesView: React.FC<ServicesViewProps> = ({
  auctions,
  onOpenAuctionModal,
  onShowToast,
}) => {
  const nearbyBuyers = [
    { name: 'Kasimedu Wholesale Fish Traders Association', phone: '+91 94440 12890', need: 'Yellowfin Tuna, Seer Fish (500+ kg)' },
    { name: 'Rameswaram Sea Harvest Exporters', phone: '+91 98421 55678', need: 'Export Grade Jumbo Tiger Prawns' },
    { name: 'Mandapam Fresh Marine Cooperative', phone: '+91 94432 99012', need: 'Squid, Ribbonfish, King Mackerel' },
  ];

  const hotelBuyers = [
    { hotel: 'Taj Fisherman’s Cove Resort & Spa', contact: 'Executive Chef Anand', demand: 'Daily 40kg Premium Catch' },
    { hotel: 'ITC Grand Chola Marine Procurement', contact: 'Supply Lead Raghavan', demand: 'Weekly 150kg Reef Cod & Pomfret' },
  ];

  return (
    <div className="flex flex-col gap-5 p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/40 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Fisherman Direct Market & Harbor Auctions
              <span className="text-[10px] bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded font-bold">
                0% MIDDLEMAN COMMISSION
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Post fresh catch with verified photos, connect directly with local wholesale traders, and secure restaurant procurement contracts.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenAuctionModal}
          className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md"
        >
          <Camera className="w-4 h-4" />
          Post New Catch
        </button>
      </div>

      {/* Live Auctions Board */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Live Harbor Catch Auctions</span>
            <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-bold">
              {auctions.length} ACTIVE LISTINGS
            </span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {auctions.map((auc) => (
            <div
              key={auc.id}
              className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between gap-3 shadow-md"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-cyan-300">{auc.species}</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> VERIFIED
                  </span>
                </div>

                <div className="text-xl font-black text-white font-mono">
                  {auc.quantityKg} kg
                  <span className="text-xs font-normal text-slate-400 ml-2">
                    @ ₹{auc.pricePerKg} / kg
                  </span>
                </div>

                <div className="text-xs text-slate-400 mt-2">
                  <div>Harbor: <strong className="text-slate-200">{auc.harbor}</strong></div>
                  <div>Seller: <span className="text-slate-300">{auc.sellerVessel}</span></div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {auc.timeAgo}
                </span>
                <button
                  onClick={() =>
                    onShowToast(
                      'Buyer Contact Dispatched',
                      `Connecting with seller of ${auc.species} (${auc.quantityKg} kg).`,
                      'success'
                    )
                  }
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-[11px] transition-colors"
                >
                  Contact Seller
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column: Nearby Wholesale Buyers & Restaurant Procurement Previews */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        {/* Column 1: Nearby Retail & Wholesale Buyers */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            Verified Wholesale & Harbor Market Buyers
          </h3>

          <div className="flex flex-col gap-2">
            {nearbyBuyers.map((buyer, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col gap-1 text-xs"
              >
                <div className="flex justify-between items-center font-bold">
                  <span className="text-white">{buyer.name}</span>
                  <span className="text-cyan-400 font-mono text-[11px]">{buyer.phone}</span>
                </div>
                <div className="text-[11px] text-slate-400">Demand: <span className="text-slate-300">{buyer.need}</span></div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Hotel & Restaurant Procurement */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Building className="w-4 h-4 text-emerald-400" />
            Premium Hotel & Restaurant Procurement Contracts
          </h3>

          <div className="flex flex-col gap-2">
            {hotelBuyers.map((hb, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col gap-1 text-xs"
              >
                <div className="flex justify-between items-center font-bold">
                  <span className="text-white">{hb.hotel}</span>
                  <span className="text-emerald-400 font-mono text-[11px]">{hb.contact}</span>
                </div>
                <div className="text-[11px] text-slate-400">Weekly Requirement: <span className="text-emerald-300 font-semibold">{hb.demand}</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
