import React from 'react';
import { useDb } from '../context/DbContext';
import { 
  Database, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Activity, 
  Users, 
  FileCode, 
  Terminal,
  ArrowUpRight,
  RefreshCw
} from 'lucide-react';


export const DashboardView: React.FC = () => {
  const { 
    isConnected, 
    isCheckingConnection, 
    connectionMessage, 
    connectionLatency, 
    checkConnection, 
    records, 
    totalRecordsCount,
    activityLogs, 
    setActiveTab, 
    setActiveModal,
    config
  } = useDb();

  // Statistics calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const recordsAddedToday = records.filter(r => {
    if (!r.created_at) return false;
    return r.created_at.startsWith(todayStr);
  }).length;

  const activeCount = records.filter(r => r.status === 'Active').length;

  const lastUpdated = records.length > 0
    ? new Date(Math.max(...records.map(r => new Date(r.updated_at || r.created_at || Date.now()).getTime()))).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'N/A';

  return (
    <div className="space-y-6">
      {/* 1. Connection Status Banner */}
      <div className={`p-6 rounded-2xl border transition-all duration-300 ${
        isConnected
          ? 'bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-500/40 text-emerald-100 shadow-lg shadow-emerald-950/20'
          : 'bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 border-rose-500/40 text-rose-100 shadow-lg shadow-rose-950/20'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className={`p-3 rounded-2xl mt-0.5 ${
              isConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
            }`}>
              {isConnected ? <CheckCircle2 className="w-7 h-7" /> : <XCircle className="w-7 h-7" />}
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {isConnected ? '🟢 Database Connected' : '🔴 Database Disconnected'}
                </h3>
                {isConnected && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono font-semibold">
                    {connectionLatency}ms ping
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 font-mono break-all">
                {connectionMessage}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Endpoint: <span className="font-mono text-cyan-400">{config.url || 'Not configured'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => checkConnection()}
              disabled={isCheckingConnection}
              className="px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex items-center space-x-2 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isCheckingConnection ? 'animate-spin text-cyan-400' : ''}`} />
              <span>Test Database Connection</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Total Records */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Records</span>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
              <Database className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {totalRecordsCount}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center space-x-1">
            <span className="text-emerald-500 font-semibold">{records.length} synced</span>
            <span>in local buffer</span>
          </p>
        </div>

        {/* Stat 2: Records Added Today */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Added Today</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Plus className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            +{recordsAddedToday}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            New entries inserted today
          </p>
        </div>

        {/* Stat 3: Last Updated */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Last Updated</span>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
            {lastUpdated}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Latest table row timestamp
          </p>
        </div>

        {/* Stat 4: Active Status Count */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Records</span>
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-500">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {activeCount}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {totalRecordsCount > 0 ? Math.round((activeCount / totalRecordsCount) * 100) : 0}% active ratio
          </p>
        </div>
      </div>

      {/* 3. Main Dashboard Grid: Activity Stream & Quick Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Recent Database Activity Stream */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-cyan-500" />
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Recent Database Activity</h3>
              </div>
              <span className="text-xs text-slate-500 font-mono">Real-time log</span>
            </div>

            {activityLogs.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <p className="text-sm">No activity recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {activityLogs.slice(0, 8).map(log => {
                  const getActionBadge = () => {
                    switch (log.action) {
                      case 'INSERT':
                        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30';
                      case 'SELECT':
                        return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
                      case 'UPDATE':
                        return 'bg-amber-500/10 text-amber-500 border-amber-500/30';
                      case 'DELETE':
                        return 'bg-rose-500/10 text-rose-500 border-rose-500/30';
                      case 'CONNECT':
                        return 'bg-purple-500/10 text-purple-500 border-purple-500/30';
                      default:
                        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
                    }
                  };

                  return (
                    <div
                      key={log.id}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start space-x-3">
                        <span className={`px-2 py-0.5 rounded-md font-mono font-bold text-[10px] border ${getActionBadge()}`}>
                          {log.action}
                        </span>
                        <div>
                          <p className="text-slate-800 dark:text-slate-200 font-medium">{log.details}</p>
                          {log.executionTimeMs !== undefined && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              Executed in {log.executionTimeMs}ms
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {log.timestamp}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500">Showing latest database transactions</span>
            <button
              onClick={() => setActiveTab('test')}
              className="text-cyan-500 hover:text-cyan-400 font-semibold flex items-center space-x-1"
            >
              <span>Open Test Suite Console</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column: Quick Action Cards */}
        <div className="space-y-4">
          
          {/* Card 1: Records Table Link */}
          <div 
            onClick={() => setActiveTab('records')}
            className="p-5 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/20 cursor-pointer group hover:scale-[1.01] transition-transform"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-white/20">
                <Database className="w-6 h-6 text-white" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-white/80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
            <h4 className="font-bold text-lg">Manage Database Records</h4>
            <p className="text-xs text-white/80 mt-1">
              Add, edit, search, filter, and delete records in your Supabase table.
            </p>
          </div>

          {/* Card 2: Test Suite Console Link */}
          <div 
            onClick={() => setActiveTab('test')}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-cyan-500 dark:hover:border-cyan-500 cursor-pointer group transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
                <Terminal className="w-6 h-6" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-cyan-500 transition-colors" />
            </div>
            <h4 className="font-bold text-base text-slate-900 dark:text-white">Database Test Page</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Run automated INSERT, SELECT, UPDATE, DELETE benchmarks with live console log outputs.
            </p>
          </div>

          {/* Card 3: SQL DDL & Schema */}
          <div 
            onClick={() => setActiveModal('sql')}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-500 dark:hover:border-purple-500 cursor-pointer group transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500">
                <FileCode className="w-6 h-6" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-purple-500 transition-colors" />
            </div>
            <h4 className="font-bold text-base text-slate-900 dark:text-white">SQL Schema & RLS Setup</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Copy table DDL and Row Level Security setup commands for your Supabase project.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
