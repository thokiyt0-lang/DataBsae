import React from 'react';
import { useDb } from '../context/DbContext';
import { X, Eye, Copy, Calendar, Mail, Phone, MapPin, Hash, User, ShieldCheck } from 'lucide-react';

export const RecordDetailsModal: React.FC = () => {
  const { activeModal, setActiveModal, selectedRecord, addToast } = useDb();

  if (activeModal !== 'details' || !selectedRecord) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(selectedRecord.id);
    addToast('info', 'ID Copied', 'Record UUID copied to clipboard.');
  };

  const getStatusBadge = () => {
    switch (selectedRecord.status) {
      case 'Active':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30';
      case 'Pending':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/30';
      case 'Inactive':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="p-5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Record Details</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Database Entry View</p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-sm">
          
          {/* Record UUID */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Hash className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">UUID Primary Key</p>
                <p className="font-mono text-xs font-semibold text-cyan-600 dark:text-cyan-400 break-all">{selectedRecord.id}</p>
              </div>
            </div>
            <button
              onClick={handleCopyId}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Copy UUID"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>

          {/* Name & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-slate-400 flex items-center space-x-1 mb-1">
                <User className="w-3.5 h-3.5" />
                <span>Full Name</span>
              </span>
              <p className="font-bold text-base text-slate-900 dark:text-white">{selectedRecord.name}</p>
            </div>

            <div>
              <span className="text-xs text-slate-400 flex items-center space-x-1 mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Current Status</span>
              </span>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge()}`}>
                {selectedRecord.status}
              </span>
            </div>
          </div>

          {/* Email */}
          <div>
            <span className="text-xs text-slate-400 flex items-center space-x-1 mb-1">
              <Mail className="w-3.5 h-3.5" />
              <span>Email Address</span>
            </span>
            <p className="font-mono text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg border border-slate-200/60 dark:border-slate-800">
              {selectedRecord.email}
            </p>
          </div>

          {/* Phone */}
          <div>
            <span className="text-xs text-slate-400 flex items-center space-x-1 mb-1">
              <Phone className="w-3.5 h-3.5" />
              <span>Phone Number</span>
            </span>
            <p className="text-slate-800 dark:text-slate-200">
              {selectedRecord.phone || <span className="italic text-slate-400">Not provided</span>}
            </p>
          </div>

          {/* Address */}
          <div>
            <span className="text-xs text-slate-400 flex items-center space-x-1 mb-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>Address</span>
            </span>
            <p className="text-slate-800 dark:text-slate-200">
              {selectedRecord.address || <span className="italic text-slate-400">Not provided</span>}
            </p>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
            <div>
              <span className="flex items-center space-x-1 mb-0.5 text-slate-400">
                <Calendar className="w-3.5 h-3.5" />
                <span>Created At</span>
              </span>
              <p className="font-mono text-slate-700 dark:text-slate-300">
                {selectedRecord.created_at ? new Date(selectedRecord.created_at).toLocaleString() : 'N/A'}
              </p>
            </div>

            <div>
              <span className="flex items-center space-x-1 mb-0.5 text-slate-400">
                <Calendar className="w-3.5 h-3.5" />
                <span>Updated At</span>
              </span>
              <p className="font-mono text-slate-700 dark:text-slate-300">
                {selectedRecord.updated_at ? new Date(selectedRecord.updated_at).toLocaleString() : 'N/A'}
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 text-right">
          <button
            onClick={() => setActiveModal(null)}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
