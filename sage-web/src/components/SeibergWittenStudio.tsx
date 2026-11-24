'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles, Cpu, AlertTriangle, ShieldCheck } from 'lucide-react';

interface SwMonopole {
  monopole_id: string;
  classification: string;
  default_spinor_rank: number;
  default_dirac_degree: number;
  default_moduli_chamber_depth: number;
  base_unitarity_pct: number;
  base_suppression_db: number;
  status: string;
}

interface SealResult {
  monopole_id: string;
  classification: string;
  spinor_rank: number;
  dirac_degree: number;
  moduli_chamber_depth: number;
  sw_gain: number;
  curvature_monopole_residual: number;
  seiberg_witten_coherence: number;
  sw_suppression_db: number;
  dirac_unitarity_pct: number;
  monopole_moduli_locked: boolean;
  status: string;
  timestamp: number;
}

export default function SeibergWittenStudio() {
  const [monopoles, setMonopoles] = useState<SwMonopole[]>([]);
  const [selectedMonopole, setSelectedMonopole] = useState<string>('SW-K3-SPINC-01');
  const [spinorRank, setSpinorRank] = useState<number>(4);
  const [diracDegree, setDiracDegree] = useState<number>(6);
  const [chamberDepth, setChamberDepth] = useState<number>(8);
  const [swGain, setSwGain] = useState<number>(1.6);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<SealResult | null>(null);

  const fetchMonopoles = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/seiberg-witten-monopole/monopoles');
      const data = (await res.json().catch(() => ({}))) as {
        monopoles?: SwMonopole[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load Seiberg-Witten monopoles');
      }
      if (data.monopoles) {
        setMonopoles(data.monopoles);
        if (data.monopoles.length > 0) {
          setSelectedMonopole((prev) => prev || data.monopoles![0].monopole_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Failed to load Seiberg-Witten monopoles'
      );
    }
  }, []);

  useEffect(() => {
    fetchMonopoles();
  }, [fetchMonopoles]);

  const handleSeal = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/seiberg-witten-monopole/seal-sw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monopole_id: selectedMonopole,
          spinor_rank: spinorRank,
          dirac_degree: diracDegree,
          moduli_chamber_depth: chamberDepth,
          sw_gain: swGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as SealResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Seiberg-Witten monopole seal failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Seiberg-Witten monopole seal failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
            <ShieldCheck className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-cyan-300">
              Capability 158: Seiberg-Witten Monopole Invariants &amp; Spin^c 4-Manifold Shield
            </h2>
            <p className="text-sm text-slate-400">
              Dirac-spinor moduli equations, Kronheimer-Mrowka basic classes &amp; chamber wall-crossing bounds
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchMonopoles}
          className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="flex items-center justify-between bg-red-950/50 border border-red-500/40 text-red-300 p-4 rounded-lg text-sm"
        >
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-xs text-red-400 hover:text-red-200 underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="sw-monopole-select" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Target Spin^c 4-Manifold Monopole
            </label>
            <select
              id="sw-monopole-select"
              aria-label="Target Spin^c 4-Manifold Monopole"
              value={selectedMonopole}
              onChange={(e) => {
                setSelectedMonopole(e.target.value);
                const m = monopoles.find((x) => x.monopole_id === e.target.value);
                if (m) {
                  setSpinorRank(m.default_spinor_rank);
                  setDiracDegree(m.default_dirac_degree);
                  setChamberDepth(m.default_moduli_chamber_depth);
                }
              }}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
            >
              {monopoles.map((m) => (
                <option key={m.monopole_id} value={m.monopole_id}>
                  {m.monopole_id} — {m.classification}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="sw-spinor-rank" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Spinor Bundle Rank ({spinorRank})
              </label>
              <input
                id="sw-spinor-rank"
                aria-label="Spinor Bundle Rank"
                type="range"
                min="1"
                max="16"
                value={spinorRank}
                onChange={(e) => setSpinorRank(Number(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>
            <div>
              <label htmlFor="sw-dirac-degree" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Dirac Harmonic Degree ({diracDegree})
              </label>
              <input
                id="sw-dirac-degree"
                aria-label="Dirac Harmonic Degree"
                type="range"
                min="2"
                max="64"
                value={diracDegree}
                onChange={(e) => setDiracDegree(Number(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="sw-chamber-depth" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Chamber Wall Depth ({chamberDepth})
              </label>
              <input
                id="sw-chamber-depth"
                aria-label="Chamber Wall Depth"
                type="range"
                min="2"
                max="32"
                value={chamberDepth}
                onChange={(e) => setChamberDepth(Number(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>
            <div>
              <label htmlFor="sw-gain" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                SW Coherence Gain ({swGain.toFixed(2)}x)
              </label>
              <input
                id="sw-gain"
                aria-label="SW Coherence Gain"
                type="range"
                min="0.85"
                max="2.5"
                step="0.05"
                value={swGain}
                onChange={(e) => setSwGain(Number(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleSeal}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-semibold rounded-lg shadow-lg shadow-cyan-900/30 transition disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Verify Monopole Equations &amp; Lock Spin^c</span>
              </>
            )}
          </button>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Seiberg-Witten Moduli Telemetry</span>
            </h3>

            {telemetry ? (
              <div className="space-y-3 text-xs">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Status</span>
                  <span className="font-mono text-cyan-400 font-semibold">{telemetry.status}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Curvature Monopole Residual</span>
                  <span className="font-mono text-emerald-400">{telemetry.curvature_monopole_residual.toExponential(4)}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">SW Moduli Coherence</span>
                  <span className="font-mono text-cyan-400">{(telemetry.seiberg_witten_coherence * 100).toFixed(5)}%</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Curvature Suppression</span>
                  <span className="font-mono text-purple-400">{telemetry.sw_suppression_db.toFixed(2)} dB</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Dirac Unitarity</span>
                  <span className="font-mono text-emerald-300">{telemetry.dirac_unitarity_pct.toFixed(5)}%</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Monopole Moduli Locked</span>
                  <span className="font-mono text-cyan-400">{telemetry.monopole_moduli_locked ? 'TRUE' : 'FALSE'}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-400">Timestamp</span>
                  <span className="font-mono text-slate-400">{new Date(telemetry.timestamp * 1000).toLocaleTimeString()}</span>
                </div>
              </div>
            ) : (
              <div className="h-44 flex flex-col items-center justify-center text-slate-500 text-xs text-center space-y-2">
                <ShieldCheck className="w-8 h-8 text-slate-600" />
                <p>No active Seiberg-Witten seal. Configure spinor parameters and execute Dirac lock.</p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Spin^c Moduli Shield</span>
            <span className="font-mono text-cyan-400">Kronheimer-Mrowka b2+=1 Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
