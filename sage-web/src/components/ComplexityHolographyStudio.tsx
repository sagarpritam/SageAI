'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles, Cpu, AlertTriangle, Layers } from 'lucide-react';

interface ComplexityBound {
  bound_id: string;
  geometry: string;
  default_central_charge: number;
  default_lloyd_ratio: number;
  default_switchback_shocks: number;
  base_fidelity_pct: number;
  base_suppression_db: number;
  status: string;
}

interface AuditComplexityResult {
  bound_id: string;
  geometry: string;
  central_charge: number;
  lloyd_ratio: number;
  switchback_shocks: number;
  wdw_anchor_gain: number;
  action_complexity_norm: number;
  switchback_foldback_delay: number;
  complexity_drift_residual: number;
  chaos_suppression_db: number;
  complexity_fidelity_pct: number;
  lloyd_bound_satisfied: boolean;
  status: string;
  timestamp: number;
}

export default function ComplexityHolographyStudio() {
  const [bounds, setBounds] = useState<ComplexityBound[]>([]);
  const [selectedBound, setSelectedBound] = useState<string>('CMP-WDW-ACTION-01');
  const [centralCharge, setCentralCharge] = useState<number>(240);
  const [lloydRatio, setLloydRatio] = useState<number>(0.94);
  const [switchbackShocks, setSwitchbackShocks] = useState<number>(6);
  const [wdwGain, setWdwGain] = useState<number>(1.55);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<AuditComplexityResult | null>(null);

  const fetchBounds = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/complexity-holography/bounds');
      const data = (await res.json().catch(() => ({}))) as {
        bounds?: ComplexityBound[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load complexity bounds');
      }
      if (data.bounds) {
        setBounds(data.bounds);
        if (data.bounds.length > 0) {
          setSelectedBound((prev) => prev || data.bounds![0].bound_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to load complexity bounds');
    }
  }, []);

  useEffect(() => {
    fetchBounds();
  }, [fetchBounds]);

  const handleAudit = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/complexity-holography/audit-complexity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bound_id: selectedBound,
          central_charge: centralCharge,
          lloyd_ratio: lloydRatio,
          switchback_shocks: switchbackShocks,
          wdw_anchor_gain: wdwGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as AuditComplexityResult & {
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Complexity WDW audit failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Complexity WDW audit failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-teal-500/10 border border-teal-500/30 rounded-lg">
            <Layers className="w-6 h-6 text-teal-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-teal-300">
              Capability 122: Holographic Quantum Complexity (CA/CV &amp; Switchback) Firewall
            </h2>
            <p className="text-sm text-slate-400">
              Wheeler-DeWitt action complexity I_WDW/pi, extremal volume slices &amp; Lloyd rate bound enforcement
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchBounds}
          className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Regimes</span>
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
        {bounds.map((b) => (
          <button
            type="button"
            key={b.bound_id}
            onClick={() => setSelectedBound(b.bound_id)}
            aria-pressed={selectedBound === b.bound_id}
            className={`text-left p-4 rounded-lg border transition ${
              selectedBound === b.bound_id
                ? 'bg-teal-950/40 border-teal-500/60 shadow-lg shadow-teal-950/50'
                : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-semibold text-teal-400">{b.bound_id}</span>
              <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full font-mono">
                {b.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2">{b.geometry}</p>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div>Central Charge: c={b.default_central_charge}</div>
              <div>Base Suppression: {b.base_suppression_db} dB</div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Central Charge (c)
            </label>
            <input
              type="number"
              min={24}
              max={4096}
              step={16}
              value={centralCharge}
              onChange={(e) => setCentralCharge(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Lloyd Saturation Ratio
            </label>
            <input
              type="number"
              min={0.5}
              max={1.0}
              step={0.02}
              value={lloydRatio}
              onChange={(e) => setLloydRatio(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Switchback Shocks
            </label>
            <input
              type="number"
              min={1}
              max={24}
              step={1}
              value={switchbackShocks}
              onChange={(e) => setSwitchbackShocks(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              WDW Anchor Gain
            </label>
            <input
              type="number"
              min={0.85}
              max={2.5}
              step={0.05}
              value={wdwGain}
              onChange={(e) => setWdwGain(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleAudit}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-lg transition shadow-lg shadow-teal-900/30"
        >
          <Sparkles className="w-4 h-4" />
          <span>{loading ? 'Auditing WDW Complexity...' : 'Audit WDW Action & Switchback'}</span>
        </button>
      </div>

      {telemetry && (
        <div className="bg-teal-950/20 border border-teal-800/50 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-teal-900/50 pb-3">
            <div className="flex items-center space-x-2 text-teal-400 font-semibold text-sm">
              <Cpu className="w-4 h-4" />
              <span>Holographic WDW Complexity Telemetry ({telemetry.bound_id})</span>
            </div>
            <span className="text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
              {telemetry.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Action C_A Norm</div>
              <div className="text-base font-bold text-teal-300">
                {telemetry.action_complexity_norm}
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Chaos Suppression</div>
              <div className="text-base font-bold text-cyan-300">
                {telemetry.chaos_suppression_db} dB
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">WDW Fidelity</div>
              <div className="text-base font-bold text-emerald-300">
                {telemetry.complexity_fidelity_pct}%
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Drift Residual</div>
              <div className="text-base font-bold text-indigo-300">
                {telemetry.complexity_drift_residual}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

