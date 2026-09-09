export type RecordStatus = 'Active' | 'Pending' | 'Inactive' | 'Archived';

export interface DatabaseRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: RecordStatus;
  created_at: string;
  updated_at: string;
}

export type ActivityAction = 
  | 'INSERT' 
  | 'SELECT' 
  | 'UPDATE' 
  | 'DELETE' 
  | 'CONNECT' 
  | 'COUNT' 
  | 'ERROR';

export type ActivityStatus = 'SUCCESS' | 'ERROR' | 'INFO' | 'WARNING';

export interface ActivityLog {
  id: string;
  timestamp: string;
  action: ActivityAction;
  status: ActivityStatus;
  details: string;
  executionTimeMs?: number;
  payload?: any;
}

export interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'running' | 'idle';
  message: string;
  durationMs?: number;
  details?: any;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  description?: string;
}
