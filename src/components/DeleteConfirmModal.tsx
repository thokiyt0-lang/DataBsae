import React, { useState } from 'react';
import { useDb } from '../context/DbContext';
import { X, Trash2, AlertTriangle } from 'lucide-react';

export const DeleteConfirmModal: React.FC = () => {
  const { activeModal, setActiveModal, selectedRecord, deleteRecord } = useDb();
  const [isDeleting, setIsDeleting] = useState(false);

  if (activeModal !== 'delete' || !selectedRecord) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    const success = await deleteRecord(selectedRecord.id);
    setIsDeleting(false);
    if (success) {
      setActiveModal(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-5 bg-rose-50 dark:bg-rose-950/30 border-b border-rose-200 dark:border-rose-900/40 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-500">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-rose-900 dark:text-rose-200">Confirm Record Deletion</h3>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-3 text-sm">
          <p className="text-slate-700 dark:text-slate-300">
            Are you sure you want to permanently delete this record from the database table?
          </p>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <p className="font-bold text-slate-900 dark:text-white">{selectedRecord.name}</p>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{selectedRecord.email}</p>
            <p className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono mt-1">ID: {selectedRecord.id}</p>
          </div>

          <p className="text-xs text-rose-500 font-semibold">
            This action executing a SQL DELETE query cannot be undone.
          </p>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-3">
          <button
            onClick={() => setActiveModal(null)}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all disabled:opacity-50 flex items-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isDeleting ? 'Deleting...' : 'Delete Record'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
