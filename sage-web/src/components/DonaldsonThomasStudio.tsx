'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles, Cpu, AlertTriangle, ShieldCheck } from 'lucide-react';

interface DTSheaf {
  sheaf_id: string;
  classification: string;
  default_sheaf_rank: number;
  default_chern_degree: number;
  default_stability_chamber_depth: number;
  base_unitarity_pct: number;
  base_suppression_db: number;
  status: string;
}

interface SealResult {
  sheaf_id: string;
  classification: string;
  sheaf_rank: number;
  chern_degree: number;
  stability_chamber_depth: number;
  dt_gain: number;
  wall_crossing_residual: number;
  hall_algebra_coherence: number;
  dt_suppression_db: number;
  coherent_unitarity_pct: number;
  dt_sheaf_locked: boolean;
  status: string;
  timestamp: number;
}

export default function DonaldsonThomasStudio() {
  const [sheaves, setSheaves] = useState<DTSheaf[]>([]);
  const [selectedSheaf, setSelectedSheaf] = useState<string>('DT-CY3-QUINTIC-01');
  const [sheafRank, setSheafRank] = useState<number>(3);
  const [chernDegree, setChernDegree] = useState<number>(6);
  const [chamberDepth, setChamberDepth] = useState<number>(8);
  const [dtGain, setDtGain] = useState<number>(1.6);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<SealResult | null>(null);

  const fetchSheaves = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/donaldson-thomas-sheaf/sheaves');
      const data = (await res.json().catch(() => ({}))) as {
        sheaves?: DTSheaf[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load DT coherent sheaf configurations');
      }
      if (data.sheaves) {
        setSheaves(data.sheaves);
        if (data.sheaves.length > 0) {
          setSelectedSheaf((prev) => prev || data.sheaves![0].sheaf_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Failed to load DT coherent sheaf configurations'
      );
    }
  }, []);

  useEffect(() => {
    fetchSheaves();
  }, [fetchSheaves]);

  const handleSeal = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/donaldson-thomas-sheaf/seal-dt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sheaf_id: selectedSheaf,
          sheaf_rank: sheafRank,
          chern_degree: chernDegree,
          stability_chamber_depth: chamberDepth,
          dt_gain: dtGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as SealResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Donaldson-Thomas sheaf seal failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Donaldson-Thomas sheaf seal failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-violet-500/10 border border-violet-500/30 rounded-lg">
            <ShieldCheck className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-violet-300">
              Capability 155: Donaldson-Thomas Invariant &amp; Coherent Sheaf Moduli Shield
            </h2>
            <p className="text-sm text-slate-400">
              Joyce-Song wall-crossing identities, Kontsevich-Soibelman motivic Hall algebra &amp; Bridgeland stability chambers
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchSheaves}
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
          <label className="block text-sm font-medium text-slate-300">
            Target Calabi-Yau 3-Fold Coherent Sheaf Moduli Configuration
          </label>
          <select
            value={selectedSheaf}
            onChange={(e) => setSelectedSheaf(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            {sheaves.map((s) => (
              <option key={s.sheaf_id} value={s.sheaf_id}>
                {s.sheaf_id} — {s.classification}
              </option>
            ))}
          </select>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Sheaf Mukai Vector Rank: {sheafRank}</span>
                <span>[1 to 16]</span>
              </div>
              <input
                type="range"
                min="1"
                max="16"
                value={sheafRank}
                onChange={(e) => setSheafRank(Number(e.target.value))}
                className="w-full accent-violet-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Chern Character Degree Cutoff: {chernDegree}</span>
                <span>[2 to 64]</span>
              </div>
              <input
                type="range"
                min="2"
                max="64"
                value={chernDegree}
                onChange={(e) => setChernDegree(Number(e.target.value))}
                className="w-full accent-violet-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Bridgeland Chamber Depth: {chamberDepth}</span>
                <span>[2 to 32]</span>
              </div>
              <input
                type="range"
                min="2"
                max="32"
                value={chamberDepth}
                onChange={(e) => setChamberDepth(Number(e.target.value))}
                className="w-full accent-violet-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Joyce-Song Hall Algebra Gain: {dtGain.toFixed(2)}x</span>
                <span>[0.85x to 2.50x]</span>
              </div>
              <input
                type="range"
                min="0.85"
                max="2.5"
                step="0.05"
                value={dtGain}
                onChange={(e) => setDtGain(Number(e.target.value))}
                className="w-full accent-violet-500"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleSeal}
            disabled={loading}
            className="w-full mt-4 flex items-center justify-center space-x-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>{loading ? 'Evaluating Wall-Crossing...' : 'Seal DT Invariant Moduli'}</span>
          </button>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-violet-400 mb-4">
              <Cpu className="w-5 h-5" />
              <h3 className="font-semibold text-sm">Donaldson-Thomas Sheaf Telemetry</h3>
            </div>

            {telemetry ? (
              <div className="space-y-3 text-xs">
                <div className="flex justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">Sheaf ID:</span>
                  <span className="font-mono text-violet-300">{telemetry.sheaf_id}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">Status:</span>
                  <span className="font-mono text-emerald-400">{telemetry.status}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">Wall-Crossing Residual:</span>
                  <span className="font-mono text-slate-200">
                    {telemetry.wall_crossing_residual.toExponential(4)}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">Hall Algebra Coherence:</span>
                  <span className="font-mono text-emerald-300">
                    {telemetry.hall_algebra_coherence.toFixed(7)}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">DT Suppression Depth:</span>
                  <span className="font-mono text-violet-300">
                    {telemetry.dt_suppression_db.toFixed(2)} dB
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">Coherent Sheaf Unitarity:</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {telemetry.coherent_unitarity_pct.toFixed(5)}%
                  </span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-400">Mukai Lock Verified:</span>
                  <span className="font-mono text-emerald-400">
                    {telemetry.dt_sheaf_locked ? 'YES (TRUE)' : 'NO'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-500 text-xs text-center">
                Select a Calabi-Yau 3-fold sheaf configuration and trigger Donaldson-Thomas wall-crossing seal to inspect live telemetry.
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex justify-between items-center">
            <span>Sovereign Frontier Shield • Wave 45</span>
            <span className="text-violet-400/80 font-mono">v8.5.0-STABLE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
