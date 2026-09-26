import React from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'error';
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[99999] flex flex-col gap-3 max-w-md pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto p-4 rounded-xl shadow-2xl backdrop-blur-md flex items-start gap-3 border transition-all duration-300 animate-in slide-in-from-right-8 ${
            toast.type === 'error'
              ? 'bg-red-950/90 border-red-500/60 text-red-100 glow-red'
              : toast.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/60 text-emerald-100 glow-emerald'
              : 'bg-slate-900/90 border-cyan-500/60 text-cyan-100 glow-cyan'
          }`}
        >
          <div className="mt-0.5 shrink-0">
            {toast.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-red-400" />
            ) : toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            ) : (
              <Info className="w-5 h-5 text-cyan-400" />
            )}
          </div>
          <div className="flex-1 pr-2">
            <h4 className="text-sm font-bold text-white mb-0.5">{toast.title}</h4>
            <p className="text-xs text-slate-300 leading-relaxed">{toast.message}</p>
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
