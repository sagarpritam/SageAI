'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Atom, RefreshCw, Shield, Sparkles, Sliders, AlertTriangle } from 'lucide-react';

interface QESHorizon {
  horizon_id: string;
  geometry: string;
  default_bh_entropy_s0: number;
  default_page_ratio: number;
  base_unitarity_fidelity_pct: number;
  base_firewall_quench_db: number;
  status: string;
}

interface AuditPageCurveResult {
  horizon_id: string;
  geometry: string;
  bekenstein_hawking_entropy_s0: number;
  evaporation_page_ratio: number;
  cft_central_charge_c: number;
  wormhole_saddle_gain: number;
  hawking_no_island_entropy: number;
  qes_island_saddle_entropy: number;
  physical_page_entropy: number;
  island_saddle_dominant: boolean;
  amps_firewall_residual: number;
  firewall_quench_db: number;
  unitarity_fidelity_pct: number;
  status: string;
  timestamp: number;
}

export default function QuantumExtremalIslandStudio() {
  const [horizons, setHorizons] = useState<QESHorizon[]>([]);
  const [selectedHorizon, setSelectedHorizon] = useState<string>('QES-PAGE-JT-ADS2-01');
  const [bhEntropy, setBhEntropy] = useState<number>(180);
  const [pageRatio, setPageRatio] = useState<number>(1.35);
  const [centralCharge, setCentralCharge] = useState<number>(24);
  const [saddleGain, setSaddleGain] = useState<number>(1.25);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<AuditPageCurveResult | null>(null);

  const fetchHorizons = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/quantum-extremal-island/horizons');
      const data = (await res.json().catch(() => ({}))) as {
        horizons?: QESHorizon[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load QES Island horizons');
      }
      if (data.horizons) {
        setHorizons(data.horizons);
        if (data.horizons.length > 0) {
          setSelectedHorizon((prev) => prev || data.horizons![0].horizon_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to load QES Island horizons');
    }
  }, []);

  useEffect(() => {
    fetchHorizons();
  }, [fetchHorizons]);

  const handleAudit = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/quantum-extremal-island/audit-page-curve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          horizon_id: selectedHorizon,
          bekenstein_hawking_entropy_s0: bhEntropy,
          evaporation_page_ratio: pageRatio,
          cft_central_charge_c: centralCharge,
          wormhole_saddle_gain: saddleGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as AuditPageCurveResult & {
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'QES Page Curve audit failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'QES Page Curve audit failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
            <Atom className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-cyan-300">
              Capability 114: AdS/BCFT Takayanagi Island QES &amp; Page Curve Auditor
            </h2>
            <p className="text-sm text-slate-400">
              Replica-wormhole generalized entropy S_gen(I) extremization &amp; AMPS firewall elimination
            </p>
          </div>
        </div>
        <button
          onClick={fetchHorizons}
          className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Horizons</span>
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
        {horizons.map((h) => (
          <div
            key={h.horizon_id}
            onClick={() => setSelectedHorizon(h.horizon_id)}
            className={`cursor-pointer p-4 rounded-lg border transition ${
              selectedHorizon === h.horizon_id
                ? 'bg-cyan-950/40 border-cyan-500/60 shadow-lg shadow-cyan-950/50'
                : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-semibold text-cyan-400">
                {h.horizon_id}
              </span>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full font-mono">
                {h.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2">{h.geometry}</p>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div className="flex justify-between">
                <span>Bekenstein S_0:</span>
                <span className="text-cyan-300">{h.default_bh_entropy_s0.toFixed(0)} nats</span>
              </div>
              <div className="flex justify-between">
                <span>Unitarity Fidelity:</span>
                <span className="text-emerald-300">{h.base_unitarity_fidelity_pct.toFixed(3)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span>Quantum Extremal Surface Saddle &amp; Page Turnover Controls</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Horizon Entropy S_0: <span className="text-cyan-300 font-mono">{bhEntropy}</span>
            </label>
            <input
              type="range"
              min="40"
              max="600"
              step="10"
              value={bhEntropy}
              onChange={(e) => setBhEntropy(parseInt(e.target.value, 10))}
              className="w-full accent-cyan-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Page Ratio (t / t_P): <span className="text-cyan-300 font-mono">{pageRatio}</span>
            </label>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.05"
              value={pageRatio}
              onChange={(e) => setPageRatio(parseFloat(e.target.value))}
              className="w-full accent-cyan-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              CFT Charge c: <span className="text-cyan-300 font-mono">{centralCharge}</span>
            </label>
            <input
              type="range"
              min="4"
              max="128"
              step="4"
              value={centralCharge}
              onChange={(e) => setCentralCharge(parseInt(e.target.value, 10))}
              className="w-full accent-cyan-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Wormhole Gain: <span className="text-cyan-300 font-mono">{saddleGain}x</span>
            </label>
            <input
              type="range"
              min="0.8"
              max="2.5"
              step="0.05"
              value={saddleGain}
              onChange={(e) => setSaddleGain(parseFloat(e.target.value))}
              className="w-full accent-cyan-500"
            />
          </div>
        </div>

        <button
          onClick={handleAudit}
          disabled={loading}
          className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-sm rounded-lg transition disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg shadow-cyan-950/50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Extremizing Replica-Wormhole QES Saddle...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Audit QES Island Page Curve &amp; Firewall Elimination</span>
            </>
          )}
        </button>
      </div>

      {telemetry && (
        <div className="bg-cyan-950/20 border border-cyan-500/30 rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
            <span className="text-xs font-mono font-semibold text-cyan-300">
              TAKAYANAGI ISLAND QES UNITARITY TELEMETRY
            </span>
            <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-mono">
              {telemetry.status}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">UNITARITY FIDELITY</span>
              <span className="text-emerald-300 font-bold text-sm">
                {telemetry.unitarity_fidelity_pct.toFixed(4)}%
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">PHYSICAL S_PAGE</span>
              <span className="text-cyan-300 font-bold text-sm">
                {telemetry.physical_page_entropy.toFixed(2)} nats
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">HAWKING BRANCH</span>
              <span className="text-blue-300 font-bold text-sm">
                {telemetry.hawking_no_island_entropy.toFixed(1)} nats
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">FIREWALL QUENCH</span>
              <span className="text-amber-300 font-bold text-sm">
                {telemetry.firewall_quench_db.toFixed(1)} dB
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-[11px] text-cyan-300 font-mono pt-1">
            <Shield className="w-3.5 h-3.5" />
            <span>
              Replica-Wormhole Island Saddle Active | AMPS Firewall Residual={telemetry.amps_firewall_residual}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

