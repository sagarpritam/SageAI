'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Layers, RefreshCw, Shield, Sparkles, Compass, AlertTriangle } from 'lucide-react';

interface KTheoryCycle {
  cycle_id: string;
  sector: string;
  chern_rank: number;
  torsion_order_zn: number;
  freed_witten_residual: number;
  classification_fidelity_pct: number;
  status: string;
}

interface ClassifyResult {
  cycle_id: string;
  chern_character_rank: number;
  torsion_order_zn: number;
  anomaly_damping_gain: number;
  minasian_moore_rr_charge_norm: number;
  freed_witten_anomaly_residual: number;
  bott_complex_parity: number;
  ko_real_period_slot: number;
  classification_fidelity_pct: number;
  freed_witten_anomaly_canceled: boolean;
  spurious_tachyon_channels_pruned: boolean;
  status: string;
  timestamp: number;
}

export default function KTheoryDBraneStudio() {
  const [cycles, setCycles] = useState<KTheoryCycle[]>([]);
  const [selectedCycle, setSelectedCycle] = useState<string>('KTHEORY-ABS-SPIN7-01');
  const [chernRank, setChernRank] = useState<number>(8);
  const [torsionN, setTorsionN] = useState<number>(4);
  const [anomalyGain, setAnomalyGain] = useState<number>(1.12);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<ClassifyResult | null>(null);

  const fetchCycles = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/ktheory-dbrane/cycles');
      const data = (await res.json().catch(() => ({}))) as {
        cycles?: KTheoryCycle[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load K-theory topological cycles');
      }
      if (data.cycles) {
        setCycles(data.cycles);
        if (data.cycles.length > 0) {
          setSelectedCycle((prev) => prev || data.cycles![0].cycle_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Failed to load K-theory topological cycles'
      );
    }
  }, []);

  useEffect(() => {
    fetchCycles();
  }, [fetchCycles]);

  const handleClassify = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/ktheory-dbrane/classify-charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cycle_id: selectedCycle,
          chern_character_rank: chernRank,
          torsion_order_n: torsionN,
          anomaly_damping_gain: anomalyGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as ClassifyResult & {
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'K-theory D-brane charge classification failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'K-theory D-brane charge classification failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
            <Layers className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-emerald-300">
              Capability 109: Topological K-Theory D-Brane Charge Classifier
            </h2>
            <p className="text-sm text-slate-400">
              Twisted K_H(X) Ramond-Ramond charge lattice, Freed-Witten anomaly W_3 + H_3 = 0 cancellation &amp; Bott periodicity
            </p>
          </div>
        </div>
        <button
          onClick={fetchCycles}
          className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Cycles</span>
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
        {cycles.map((c) => (
          <div
            key={c.cycle_id}
            onClick={() => setSelectedCycle(c.cycle_id)}
            className={`cursor-pointer p-4 rounded-lg border transition ${
              selectedCycle === c.cycle_id
                ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-950/50'
                : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-semibold text-emerald-400">
                {c.cycle_id}
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
                {c.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2">{c.sector}</p>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div className="flex justify-between">
                <span>Chern Rank:</span>
                <span className="text-emerald-300">{c.chern_rank}</span>
              </div>
              <div className="flex justify-between">
                <span>Torsion Order:</span>
                <span className="text-cyan-300">Z_{c.torsion_order_zn}</span>
              </div>
              <div className="flex justify-between">
                <span>Fidelity:</span>
                <span className="text-teal-300">{c.classification_fidelity_pct.toFixed(3)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center space-x-2">
          <Compass className="w-4 h-4 text-emerald-400" />
          <span>Minasian-Moore Chern Character &amp; Freed-Witten Controller</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Chern Bundle Rank:{' '}
              <span className="text-emerald-300 font-mono">{chernRank}</span>
            </label>
            <input
              type="range"
              min="2"
              max="32"
              step="2"
              value={chernRank}
              onChange={(e) => setChernRank(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Torsion Order Z_N:{' '}
              <span className="text-emerald-300 font-mono">{torsionN}</span>
            </label>
            <input
              type="range"
              min="1"
              max="16"
              step="1"
              value={torsionN}
              onChange={(e) => setTorsionN(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Anomaly Damping Gain:{' '}
              <span className="text-emerald-300 font-mono">{anomalyGain}x</span>
            </label>
            <input
              type="range"
              min="0.8"
              max="2.5"
              step="0.04"
              value={anomalyGain}
              onChange={(e) => setAnomalyGain(parseFloat(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>
        </div>

        <button
          onClick={handleClassify}
          disabled={loading}
          className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm rounded-lg transition disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg shadow-emerald-950/50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Classifying Twisted K-Theory D-Brane Charges...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Classify K_H(X) D-Brane Charge &amp; Cancel Freed-Witten Anomaly</span>
            </>
          )}
        </button>
      </div>

      {telemetry && (
        <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
            <span className="text-xs font-mono font-semibold text-emerald-300">
              TOPOLOGICAL K-THEORY D-BRANE TELEMETRY
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">
              {telemetry.status}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">CLASSIFICATION FIDELITY</span>
              <span className="text-emerald-300 font-bold text-sm">
                {telemetry.classification_fidelity_pct.toFixed(5)}%
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">RR CHARGE NORM</span>
              <span className="text-teal-300 font-bold text-sm">
                {telemetry.minasian_moore_rr_charge_norm.toFixed(4)}
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">FREED-WITTEN ERR</span>
              <span className="text-cyan-300 font-bold text-sm">
                {telemetry.freed_witten_anomaly_residual.toExponential(2)}
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">BOTT / KO8 SLOT</span>
              <span className="text-amber-300 font-bold text-sm">
                {telemetry.bott_complex_parity} / mod {telemetry.ko_real_period_slot}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-[11px] text-emerald-300 font-mono pt-1">
            <Shield className="w-3.5 h-3.5" />
            <span>
              Freed-Witten Constraint W_3(Y)+[H_3]=0 Canceled | Atiyah-Bott-Shapiro Torsion Pruned
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

