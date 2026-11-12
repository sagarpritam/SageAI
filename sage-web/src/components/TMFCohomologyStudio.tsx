'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Shield, RefreshCw, Sparkles, Cpu, AlertTriangle, Layers } from 'lucide-react';

interface TMFStratum {
  stratum_id: string;
  spectrum: string;
  default_modular_weight: number;
  default_torsion_order: number;
  default_adams_page: number;
  base_cohomology_fidelity_pct: number;
  base_torsion_suppression_db: number;
  status: string;
}

interface SealTorsionResult {
  stratum_id: string;
  spectrum: string;
  modular_weight: number;
  torsion_order: number;
  adams_page: number;
  elliptic_damping_gain: number;
  modular_discriminant_modulus: number;
  torsion_anomaly_residual: number;
  torsion_suppression_db: number;
  cohomology_fidelity_pct: number;
  witten_genus_integral_locked: boolean;
  status: string;
  timestamp: number;
}

export default function TMFCohomologyStudio() {
  const [strata, setStrata] = useState<TMFStratum[]>([]);
  const [selectedStratum, setSelectedStratum] = useState<string>('TMF-WITTEN-GENUS-01');
  const [modularWeight, setModularWeight] = useState<number>(12);
  const [torsionOrder, setTorsionOrder] = useState<number>(24);
  const [adamsPage, setAdamsPage] = useState<number>(3);
  const [ellipticGain, setEllipticGain] = useState<number>(1.45);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<SealTorsionResult | null>(null);

  const fetchStrata = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/tmf-cohomology/strata');
      const data = (await res.json().catch(() => ({}))) as {
        strata?: TMFStratum[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load TMF strata');
      }
      if (data.strata) {
        setStrata(data.strata);
        if (data.strata.length > 0) {
          setSelectedStratum((prev) => prev || data.strata![0].stratum_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to load TMF strata');
    }
  }, []);

  useEffect(() => {
    fetchStrata();
  }, [fetchStrata]);

  const handleSealTorsion = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/tmf-cohomology/seal-torsion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stratum_id: selectedStratum,
          modular_weight: modularWeight,
          torsion_order: torsionOrder,
          adams_page: adamsPage,
          elliptic_damping_gain: ellipticGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as SealTorsionResult & {
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'TMF torsion cancellation failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'TMF torsion cancellation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <Layers className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-amber-300">
              Capability 121: Topological Modular Forms (TMF) Cohomology Shield
            </h2>
            <p className="text-sm text-slate-400">
              Witten genus modular discriminants, Z/24 homotopy torsion cancellation &amp; Adams-Novikov spectral locks
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchStrata}
          className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Strata</span>
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
        {strata.map((s) => (
          <button
            type="button"
            key={s.stratum_id}
            onClick={() => setSelectedStratum(s.stratum_id)}
            aria-pressed={selectedStratum === s.stratum_id}
            className={`text-left p-4 rounded-lg border transition ${
              selectedStratum === s.stratum_id
                ? 'bg-amber-950/40 border-amber-500/60 shadow-lg shadow-amber-950/50'
                : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-semibold text-amber-400">
                {s.stratum_id}
              </span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono">
                {s.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2">{s.spectrum}</p>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div className="flex justify-between">
                <span>Weight / Torsion:</span>
                <span className="text-amber-300">
                  k={s.default_modular_weight} (Z/{s.default_torsion_order})
                </span>
              </div>
              <div className="flex justify-between">
                <span>Cohomology Fidelity:</span>
                <span className="text-cyan-300">{s.base_cohomology_fidelity_pct.toFixed(3)}%</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-amber-400" />
          <span>Witten Genus &amp; Homotopy Torsion Controls</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Modular Weight k: <span className="text-amber-300 font-mono">{modularWeight}</span>
            </label>
            <input
              type="range"
              min="4"
              max="48"
              step="4"
              value={modularWeight}
              onChange={(e) => setModularWeight(parseInt(e.target.value, 10))}
              className="w-full accent-amber-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Torsion Order: <span className="text-amber-300 font-mono">Z/{torsionOrder}</span>
            </label>
            <input
              type="range"
              min="2"
              max="24"
              step="2"
              value={torsionOrder}
              onChange={(e) => setTorsionOrder(parseInt(e.target.value, 10))}
              className="w-full accent-amber-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Adams Page r: <span className="text-amber-300 font-mono">E_{adamsPage}</span>
            </label>
            <input
              type="range"
              min="2"
              max="9"
              step="1"
              value={adamsPage}
              onChange={(e) => setAdamsPage(parseInt(e.target.value, 10))}
              className="w-full accent-amber-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Elliptic Gain: <span className="text-amber-300 font-mono">{ellipticGain.toFixed(2)}x</span>
            </label>
            <input
              type="range"
              min="0.85"
              max="2.5"
              step="0.05"
              value={ellipticGain}
              onChange={(e) => setEllipticGain(parseFloat(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSealTorsion}
          disabled={loading}
          className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold text-sm rounded-lg transition disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg shadow-amber-950/50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Evaluating Witten Genus &amp; TMF Torsion...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Seal Z/24 TMF Torsion &amp; Lock Elliptic Cohomology</span>
            </>
          )}
        </button>
      </div>

      {telemetry && (
        <div className="bg-amber-950/20 border border-amber-500/30 rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
            <span className="text-xs font-mono font-semibold text-amber-300">
              TOPOLOGICAL MODULAR FORMS TELEMETRY
            </span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono">
              {telemetry.status}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">COHOMOLOGY FIDELITY</span>
              <span className="text-amber-300 font-bold text-sm">
                {telemetry.cohomology_fidelity_pct.toFixed(4)}%
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">DISCRIMINANT CUSP</span>
              <span className="text-cyan-300 font-bold text-sm">
                {telemetry.modular_discriminant_modulus.toFixed(5)}
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">TORSION QUENCH</span>
              <span className="text-emerald-300 font-bold text-sm">
                {telemetry.torsion_suppression_db.toFixed(1)} dB
              </span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">ANOMALY RESIDUAL</span>
              <span className="text-rose-300 font-bold text-sm">
                {telemetry.torsion_anomaly_residual.toExponential(2)}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-[11px] text-amber-300 font-mono pt-1">
            <Shield className="w-3.5 h-3.5" />
            <span>
              Witten Genus Integral Locked | Adams E_{telemetry.adams_page} Converged
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

