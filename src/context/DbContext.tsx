import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { 
  DatabaseRecord, 
  ActivityLog, 
  SupabaseConfig, 
  ToastMessage, 
  ActivityAction,
  ActivityStatus 
} from '../types/database';

import { 
  supabase, 
  getSavedConfig, 
  updateSupabaseConfig, 
  checkSupabaseConnection 
} from '../lib/supabase';

interface DbContextType {
  // Auth state
  isAuthenticated: boolean;
  userEmail: string | null;
  login: (email: string) => void;
  logout: () => void;

  // DB Connection status
  isConnected: boolean;
  isCheckingConnection: boolean;
  connectionMessage: string;
  connectionLatency: number;
  checkConnection: () => Promise<boolean>;

  // Config
  config: SupabaseConfig;
  saveConfig: (url: string, key: string) => Promise<boolean>;

  // Records data
  records: DatabaseRecord[];
  isLoadingRecords: boolean;
  recordsError: string | null;
  totalRecordsCount: number;
  fetchRecords: () => Promise<void>;
  addRecord: (record: Omit<DatabaseRecord, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  updateRecord: (id: string, record: Partial<DatabaseRecord>) => Promise<boolean>;
  deleteRecord: (id: string) => Promise<boolean>;

  // Activity Logs
  activityLogs: ActivityLog[];
  addActivityLog: (
    action: ActivityAction, 
    status: ActivityStatus, 
    details: string, 
    executionTimeMs?: number, 
    payload?: any
  ) => void;
  clearActivityLogs: () => void;

  // UI Theme
  theme: 'dark' | 'light';
  toggleTheme: () => void;

  // Toasts
  toasts: ToastMessage[];
  addToast: (type: ToastMessage['type'], title: string, description?: string) => void;
  removeToast: (id: string) => void;

  // Modal Navigation
  activeModal: 'add' | 'edit' | 'details' | 'delete' | 'settings' | 'sql' | null;
  setActiveModal: (modal: 'add' | 'edit' | 'details' | 'delete' | 'settings' | 'sql' | null) => void;
  selectedRecord: DatabaseRecord | null;
  setSelectedRecord: (record: DatabaseRecord | null) => void;

  // View state
  activeTab: 'dashboard' | 'records' | 'test' | 'schema';
  setActiveTab: (tab: 'dashboard' | 'records' | 'test' | 'schema') => void;
}

const DbContext = createContext<DbContextType | undefined>(undefined);

// Initial fallback mock data when DB is not connected so user still has a rich UI preview
const INITIAL_DEMO_RECORDS: DatabaseRecord[] = [
  {
    id: 'c8914b10-234a-4b91-890a-112233445566',
    name: 'Alexander Pierce',
    email: 'alexander.pierce@example.com',
    phone: '+1 (555) 234-5678',
    address: '742 Evergreen Terrace, Springfield, OR',
    status: 'Active',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d4e5',
    name: 'Samantha Vance',
    email: 'samantha.vance@techcorp.io',
    phone: '+1 (555) 876-5432',
    address: '100 Silicon Way, San Francisco, CA',
    status: 'Active',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: '3b927a41-11ff-4654-9a88-7f9e0a1b2c3d',
    name: 'Marcus Brody',
    email: 'm.brody@museum.org',
    phone: '+1 (555) 345-6789',
    address: '15 Audit Lane, Boston, MA',
    status: 'Pending',
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: '9d8e7f6a-5b4c-3d2e-1f0a-9b8c7d6e5f4a',
    name: 'Elena Rostova',
    email: 'elena.rostova@cyberdyn.com',
    phone: '+1 (555) 901-2345',
    address: '88 Innovation Blvd, Austin, TX',
    status: 'Inactive',
    created_at: new Date(Date.now() - 86400000 * 12).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 6).toISOString(),
  }
];

export const DbProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('is_authenticated') === 'true';
  });
  const [userEmail, setUserEmail] = useState<string | null>(() => {
    return localStorage.getItem('user_email') || 'admin@databasetesting.io';
  });

  // Supabase Config
  const [config, setConfig] = useState<SupabaseConfig>(getSavedConfig());

  // Connection State
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState<boolean>(false);
  const [connectionMessage, setConnectionMessage] = useState<string>('Initializing database connection...');
  const [connectionLatency, setConnectionLatency] = useState<number>(0);

  // Records state
  const [records, setRecords] = useState<DatabaseRecord[]>(INITIAL_DEMO_RECORDS);
  const [isLoadingRecords, setIsLoadingRecords] = useState<boolean>(false);
  const [recordsError, setRecordsError] = useState<string | null>(null);
  const [totalRecordsCount, setTotalRecordsCount] = useState<number>(INITIAL_DEMO_RECORDS.length);

  // Activity Logs
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([
    {
      id: 'log-1',
      timestamp: new Date().toLocaleTimeString(),
      action: 'CONNECT',
      status: 'INFO',
      details: 'System initialized. Checking Supabase PostgreSQL configuration.'
    }
  ]);

  // UI Theme
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
    return 'dark';
  });

  // Navigation & Modals
  const [activeTab, setActiveTab] = useState<'dashboard' | 'records' | 'test' | 'schema'>('dashboard');
  const [activeModal, setActiveModal] = useState<'add' | 'edit' | 'details' | 'delete' | 'settings' | 'sql' | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<DatabaseRecord | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Apply dark mode class to root HTML element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const addToast = (type: ToastMessage['type'], title: string, description?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, type, title, description }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const addActivityLog = (
    action: ActivityAction,
    status: ActivityStatus,
    details: string,
    executionTimeMs?: number,
    payload?: any
  ) => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      action,
      status,
      details,
      executionTimeMs,
      payload
    };
    setActivityLogs(prev => [newLog, ...prev.slice(0, 99)]); // Keep last 100 logs
  };

  const clearActivityLogs = () => {
    setActivityLogs([]);
  };

  // Auth functions
  const login = (email: string) => {
    setIsAuthenticated(true);
    setUserEmail(email);
    localStorage.setItem('is_authenticated', 'true');
    localStorage.setItem('user_email', email);
    addToast('success', 'Logged In', `Welcome back, ${email}`);
    addActivityLog('CONNECT', 'SUCCESS', `User authenticated as ${email}`);
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('is_authenticated');
    addToast('info', 'Logged Out', 'You have been logged out.');
    addActivityLog('CONNECT', 'INFO', 'User logged out');
  };

  // Check Supabase connection
  const checkConnection = async (): Promise<boolean> => {
    setIsCheckingConnection(true);
    const result = await checkSupabaseConnection();
    setIsCheckingConnection(false);
    setIsConnected(result.connected);
    setConnectionMessage(result.message);
    setConnectionLatency(result.latencyMs);

    if (result.connected) {
      addActivityLog('CONNECT', 'SUCCESS', result.message, result.latencyMs);
      await fetchRecords();
    } else {
      addActivityLog('CONNECT', 'ERROR', result.message, result.latencyMs, result.error);
    }
    return result.connected;
  };

  // Save new Supabase credentials
  const saveConfig = async (url: string, key: string): Promise<boolean> => {
    const newClient = updateSupabaseConfig(url, key);
    setConfig({ url, anonKey: key });

    addToast('info', 'Testing Credentials...', 'Connecting to updated Supabase endpoint');
    const result = await checkSupabaseConnection(newClient);

    setIsConnected(result.connected);
    setConnectionMessage(result.message);
    setConnectionLatency(result.latencyMs);

    if (result.connected) {
      addToast('success', 'Database Connected', `Successfully linked to ${url}`);
      addActivityLog('CONNECT', 'SUCCESS', `Updated credentials connected (${result.latencyMs}ms)`);
      await fetchRecords();
      return true;
    } else {
      addToast('error', 'Connection Failed', result.message);
      addActivityLog('CONNECT', 'ERROR', `Failed to connect with new credentials: ${result.message}`);
      return false;
    }
  };

  // Fetch real records from Supabase
  const fetchRecords = async () => {
    setIsLoadingRecords(true);
    setRecordsError(null);
    const start = performance.now();

    try {
      const { data, count, error } = await supabase
        .from('records')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      const duration = Math.round(performance.now() - start);

      if (error) {
        setRecordsError(error.message);
        addActivityLog('SELECT', 'ERROR', `Failed to fetch records: ${error.message}`, duration);
        // Fall back to local demo state if remote table isn't created yet
        return;
      }

      if (data) {
        setRecords(data as DatabaseRecord[]);
        setTotalRecordsCount(count || data.length);
        addActivityLog('SELECT', 'SUCCESS', `Fetched ${data.length} records from Supabase`, duration);
      }
    } catch (err: any) {
      setRecordsError(err.message || 'Error executing SELECT query');
      addActivityLog('SELECT', 'ERROR', `SELECT query threw error: ${err.message}`, Math.round(performance.now() - start));
    } finally {
      setIsLoadingRecords(false);
    }
  };

  // Add a new record
  const addRecord = async (newRecData: Omit<DatabaseRecord, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
    const start = performance.now();
    
    // Check if real connection is active
    if (isConnected) {
      try {
        const { data, error } = await supabase
          .from('records')
          .insert([newRecData])
          .select()
          .single();

        const duration = Math.round(performance.now() - start);

        if (error) {
          addToast('error', 'Insert Failed', error.message);
          addActivityLog('INSERT', 'ERROR', `INSERT failed: ${error.message}`, duration, newRecData);
          return false;
        }

        if (data) {
          setRecords(prev => [data as DatabaseRecord, ...prev]);
          setTotalRecordsCount(prev => prev + 1);
          addToast('success', 'Record Created', `Successfully inserted record "${data.name}"`);
          addActivityLog('INSERT', 'SUCCESS', `Created record ID ${data.id.slice(0, 8)}... (${data.name})`, duration, data);
          return true;
        }
      } catch (err: any) {
        addToast('error', 'Insert Error', err.message);
        addActivityLog('INSERT', 'ERROR', `INSERT failed: ${err.message}`, Math.round(performance.now() - start));
        return false;
      }
    }

    // Local state fallback if operating offline / demo mode
    const duration = Math.round(performance.now() - start);
    const newRecord: DatabaseRecord = {
      ...newRecData,
      id: crypto.randomUUID ? crypto.randomUUID() : `rec-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setRecords(prev => [newRecord, ...prev]);
    setTotalRecordsCount(prev => prev + 1);
    addToast('success', 'Record Added (Local Demo)', `Added record for "${newRecord.name}"`);
    addActivityLog('INSERT', 'SUCCESS', `Added local demo record ID ${newRecord.id.slice(0, 8)}...`, duration);
    return true;
  };

  // Update existing record
  const updateRecord = async (id: string, updatedFields: Partial<DatabaseRecord>): Promise<boolean> => {
    const start = performance.now();
    const payload = {
      ...updatedFields,
      updated_at: new Date().toISOString()
    };

    if (isConnected) {
      try {
        const { data, error } = await supabase
          .from('records')
          .update(payload)
          .eq('id', id)
          .select()
          .single();

        const duration = Math.round(performance.now() - start);

        if (error) {
          addToast('error', 'Update Failed', error.message);
          addActivityLog('UPDATE', 'ERROR', `UPDATE failed for ID ${id.slice(0, 8)}...: ${error.message}`, duration);
          return false;
        }

        if (data) {
          setRecords(prev => prev.map(r => (r.id === id ? (data as DatabaseRecord) : r)));
          addToast('success', 'Record Updated', `Successfully updated "${data.name}"`);
          addActivityLog('UPDATE', 'SUCCESS', `Updated record ID ${id.slice(0, 8)}...`, duration, data);
          return true;
        }
      } catch (err: any) {
        addToast('error', 'Update Error', err.message);
        addActivityLog('UPDATE', 'ERROR', `UPDATE failed: ${err.message}`, Math.round(performance.now() - start));
        return false;
      }
    }

    // Local fallback
    const duration = Math.round(performance.now() - start);
    setRecords(prev =>
      prev.map(r => (r.id === id ? { ...r, ...payload, updated_at: new Date().toISOString() } : r))
    );
    addToast('success', 'Record Updated (Local)', `Updated record ID ${id.slice(0, 8)}...`);
    addActivityLog('UPDATE', 'SUCCESS', `Updated local record ID ${id.slice(0, 8)}...`, duration);
    return true;
  };

  // Delete record
  const deleteRecord = async (id: string): Promise<boolean> => {
    const start = performance.now();

    if (isConnected) {
      try {
        const { error } = await supabase
          .from('records')
          .delete()
          .eq('id', id);

        const duration = Math.round(performance.now() - start);

        if (error) {
          addToast('error', 'Delete Failed', error.message);
          addActivityLog('DELETE', 'ERROR', `DELETE failed for ID ${id.slice(0, 8)}...: ${error.message}`, duration);
          return false;
        }

        setRecords(prev => prev.filter(r => r.id !== id));
        setTotalRecordsCount(prev => Math.max(0, prev - 1));
        addToast('success', 'Record Deleted', `Removed record ID ${id.slice(0, 8)}... from Supabase`);
        addActivityLog('DELETE', 'SUCCESS', `Deleted record ID ${id.slice(0, 8)}...`, duration);
        return true;
      } catch (err: any) {
        addToast('error', 'Delete Error', err.message);
        addActivityLog('DELETE', 'ERROR', `DELETE failed: ${err.message}`, Math.round(performance.now() - start));
        return false;
      }
    }

    // Local fallback
    const duration = Math.round(performance.now() - start);
    setRecords(prev => prev.filter(r => r.id !== id));
    setTotalRecordsCount(prev => Math.max(0, prev - 1));
    addToast('success', 'Record Deleted (Local)', `Removed record ID ${id.slice(0, 8)}...`);
    addActivityLog('DELETE', 'SUCCESS', `Deleted local record ID ${id.slice(0, 8)}...`, duration);
    return true;
  };

  // Initial connection test on startup
  useEffect(() => {
    checkConnection();
  }, []);

  return (
    <DbContext.Provider
      value={{
        isAuthenticated,
        userEmail,
        login,
        logout,
        isConnected,
        isCheckingConnection,
        connectionMessage,
        connectionLatency,
        checkConnection,
        config,
        saveConfig,
        records,
        isLoadingRecords,
        recordsError,
        totalRecordsCount,
        fetchRecords,
        addRecord,
        updateRecord,
        deleteRecord,
        activityLogs,
        addActivityLog,
        clearActivityLogs,
        theme,
        toggleTheme,
        toasts,
        addToast,
        removeToast,
        activeModal,
        setActiveModal,
        selectedRecord,
        setSelectedRecord,
        activeTab,
        setActiveTab
      }}
    >
      {children}
    </DbContext.Provider>
  );
};

export const useDb = () => {
  const context = useContext(DbContext);
  if (!context) {
    throw new Error('useDb must be used within a DbProvider');
  }
  return context;
};
