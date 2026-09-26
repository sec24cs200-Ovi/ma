import React, { useState } from 'react';
import { Upload, Camera, Check, X } from 'lucide-react';
import { CatchAuction } from '../../types';

interface CatchAuctionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAuction: (auction: CatchAuction) => void;
  onShowToast: (title: string, msg: string, type: 'info' | 'success' | 'error') => void;
}

export const CatchAuctionModal: React.FC<CatchAuctionModalProps> = ({
  isOpen,
  onClose,
  onAddAuction,
  onShowToast,
}) => {
  const [species, setSpecies] = useState('Yellowfin Tuna');
  const [quantity, setQuantity] = useState('150');
  const [price, setPrice] = useState('340');
  const [harbor, setHarbor] = useState('Rameswaram Fishing Jetty');
  const [fileName, setFileName] = useState('catch_verified_01.jpg');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAuction: CatchAuction = {
      id: `auc-${Date.now()}`,
      species,
      quantityKg: parseFloat(quantity) || 100,
      pricePerKg: parseFloat(price) || 300,
      harbor,
      sellerVessel: 'IND-TN-10-MM-4421 (Capt. Rameshan)',
      timeAgo: 'Just now',
      verified: true,
    };

    onAddAuction(newAuction);
    onShowToast(
      'Catch Auction Listed!',
      `${species} (${quantity} kg) published to local harbor buyer network at ₹${price}/kg.`,
      'success'
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-[#090f1d] border border-cyan-500/40 shadow-2xl p-6 flex flex-col gap-4 text-white">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Publish Catch to Harbor Auction</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-300">Fish / Marine Species:</label>
            <input
              type="text"
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-300">Quantity (kg):</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-cyan-500"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-300">Asking Price (₹/kg):</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-cyan-500"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-300">Target Harbor / Landing Center:</label>
            <select
              value={harbor}
              onChange={(e) => setHarbor(e.target.value)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-cyan-500"
            >
              <option value="Rameswaram Fishing Jetty">Rameswaram Fishing Jetty</option>
              <option value="Mandapam Marine Terminal">Mandapam Marine Terminal</option>
              <option value="Kasimedu Harbor Chennai">Kasimedu Harbor Chennai</option>
              <option value="Thoothukudi Old Port">Thoothukudi Old Port</option>
            </select>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-dashed border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Upload className="w-4 h-4 text-cyan-400" />
              <span>{fileName}</span>
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">
              VERIFIED
            </span>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider transition-all"
          >
            Post Catch Auction
          </button>
        </form>
      </div>
    </div>
  );
};
