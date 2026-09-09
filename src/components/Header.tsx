import React from 'react';
import { useDb } from '../context/DbContext';
import { Menu, Plus, Zap, Settings, Code2 } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { 
    activeTab, 
    isConnected, 
    connectionLatency, 
    checkConnection, 
    isCheckingConnection, 
    setActiveModal,
    setActiveTab 
  } = useDb();

  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'System Dashboard';
      case 'records':
        return 'Database Records';
      case 'test':
        return 'Database Test Console';
      case 'schema':
        return 'SQL Schema & RLS Setup';
      default:
        return 'Dashboard';
    }
  };

  const getSubtitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Real-time database connectivity metrics and recent activity';
      case 'records':
        return 'Perform full CRUD operations on PostgreSQL table';
      case 'test':
        return 'Dedicated connection and automated CRUD operation testing suite';
      case 'schema':
        return 'View table creation DDL and Row Level Security policies';
      default:
        return '';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-4 transition-colors">
      <div className="flex items-center justify-between">
        {/* Left Section: Mobile Menu Toggle & Title */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {getTitle()}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 hidden sm:block">
              {getSubtitle()}
            </p>
          </div>
        </div>

        {/* Right Section: Status Indicator & Quick Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Latency Pill */}
          {isConnected && (
            <div className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{connectionLatency} ms</span>
            </div>
          )}

          {/* Test Connection Button */}
          <button
            onClick={() => checkConnection()}
            disabled={isCheckingConnection}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            <Zap className={`w-4 h-4 ${isCheckingConnection ? 'animate-spin text-amber-500' : 'text-amber-500'}`} />
            <span className="hidden sm:inline">Test Connection</span>
          </button>

          {/* Quick Add Record */}
          <button
            onClick={() => {
              setActiveTab('records');
              setActiveModal('add');
            }}
            className="flex items-center space-x-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Record</span>
          </button>

          {/* SQL Setup Trigger */}
          <button
            onClick={() => setActiveModal('sql')}
            title="SQL Schema DDL"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Code2 className="w-4 h-4" />
          </button>

          {/* Settings Trigger */}
          <button
            onClick={() => setActiveModal('settings')}
            title="Database Credentials"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
