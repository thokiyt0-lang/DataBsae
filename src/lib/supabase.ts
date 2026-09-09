import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { SupabaseConfig, TestResult } from '../types/database';


// Default keys from Vite environment variables or fallback
const DEFAULT_URL = import.meta.env.VITE_SUPABASE_URL || 'https://xyzcompany.supabase.co';
const DEFAULT_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoyMDAwMDAwMDAwfQ.testkey';

// Retrieve saved config or defaults
export function getSavedConfig(): SupabaseConfig {
  const savedUrl = localStorage.getItem('supabase_url');
  const savedKey = localStorage.getItem('supabase_anon_key');
  return {
    url: savedUrl || DEFAULT_URL,
    anonKey: savedKey || DEFAULT_KEY
  };
}

let currentConfig = getSavedConfig();
export let supabase: SupabaseClient = createClient(currentConfig.url, currentConfig.anonKey);

export function updateSupabaseConfig(url: string, anonKey: string): SupabaseClient {
  const cleanUrl = url.trim();
  const cleanKey = anonKey.trim();
  
  localStorage.setItem('supabase_url', cleanUrl);
  localStorage.setItem('supabase_anon_key', cleanKey);
  
  currentConfig = { url: cleanUrl, anonKey: cleanKey };
  supabase = createClient(cleanUrl, cleanKey);
  return supabase;
}

export function isConfigured(): boolean {
  const config = getSavedConfig();
  return (
    Boolean(config.url) &&
    !config.url.includes('xyzcompany') &&
    Boolean(config.anonKey) &&
    !config.anonKey.includes('testkey')
  );
}

// Check real connection status to Supabase
export async function checkSupabaseConnection(customClient?: SupabaseClient): Promise<{
  connected: boolean;
  message: string;
  latencyMs: number;
  error?: string;
}> {
  const clientToUse = customClient || supabase;
  const startTime = performance.now();
  
  try {
    // Attempt a light query to test table access or health
    const { error } = await clientToUse
      .from('records')
      .select('id', { head: true, count: 'exact' });
      
    const endTime = performance.now();
    const latencyMs = Math.round(endTime - startTime);

    if (error) {
      // PGRST204 or table not found is a specific DB schema state, but host connected
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        return {
          connected: false,
          message: 'Connected to Supabase project, but "records" table was not found. Please run schema.sql.',
          latencyMs,
          error: error.message
        };
      }
      return {
        connected: false,
        message: `Connection Failed: ${error.message || 'Invalid API key or network error'}`,
        latencyMs,
        error: error.message
      };
    }

    return {
      connected: true,
      message: `Database Connected (${latencyMs}ms)`,
      latencyMs
    };
  } catch (err: any) {
    const endTime = performance.now();
    return {
      connected: false,
      message: `Network/Connection Error: ${err.message || 'Unable to reach host'}`,
      latencyMs: Math.round(endTime - startTime),
      error: err.message || String(err)
    };
  }
}

// Diagnostic Test Execution Helpers
export async function testConnection(): Promise<TestResult> {
  const start = performance.now();
  const res = await checkSupabaseConnection();
  const duration = Math.round(performance.now() - start);

  if (res.connected) {
    return {
      name: 'Test Connection',
      status: 'passed',
      message: `SUCCESS: Database connected successfully (${res.latencyMs}ms)`,
      durationMs: res.latencyMs
    };
  } else {
    return {
      name: 'Test Connection',
      status: 'failed',
      message: `ERROR: ${res.message}`,
      durationMs: duration,
      details: res.error
    };
  }
}

export async function testInsert(): Promise<TestResult> {
  const start = performance.now();
  const testPayload = {
    name: `Test User ${Math.floor(1000 + Math.random() * 9000)}`,
    email: `test.${Date.now()}@db-test.io`,
    phone: '+1 (555) 019-2831',
    address: '100 Automated Test Ave, Suite 4',
    status: 'Active'
  };

  try {
    const { data, error } = await supabase
      .from('records')
      .insert([testPayload])
      .select()
      .single();

    const duration = Math.round(performance.now() - start);

    if (error) {
      return {
        name: 'INSERT Test',
        status: 'failed',
        message: `ERROR: INSERT operation failed - ${error.message}`,
        durationMs: duration,
        details: error
      };
    }

    return {
      name: 'INSERT Test',
      status: 'passed',
      message: `SUCCESS: INSERT operation completed - Created Record ID: ${data.id}`,
      durationMs: duration,
      details: data
    };
  } catch (err: any) {
    return {
      name: 'INSERT Test',
      status: 'failed',
      message: `ERROR: INSERT operation failed - ${err.message || String(err)}`,
      durationMs: Math.round(performance.now() - start)
    };
  }
}

export async function testSelect(): Promise<TestResult> {
  const start = performance.now();
  try {
    const { data, count, error } = await supabase
      .from('records')
      .select('*', { count: 'exact' })
      .limit(5);

    const duration = Math.round(performance.now() - start);

    if (error) {
      return {
        name: 'SELECT Test',
        status: 'failed',
        message: `ERROR: SELECT operation failed - ${error.message}`,
        durationMs: duration,
        details: error
      };
    }

    return {
      name: 'SELECT Test',
      status: 'passed',
      message: `SUCCESS: SELECT operation completed - Retrieved ${data?.length || 0} records (Total: ${count || 0})`,
      durationMs: duration,
      details: data
    };
  } catch (err: any) {
    return {
      name: 'SELECT Test',
      status: 'failed',
      message: `ERROR: SELECT operation failed - ${err.message || String(err)}`,
      durationMs: Math.round(performance.now() - start)
    };
  }
}

export async function testUpdate(): Promise<TestResult> {
  const start = performance.now();
  try {
    // 1. Fetch a record to update
    const { data: records } = await supabase
      .from('records')
      .select('id, name')
      .limit(1);

    let targetId = '';
    if (records && records.length > 0) {
      targetId = records[0].id;
    } else {
      // Create a temporary record first
      const { data: newRec, error: insErr } = await supabase
        .from('records')
        .insert([{ name: 'Update Target', email: 'update@test.com', status: 'Pending' }])
        .select()
        .single();

      if (insErr || !newRec) {
        return {
          name: 'UPDATE Test',
          status: 'failed',
          message: `ERROR: UPDATE test prerequisite failed - ${insErr?.message || 'No records found to update'}`,
          durationMs: Math.round(performance.now() - start)
        };
      }
      targetId = newRec.id;
    }

    const updatedName = `Updated Record (${new Date().toLocaleTimeString()})`;

    const { data, error } = await supabase
      .from('records')
      .update({ name: updatedName, updated_at: new Date().toISOString() })
      .eq('id', targetId)
      .select()
      .single();

    const duration = Math.round(performance.now() - start);

    if (error) {
      return {
        name: 'UPDATE Test',
        status: 'failed',
        message: `ERROR: UPDATE operation failed - ${error.message}`,
        durationMs: duration,
        details: error
      };
    }

    return {
      name: 'UPDATE Test',
      status: 'passed',
      message: `SUCCESS: UPDATE operation completed - Updated Record ${targetId.slice(0, 8)}...`,
      durationMs: duration,
      details: data
    };
  } catch (err: any) {
    return {
      name: 'UPDATE Test',
      status: 'failed',
      message: `ERROR: UPDATE operation failed - ${err.message || String(err)}`,
      durationMs: Math.round(performance.now() - start)
    };
  }
}

export async function testDelete(): Promise<TestResult> {
  const start = performance.now();
  try {
    // Insert a dummy record specifically for deletion test
    const { data: tempRec, error: insErr } = await supabase
      .from('records')
      .insert([{ name: 'Delete Target Test', email: `del.${Date.now()}@test.com`, status: 'Inactive' }])
      .select()
      .single();

    if (insErr || !tempRec) {
      return {
        name: 'DELETE Test',
        status: 'failed',
        message: `ERROR: DELETE test insert setup failed - ${insErr?.message || 'Insert error'}`,
        durationMs: Math.round(performance.now() - start)
      };
    }

    const { error: delErr } = await supabase
      .from('records')
      .delete()
      .eq('id', tempRec.id);

    const duration = Math.round(performance.now() - start);

    if (delErr) {
      return {
        name: 'DELETE Test',
        status: 'failed',
        message: `ERROR: DELETE operation failed - ${delErr.message}`,
        durationMs: duration,
        details: delErr
      };
    }

    return {
      name: 'DELETE Test',
      status: 'passed',
      message: `SUCCESS: DELETE operation completed - Removed test record ${tempRec.id.slice(0, 8)}...`,
      durationMs: duration
    };
  } catch (err: any) {
    return {
      name: 'DELETE Test',
      status: 'failed',
      message: `ERROR: DELETE operation failed - ${err.message || String(err)}`,
      durationMs: Math.round(performance.now() - start)
    };
  }
}

export async function testCount(): Promise<TestResult> {
  const start = performance.now();
  try {
    const { count, error } = await supabase
      .from('records')
      .select('*', { count: 'exact', head: true });

    const duration = Math.round(performance.now() - start);

    if (error) {
      return {
        name: 'Count Records',
        status: 'failed',
        message: `ERROR: Count query failed - ${error.message}`,
        durationMs: duration
      };
    }

    return {
      name: 'Count Records',
      status: 'passed',
      message: `SUCCESS: Total record count in database: ${count ?? 0}`,
      durationMs: duration,
      details: { count }
    };
  } catch (err: any) {
    return {
      name: 'Count Records',
      status: 'failed',
      message: `ERROR: Count query failed - ${err.message || String(err)}`,
      durationMs: Math.round(performance.now() - start)
    };
  }
}
