import React, { useState } from 'react';
import { useDb } from '../context/DbContext';
import { X, FileCode2, Copy, Check, Terminal, ExternalLink } from 'lucide-react';

const SQL_SCHEMA_CONTENT = `-- ========================================================
-- Supabase Database Testing Dashboard - Schema & RLS Setup
-- ========================================================
-- Execute this SQL in your Supabase Dashboard -> SQL Editor

-- 1. Create the \`records\` table
CREATE TABLE IF NOT EXISTS public.records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Pending', 'Inactive', 'Archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.records ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies for testing
DROP POLICY IF EXISTS "Allow public read access" ON public.records;
DROP POLICY IF EXISTS "Allow public insert access" ON public.records;
DROP POLICY IF EXISTS "Allow public update access" ON public.records;
DROP POLICY IF EXISTS "Allow public delete access" ON public.records;

CREATE POLICY "Allow public read access" ON public.records FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.records FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.records FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.records FOR DELETE USING (true);
`;

export const SchemaModal: React.FC = () => {
  const { activeModal, setActiveModal, activeTab, addToast } = useDb();
  const [copied, setCopied] = useState(false);

  const isModalOpen = activeModal === 'sql';
  const isTabView = activeTab === 'schema';

  if (!isModalOpen && !isTabView) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SCHEMA_CONTENT);
    setCopied(true);
    addToast('success', 'SQL Copied', 'Copied database creation script to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  const Content = (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-700 dark:text-blue-300 text-xs leading-relaxed flex items-start space-x-3">
        <Terminal className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-sm mb-0.5">Quick Setup Instructions</p>
          <ol className="list-decimal list-inside space-y-1 opacity-90">
            <li>Click <strong>Copy SQL Script</strong> below.</li>
            <li>Open your Supabase Project Dashboard and navigate to the <strong>SQL Editor</strong>.</li>
            <li>Paste and click <strong>Run</strong> to create the <code className="bg-blue-900/40 px-1 rounded text-cyan-300">records</code> table and enable RLS policies.</li>
          </ol>
        </div>
      </div>

      {/* Code container */}
      <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-emerald-400 overflow-x-auto shadow-inner">
        <button
          onClick={handleCopySql}
          className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-sans font-semibold flex items-center space-x-1.5 transition-colors z-10"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied!' : 'Copy SQL Script'}</span>
        </button>

        <pre className="pt-8 leading-relaxed whitespace-pre-wrap">{SQL_SCHEMA_CONTENT}</pre>
      </div>
    </div>
  );

  // If viewed as modal window
  if (isModalOpen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
          
          <div className="p-5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                <FileCode2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Supabase SQL Schema & RLS</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">PostgreSQL DDL script for public.records table</p>
              </div>
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {Content}
          </div>

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
  }

  // If viewed as dedicated tab page
  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <FileCode2 className="w-5 h-5 text-purple-500" />
            <span>Database SQL Schema & RLS Policies</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Copy and paste this script into your Supabase SQL Editor
          </p>
        </div>

        <a
          href="https://supabase.com/dashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
        >
          <span>Open Supabase Console</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {Content}
    </div>
  );
};
