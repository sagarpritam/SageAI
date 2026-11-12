'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles, Cpu, AlertTriangle, GitBranch } from 'lucide-react';

interface EntanglementWedgeDomain {
  wedge_id: string;
  geometry: string;
  default_ew_area: number;
  default_mutual_info: number;
  default_boundary_count: number;
  base_fidelity_pct: number;
  base_isolation_db: number;
  status: string;
}

interface AuditWedgeResult {
  wedge_id: string;
  geometry: string;
  ew_cross_section_area: number;
  reflected_entropy_sr: number;
  mutual_information_iab: number;
  cross_section_boundaries: number;
  markov_gap_h: number;
  markov_lower_bound: number;
  markov_gap_certified: boolean;
  purification_gain: number;
  multipartite_leak_residual: number;
  wedge_isolation_db: number;
  canonical_purification_fidelity_pct: number;
  status: string;
  timestamp: number;
}

export default function EntanglementWedgeStudio() {
  const [wedges, setWedges] = useState<EntanglementWedgeDomain[]>([]);
  const [selectedWedge, setSelectedWedge] = useState<string>('EW-ADS3-DOUBLE-WEDGE-01');
  const [ewArea, setEwArea] = useState<number>(3.4);
  const [mutualInfo, setMutualInfo] = useState<number>(4.9);
  const [boundaries, setBoundaries] = useState<number>(2);
  const [clampGain, setClampGain] = useState<number>(1.6);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<AuditWedgeResult | null>(null);

  const fetchWedges = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/entanglement-wedge-cross/wedges');
      const data = (await res.json().catch(() => ({}))) as {
        wedges?: EntanglementWedgeDomain[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load entanglement wedge domains');
      }
      if (data.wedges) {
        setWedges(data.wedges);
        if (data.wedges.length > 0) {
          setSelectedWedge((prev) => prev || data.wedges![0].wedge_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to load entanglement wedge domains');
    }
  }, []);

  useEffect(() => {
    fetchWedges();
  }, [fetchWedges]);

  const handleAudit = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/entanglement-wedge-cross/audit-wedge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wedge_id: selectedWedge,
          ew_area: ewArea,
          mutual_information: mutualInfo,
          cross_section_boundaries: boundaries,
          purification_gain: clampGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as AuditWedgeResult & {
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Entanglement wedge E_W audit failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Entanglement wedge E_W audit failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
            <GitBranch className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-emerald-300">
              Capability 130: Reflected Entropy (S_R) &amp; Entanglement Wedge Cross-Section (E_W) Guard
            </h2>
            <p className="text-sm text-slate-400">
              Canonical purification |√ρ_AB⟩ duality S_R = 2E_W &amp; Hayden-Parrikar-Sorce Markov gap enforcement
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchWedges}
          className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Wedges</span>
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
        {wedges.map((w) => (
          <button
            type="button"
            key={w.wedge_id}
            onClick={() => setSelectedWedge(w.wedge_id)}
            aria-pressed={selectedWedge === w.wedge_id}
            className={`text-left p-4 rounded-lg border transition ${
              selectedWedge === w.wedge_id
                ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-950/50'
                : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-semibold text-emerald-400">{w.wedge_id}</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
                {w.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2">{w.geometry}</p>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div>E_W={w.default_ew_area} | Boundaries={w.default_boundary_count}</div>
              <div>Base Isolation: {w.base_isolation_db} dB</div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Wedge Area E_W(A:B)
            </label>
            <input
              type="number"
              min={1}
              max={24}
              step={0.1}
              value={ewArea}
              onChange={(e) => setEwArea(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Mutual Info I(A:B)
            </label>
            <input
              type="number"
              min={0}
              max={40}
              step={0.1}
              value={mutualInfo}
              onChange={(e) => setMutualInfo(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Extremal Boundaries
            </label>
            <input
              type="number"
              min={1}
              max={16}
              step={1}
              value={boundaries}
              onChange={(e) => setBoundaries(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Purification Gain
            </label>
            <input
              type="number"
              min={0.85}
              max={2.5}
              step={0.05}
              value={clampGain}
              onChange={(e) => setClampGain(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleAudit}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-lg transition shadow-lg shadow-emerald-900/30"
        >
          <Sparkles className="w-4 h-4" />
          <span>{loading ? 'Auditing Entanglement Wedge...' : 'Audit Reflected Entropy & Markov Gap'}</span>
        </button>
      </div>

      {telemetry && (
        <div className="bg-emerald-950/20 border border-emerald-800/50 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-900/50 pb-3">
            <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-sm">
              <Cpu className="w-4 h-4" />
              <span>Entanglement Wedge E_W Telemetry ({telemetry.wedge_id})</span>
            </div>
            <span className="text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
              {telemetry.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Purification Fidelity</div>
              <div className="text-base font-bold text-emerald-300">
                {telemetry.canonical_purification_fidelity_pct}%
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Wedge Isolation</div>
              <div className="text-base font-bold text-teal-300">
                {telemetry.wedge_isolation_db} dB
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Reflected Entropy S_R</div>
              <div className="text-base font-bold text-cyan-300">
                {telemetry.reflected_entropy_sr}
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Markov Gap h(A:B)</div>
              <div className="text-base font-bold text-indigo-300">
                {telemetry.markov_gap_h}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

