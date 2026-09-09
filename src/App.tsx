import React, { useState } from 'react';
import { DbProvider, useDb } from './context/DbContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { LoginPage } from './components/LoginPage';
import { DashboardView } from './components/DashboardView';
import { DatabaseRecordsPage } from './components/DatabaseRecordsPage';
import { DatabaseTestPage } from './components/DatabaseTestPage';
import { SchemaModal } from './components/SchemaModal';
import { AddRecordModal } from './components/AddRecordModal';
import { EditRecordModal } from './components/EditRecordModal';
import { RecordDetailsModal } from './components/RecordDetailsModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { SettingsModal } from './components/SettingsModal';
import { ToastContainer } from './components/Toast';

const MainLayout: React.FC = () => {
  const { isAuthenticated, activeTab } = useDb();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'records' && <DatabaseRecordsPage />}
          {activeTab === 'test' && <DatabaseTestPage />}
          {activeTab === 'schema' && <SchemaModal />}
        </main>
      </div>

      {/* Interactive Modals */}
      <AddRecordModal />
      <EditRecordModal />
      <RecordDetailsModal />
      <DeleteConfirmModal />
      <SettingsModal />
      <SchemaModal />

      {/* Toast Alert System */}
      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <DbProvider>
      <MainLayout />
    </DbProvider>
  );
}

export default App;
