import React from 'react';
import { useDb } from '../context/DbContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useDb();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-3 max-w-md w-full px-4 pointer-events-none">
      {toasts.map(toast => {
        const getStyles = () => {
          switch (toast.type) {
            case 'success':
              return 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200 shadow-emerald-950/50';
            case 'error':
              return 'bg-rose-950/90 border-rose-500/50 text-rose-200 shadow-rose-950/50';
            case 'warning':
              return 'bg-amber-950/90 border-amber-500/50 text-amber-200 shadow-amber-950/50';
            default:
              return 'bg-sky-950/90 border-sky-500/50 text-sky-200 shadow-sky-950/50';
          }
        };

        const getIcon = () => {
          switch (toast.type) {
            case 'success':
              return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />;
            case 'error':
              return <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />;
            case 'warning':
              return <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />;
            default:
              return <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />;
          }
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start space-x-3 p-4 rounded-xl border backdrop-blur-md shadow-lg transition-all duration-300 transform translate-y-0 ${getStyles()}`}
          >
            {getIcon()}
            <div className="flex-1 text-sm">
              <p className="font-semibold">{toast.title}</p>
              {toast.description && (
                <p className="mt-0.5 opacity-90 text-xs leading-relaxed">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="opacity-70 hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
