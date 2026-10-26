'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { fetchHealth, HealthResponse, API_BASE_URL } from '@/services/api';
import { CheckCircle2, AlertCircle, RefreshCw, Server, Database, HardDrive, Radio } from 'lucide-react';

export default function BackendHealthStatus() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkHealth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHealth();
      setHealth(data);
      setError(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Backend unreachable';
      setError(msg);
      setHealth(null);
    } finally {
      setLoading(false);
      setLastChecked(new Date());
    }
  }, []);

  useEffect(() => {
    checkHealth();
    // Poll every 15 seconds
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  const isOnline = !!health && health.status === 'ok';
  const isMongoConnected = health?.database?.connected ?? false;

  return (
    <div className="glass-panel rounded-2xl p-6 transition-all duration-300">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Radio className="h-5 w-5" />
            <span
              className={`absolute top-1 right-1 h-2.5 w-2.5 rounded-full ${
                isOnline
                  ? isMongoConnected
                    ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]'
                    : 'bg-amber-400 shadow-[0_0_10px_#fbbf24]'
                  : 'bg-rose-500 shadow-[0_0_10px_#f43f5e]'
              }`}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-100">Backend Communication Link</h3>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${
                  isOnline
                    ? isMongoConnected
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                    : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                }`}
              >
                {loading
                  ? 'Checking...'
                  : isOnline
                  ? isMongoConnected
                    ? 'All Systems Operational'
                    : 'API Connected (DB Disconnected)'
                  : 'Backend Offline'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Target API: <code className="text-slate-300 bg-black/30 px-1.5 py-0.5 rounded font-mono text-[11px]">{API_BASE_URL}</code>
            </p>
          </div>
        </div>

        <button
          onClick={checkHealth}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 transition-all cursor-pointer disabled:opacity-50"
          title="Refresh connectivity status"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-blue-400' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Grid of status cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {/* API Server Card */}
        <div className="rounded-xl bg-slate-900/60 border border-white/5 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Server className="h-4 w-4 text-sky-400" /> Express REST API
            </span>
            {isOnline ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-400" />
            )}
          </div>
          <div className="text-sm font-semibold text-slate-100">
            {isOnline ? 'Online (HTTP 200)' : 'Unreachable'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {isOnline
              ? `Uptime: ${health?.uptimeSeconds ?? 0}s | Env: ${health?.environment}`
              : error || 'Ensure backend server is running on port 5000'}
          </div>
        </div>

        {/* MongoDB Card */}
        <div className="rounded-xl bg-slate-900/60 border border-white/5 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Database className="h-4 w-4 text-emerald-400" /> MongoDB Database
            </span>
            {isMongoConnected ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            ) : (
              <AlertCircle className="h-4 w-4 text-amber-400" />
            )}
          </div>
          <div className="text-sm font-semibold text-slate-100">
            {isMongoConnected ? 'Connected' : 'Not Connected'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {isMongoConnected
              ? `Host: ${health?.database.host} | DB: ${health?.database.name}`
              : health?.database?.error
              ? `Error: ${health.database.error}`
              : 'Configured in backend/.env MONGODB_URI'}
          </div>
        </div>

        {/* Storage Card */}
        <div className="rounded-xl bg-slate-900/60 border border-white/5 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <HardDrive className="h-4 w-4 text-purple-400" /> Server Storage
            </span>
            {health?.storage?.uploadsReady && health?.storage?.generatedReady ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            ) : (
              <AlertCircle className="h-4 w-4 text-slate-500" />
            )}
          </div>
          <div className="text-sm font-semibold text-slate-100">
            {health?.storage?.uploadsReady ? 'Ready for Files' : 'Pending API'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            uploads/ and generated/ directories active
          </div>
        </div>
      </div>

      {lastChecked && (
        <div className="text-right mt-3 text-[10px] text-slate-500">
          Last checked at {lastChecked.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}
