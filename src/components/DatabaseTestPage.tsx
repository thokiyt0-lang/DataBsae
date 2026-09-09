import React, { useState } from 'react';
import { useDb } from '../context/DbContext';
import { 
  testConnection, 
  testInsert, 
  testSelect, 
  testUpdate, 
  testDelete, 
  testCount 
} from '../lib/supabase';
import type { TestResult } from '../types/database';
import { 
  Zap, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Hash, 
  Play, 
  Terminal as TerminalIcon, 
  Trash, 
  Copy, 
  Download 
} from 'lucide-react';


interface ConsoleLogLine {
  id: string;
  timestamp: string;
  type: 'SUCCESS' | 'ERROR' | 'INFO' | 'RUNNING';
  text: string;
  durationMs?: number;
  details?: any;
}

export const DatabaseTestPage: React.FC = () => {
  const { addToast, fetchRecords } = useDb();

  const [logs, setLogs] = useState<ConsoleLogLine[]>([
    {
      id: 'init-1',
      timestamp: new Date().toLocaleTimeString(),
      type: 'INFO',
      text: 'Console ready. Click any test action button above to start testing Supabase PostgreSQL.'
    }
  ]);

  const [runningTest, setRunningTest] = useState<string | null>(null);

  const appendLog = (type: ConsoleLogLine['type'], text: string, durationMs?: number, details?: any) => {
    const newLog: ConsoleLogLine = {
      id: `console-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type,
      text,
      durationMs,
      details
    };
    setLogs(prev => [...prev, newLog]);
  };

  const executeTest = async (testName: string, testFn: () => Promise<TestResult>) => {
    setRunningTest(testName);
    appendLog('RUNNING', `Executing ${testName}...`);

    try {
      const res = await testFn();
      if (res.status === 'passed') {
        appendLog('SUCCESS', res.message, res.durationMs, res.details);
        addToast('success', `${testName} Passed`, res.message);
      } else {
        appendLog('ERROR', res.message, res.durationMs, res.details);
        addToast('error', `${testName} Failed`, res.message);
      }
    } catch (err: any) {
      appendLog('ERROR', `CRITICAL ERROR in ${testName}: ${err.message || String(err)}`);
      addToast('error', `${testName} Failed`, err.message || String(err));
    } finally {
      setRunningTest(null);
      await fetchRecords();
    }
  };

  const handleRunAllTests = async () => {
    setRunningTest('ALL');
    appendLog('INFO', '================================================');
    appendLog('INFO', '🚀 STARTING AUTOMATED FULL DATABASE TEST SUITE...');
    appendLog('INFO', '================================================');

    const tests = [
      { name: 'Test Connection', fn: testConnection },
      { name: 'INSERT Test', fn: testInsert },
      { name: 'SELECT Test', fn: testSelect },
      { name: 'UPDATE Test', fn: testUpdate },
      { name: 'DELETE Test', fn: testDelete },
      { name: 'Count Records', fn: testCount },
    ];

    let passedCount = 0;
    let failedCount = 0;

    for (const test of tests) {
      setRunningTest(test.name);
      appendLog('RUNNING', `Executing ${test.name}...`);
      try {
        const res = await test.fn();
        if (res.status === 'passed') {
          passedCount++;
          appendLog('SUCCESS', res.message, res.durationMs, res.details);
        } else {
          failedCount++;
          appendLog('ERROR', res.message, res.durationMs, res.details);
        }
      } catch (err: any) {
        failedCount++;
        appendLog('ERROR', `CRITICAL EXCEPTION in ${test.name}: ${err.message || String(err)}`);
      }
    }

    appendLog('INFO', '------------------------------------------------');
    if (failedCount === 0) {
      appendLog('SUCCESS', `🎉 ALL TESTS PASSED SUCCESSFULLY! (${passedCount}/${tests.length} tests passed)`);
      addToast('success', 'Suite Passed', `All ${passedCount} database tests completed cleanly!`);
    } else {
      appendLog('ERROR', `⚠️ TEST SUITE COMPLETED WITH ERRORS (${passedCount} passed, ${failedCount} failed)`);
      addToast('warning', 'Suite Finished', `${passedCount} passed, ${failedCount} failed`);
    }
    appendLog('INFO', '================================================');

    setRunningTest(null);
    await fetchRecords();
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  const handleCopyLogs = () => {
    const textToCopy = logs.map(l => `[${l.timestamp}] ${l.type}: ${l.text}`).join('\n');
    navigator.clipboard.writeText(textToCopy);
    addToast('info', 'Logs Copied', 'Console log text copied to clipboard.');
  };

  const handleExportLogs = () => {
    const textToExport = logs.map(l => `[${l.timestamp}] ${l.type}: ${l.text}`).join('\n');
    const blob = new Blob([textToExport], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `supabase-db-test-logs-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('success', 'Logs Exported', 'Downloaded test log file.');
  };

  return (
    <div className="space-y-6">
      
      {/* Test Buttons Control Panel */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <TerminalIcon className="w-5 h-5 text-amber-500" />
              <span>Database Operations Test Bench</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Execute live CRUD transactions against your Supabase PostgreSQL instance
            </p>
          </div>

          <button
            onClick={handleRunAllTests}
            disabled={runningTest !== null}
            className="flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
          >
            <Play className={`w-4 h-4 fill-white ${runningTest === 'ALL' ? 'animate-spin' : ''}`} />
            <span>{runningTest === 'ALL' ? 'Running All Tests...' : '⚡ Run All Tests'}</span>
          </button>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          
          {/* Test 1: Connection */}
          <button
            onClick={() => executeTest('Test Connection', testConnection)}
            disabled={runningTest !== null}
            className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-cyan-500 dark:hover:border-cyan-500 flex flex-col items-center justify-center text-center transition-all disabled:opacity-50 group"
          >
            <Zap className="w-5 h-5 text-amber-500 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Test Connection</span>
          </button>

          {/* Test 2: INSERT */}
          <button
            onClick={() => executeTest('INSERT Test', testInsert)}
            disabled={runningTest !== null}
            className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 flex flex-col items-center justify-center text-center transition-all disabled:opacity-50 group"
          >
            <Plus className="w-5 h-5 text-emerald-500 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">INSERT Test</span>
          </button>

          {/* Test 3: SELECT */}
          <button
            onClick={() => executeTest('SELECT Test', testSelect)}
            disabled={runningTest !== null}
            className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 flex flex-col items-center justify-center text-center transition-all disabled:opacity-50 group"
          >
            <Search className="w-5 h-5 text-blue-500 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">SELECT Test</span>
          </button>

          {/* Test 4: UPDATE */}
          <button
            onClick={() => executeTest('UPDATE Test', testUpdate)}
            disabled={runningTest !== null}
            className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-500 flex flex-col items-center justify-center text-center transition-all disabled:opacity-50 group"
          >
            <Edit3 className="w-5 h-5 text-amber-500 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">UPDATE Test</span>
          </button>

          {/* Test 5: DELETE */}
          <button
            onClick={() => executeTest('DELETE Test', testDelete)}
            disabled={runningTest !== null}
            className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-rose-500 dark:hover:border-rose-500 flex flex-col items-center justify-center text-center transition-all disabled:opacity-50 group"
          >
            <Trash2 className="w-5 h-5 text-rose-500 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">DELETE Test</span>
          </button>

          {/* Test 6: COUNT */}
          <button
            onClick={() => executeTest('Count Records', testCount)}
            disabled={runningTest !== null}
            className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-500 flex flex-col items-center justify-center text-center transition-all disabled:opacity-50 group"
          >
            <Hash className="w-5 h-5 text-purple-500 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Count Records</span>
          </button>

        </div>
      </div>

      {/* Terminal / Console Output Area */}
      <div className="rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden font-mono text-xs">
        
        {/* Console Header Bar */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Window buttons visual decoration */}
            <div className="flex space-x-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
            </div>
            <span className="font-bold text-slate-300">bash -- db-test-console</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyLogs}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center space-x-1 transition-colors"
              title="Copy output to clipboard"
            >
              <Copy className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Copy</span>
            </button>

            <button
              onClick={handleExportLogs}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center space-x-1 transition-colors"
              title="Export log as text file"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>

            <button
              onClick={handleClearLogs}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 text-xs flex items-center space-x-1 transition-colors"
              title="Clear terminal output"
            >
              <Trash className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          </div>
        </div>

        {/* Console Screen Output */}
        <div className="p-5 h-96 overflow-y-auto space-y-2 bg-slate-950 text-slate-200">
          {logs.length === 0 ? (
            <p className="text-slate-600 italic">Terminal output cleared. Ready for input.</p>
          ) : (
            logs.map(log => {
              const getLogColor = () => {
                switch (log.type) {
                  case 'SUCCESS':
                    return 'text-emerald-400 font-semibold';
                  case 'ERROR':
                    return 'text-rose-400 font-semibold';
                  case 'RUNNING':
                    return 'text-amber-400 font-semibold animate-pulse';
                  default:
                    return 'text-cyan-400';
                }
              };

              return (
                <div key={log.id} className="leading-relaxed">
                  <span className="text-slate-500 select-none">[{log.timestamp}] </span>
                  <span className={getLogColor()}>{log.text}</span>
                  {log.durationMs !== undefined && (
                    <span className="text-slate-500 ml-2">({log.durationMs}ms)</span>
                  )}
                  {log.details && (
                    <pre className="mt-1 ml-4 p-2 rounded bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 overflow-x-auto">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  )}
                </div>
              );
            })
          )}
          {/* Prompt line with pulsing cursor */}
          <div className="pt-2 flex items-center space-x-2 text-cyan-500 font-bold">
            <span>supabase-pg:~ $</span>
            <span className="w-2 h-4 bg-cyan-500 inline-block animate-blink"></span>
          </div>
        </div>

      </div>
    </div>
  );
};
