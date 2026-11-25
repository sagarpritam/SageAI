"use client";

import React, { useState, useEffect } from "react";
import { Shield, Activity, RefreshCw, Zap, Lock, AlertTriangle, Layers } from "lucide-react";

interface FanoVariety {
  variety_id: string;
  variety_name: string;
  complex_dimension: number;
  fano_index_r: number;
  donaldson_futaki_invariant: number;
  ding_functional_coercivity: number;
  base_stability_fidelity_pct: number;
  status: string;
}

interface YTDTelemetry {
  variety_id: string;
  status: string;
  donaldson_futaki_invariant: number;
  ding_functional_coercivity: number;
  kahler_einstein_metric_solvable: boolean;
  test_configuration_exponent: number;
  ytd_shield_strength_pev: number;
  ricci_suppression_db: number;
  effective_fidelity_pct: number;
  complex_dimension: number;
  timestamp: number;
}

export function YauTianDonaldsonStudio() {
  const [varieties, setVarieties] = useState<FanoVariety[]>([]);
  const [selectedVariety, setSelectedVariety] = useState<string>("");
  const [testConfigExp, setTestConfigExp] = useState<number>(2);
  const [coercivityThreshold, setCoercivityThreshold] = useState<number>(0.05);
  const [kahlerGain, setKahlerGain] = useState<number>(1.25);
  const [telemetry, setTelemetry] = useState<YTDTelemetry | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVarieties = async () => {
    try {
      const res = await fetch("/api/yau-tian-donaldson-k-stability/varieties");
      if (!res.ok) throw new Error("Failed to fetch Fano varieties");
      const data = await res.json();
      setVarieties(data.varieties || []);
      if (data.varieties?.length > 0 && !selectedVariety) {
        setSelectedVariety(data.varieties[0].variety_id);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error fetching varieties");
    }
  };

  useEffect(() => {
    fetchVarieties();
  }, []);

  const handleVerifyKStability = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/yau-tian-donaldson-k-stability/verify-k-stability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variety_id: selectedVariety,
          test_configuration_exponent: testConfigExp,
          coercivity_threshold: coercivityThreshold,
          kahler_gain: kahlerGain,
        }),
      });
      if (!res.ok) throw new Error("Failed to verify YTD K-stability");
      const data = await res.json();
      setTelemetry(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error verifying K-stability");
    } finally {
      setLoading(false);
    }
  };

  const currentVariety = varieties.find((v) => v.variety_id === selectedVariety);

  return (
    <div className="p-6 bg-slate-950 text-slate-100 rounded-xl border border-slate-800 shadow-2xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Yau-Tian-Donaldson K-Stability & Kahler-Einstein Shield
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                Capability 182
              </span>
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              Shing-Tung Yau, Gang Tian, Simon Donaldson K-polystability of Fano varieties, Ding functional coercivity &amp; Kahler-Einstein solvability
            </p>
          </div>
        </div>
        <button
          onClick={fetchVarieties}
          className="flex items-center gap-2 px-3.5 py-2 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Varieties
        </button>
      </div>

      {error && (
        <div className="p-4 bg-emerald-950/50 border border-emerald-800 rounded-lg text-emerald-200 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Fano Algebraic Variety
          </label>
          <select
            value={selectedVariety}
            onChange={(e) => setSelectedVariety(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {varieties.map((v) => (
              <option key={v.variety_id} value={v.variety_id}>
                {v.variety_id} (dim {v.complex_dimension})
              </option>
            ))}
          </select>
          {currentVariety && (
            <p className="text-xs text-slate-500 italic mt-1">{currentVariety.variety_name}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Test Configuration Exponent: {testConfigExp}
          </label>
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={testConfigExp}
            onChange={(e) => setTestConfigExp(parseInt(e.target.value, 10))}
            className="w-full accent-emerald-500"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>1 (Base Degeneration)</span>
            <span>10 (High Exponent)</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Kahler Metric Gain: {kahlerGain}x
          </label>
          <input
            type="range"
            min="0.5"
            max="3.0"
            step="0.25"
            value={kahlerGain}
            onChange={(e) => setKahlerGain(parseFloat(e.target.value))}
            className="w-full accent-emerald-500"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>0.5x</span>
            <span>3.0x</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleVerifyKStability}
          disabled={loading || !selectedVariety}
          className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium rounded-lg shadow-lg shadow-emerald-950/50 transition cursor-pointer"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
          Enforce YTD K-Stability Shield
        </button>
      </div>

      {telemetry && (
        <div className="p-5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              YTD K-Stability Telemetry
            </h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/50">
              {telemetry.status}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/60">
              <p className="text-xs text-slate-400">Futaki Invariant</p>
              <p className="text-lg font-bold text-white mt-0.5">{telemetry.donaldson_futaki_invariant}</p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/60">
              <p className="text-xs text-slate-400">Ding Coercivity</p>
              <p className="text-lg font-bold text-emerald-400 mt-0.5">{telemetry.ding_functional_coercivity}</p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/60">
              <p className="text-xs text-slate-400">Shield Strength</p>
              <p className="text-lg font-bold text-white mt-0.5">{telemetry.ytd_shield_strength_pev} PeV</p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/60">
              <p className="text-xs text-slate-400">Ricci Suppression</p>
              <p className="text-lg font-bold text-cyan-400 mt-0.5">+{telemetry.ricci_suppression_db} dB</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default YauTianDonaldsonStudio;
