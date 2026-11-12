'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Network, Cpu, AlertTriangle, Shield } from 'lucide-react';

interface TwoGroupDefect {
  defect_id: string;
  algebra: string;
  default_postnikov_order: number;
  default_walker_wang_rank: number;
  default_inflow_coupling: number;
  base_unitarity_pct: number;
  base_suppression_db: number;
  status: string;
}

interface AuditTwoGroupResult {
  defect_id: string;
  algebra: string;
  postnikov_order: number;
  walker_wang_rank: number;
  inflow_coupling: number;
  green_schwarz_gain: number;
  postnikov_obstruction_residual: number;
  bianchi_cancellation_ratio: number;
  anomaly_inflow_residual: number;
  anomaly_suppression_db: number;
  twogroup_unitarity_pct: number;
  green_schwarz_compensated: boolean;
  status: string;
  timestamp: number;
}

export default function HigherFormTwoGroupStudio() {
  const [defects, setDefects] = useState<TwoGroupDefect[]>([]);
  const [selectedDefect, setSelectedDefect] = useState<string>('TWOGROUP-POSTNIKOV-H3-01');
  const [postnikovOrder, setPostnikovOrder] = useState<number>(4);
  const [walkerWangRank, setWalkerWangRank] = useState<number>(8);
  const [inflowCoupling, setInflowCoupling] = useState<number>(1.25);
  const [greenSchwarzGain, setGreenSchwarzGain] = useState<number>(1.65);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<AuditTwoGroupResult | null>(null);

  const fetchDefects = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/higher-form-twogroup/defects');
      const data = (await res.json().catch(() => ({}))) as {
        defects?: TwoGroupDefect[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load 2-group defect complexes');
      }
      if (data.defects) {
        setDefects(data.defects);
        if (data.defects.length > 0) {
          setSelectedDefect((prev) => prev || data.defects![0].defect_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to load 2-group defect complexes');
    }
  }, []);

  useEffect(() => {
    fetchDefects();
  }, [fetchDefects]);

  const handleAudit = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/higher-form-twogroup/audit-twogroup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          defect_id: selectedDefect,
          postnikov_order: postnikovOrder,
          walker_wang_rank: walkerWangRank,
          inflow_coupling: inflowCoupling,
          green_schwarz_gain: greenSchwarzGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as AuditTwoGroupResult & {
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || '2-group higher-form audit failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : '2-group higher-form audit failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <Network className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-purple-300">
              Capability 127: 2-Group Higher-Form Green-Schwarz &amp; Walker-Wang Anomaly Guard
            </h2>
            <p className="text-sm text-slate-400">
              Postnikov class H^3(BG, A) anomaly inflow cancellation &amp; 3+1D Walker-Wang modular-functor boundary coherence
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchDefects}
          className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Complexes</span>
        </button>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="bg-red-950/30 border border-red-800/60 rounded-lg px-4 py-2.5 text-xs font-mono text-red-300 flex items-center gap-2"
        >
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {defects.map((d) => (
          <button
            type="button"
            key={d.defect_id}
            onClick={() => setSelectedDefect(d.defect_id)}
            aria-pressed={selectedDefect === d.defect_id}
            className={`text-left p-4 rounded-lg border transition ${
              selectedDefect === d.defect_id
                ? 'bg-purple-950/40 border-purple-500/60 shadow-lg shadow-purple-950/50'
                : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-semibold text-purple-400">{d.defect_id}</span>
              <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-mono">
                {d.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2">{d.algebra}</p>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div>Postnikov H^3: {d.default_postnikov_order} | Rank: {d.default_walker_wang_rank}</div>
              <div>Base Suppression: {d.base_suppression_db} dB</div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Postnikov Order
            </label>
            <input
              type="number"
              min={2}
              max={32}
              step={1}
              value={postnikovOrder}
              onChange={(e) => setPostnikovOrder(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Walker-Wang Rank
            </label>
            <input
              type="number"
              min={4}
              max={64}
              step={2}
              value={walkerWangRank}
              onChange={(e) => setWalkerWangRank(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Inflow Coupling
            </label>
            <input
              type="number"
              min={0.5}
              max={4}
              step={0.05}
              value={inflowCoupling}
              onChange={(e) => setInflowCoupling(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Green-Schwarz Gain
            </label>
            <input
              type="number"
              min={0.85}
              max={2.5}
              step={0.05}
              value={greenSchwarzGain}
              onChange={(e) => setGreenSchwarzGain(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleAudit}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-lg transition shadow-lg shadow-purple-900/30"
        >
          <Shield className="w-4 h-4" />
          <span>{loading ? 'Auditing 2-Group Inflow...' : 'Audit 2-Group Postnikov & Green-Schwarz Inflow'}</span>
        </button>
      </div>

      {telemetry && (
        <div className="bg-purple-950/20 border border-purple-800/50 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-purple-900/50 pb-3">
            <div className="flex items-center space-x-2 text-purple-400 font-semibold text-sm">
              <Cpu className="w-4 h-4" />
              <span>2-Group Higher-Form Telemetry ({telemetry.defect_id})</span>
            </div>
            <span className="text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
              {telemetry.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">2-Group Unitarity</div>
              <div className="text-base font-bold text-purple-300">
                {telemetry.twogroup_unitarity_pct}%
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Anomaly Suppression</div>
              <div className="text-base font-bold text-indigo-300">
                {telemetry.anomaly_suppression_db} dB
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Bianchi Cancellation</div>
              <div className="text-base font-bold text-emerald-300">
                {telemetry.bianchi_cancellation_ratio}
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Inflow Residual</div>
              <div className="text-base font-bold text-cyan-300">
                {telemetry.anomaly_inflow_residual}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

