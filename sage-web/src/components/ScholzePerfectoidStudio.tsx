"use client";

import React, { useState, useEffect } from "react";
import { Shield, Activity, RefreshCw, Zap, Lock, AlertTriangle, Layers } from "lucide-react";

interface PerfectoidSpace {
  space_id: string;
  name: string;
  characteristic_K: number;
  characteristic_tilt: number;
  field: string;
  frobenius_surjective: boolean;
  base_fidelity_pct: number;
  almost_purity_verified: boolean;
}

interface ScholzeTelemetry {
  space_id: string;
  status: string;
  tilt_residual: number;
  almost_purity_verified: boolean;
  prime_p: number;
  tilt_precision: number;
  characteristic_tilt: number;
  scholze_shield_strength_pev: number;
  mixed_characteristic_suppression_db: number;
  effective_fidelity_pct: number;
  timestamp: number;
}

export function ScholzePerfectoidStudio() {
  const [spaces, setSpaces] = useState<PerfectoidSpace[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<string>("");
  const [primeP, setPrimeP] = useState<number>(5);
  const [tiltPrecision, setTiltPrecision] = useState<number>(4);
  const [shieldGain, setShieldGain] = useState<number>(1.25);
  const [telemetry, setTelemetry] = useState<ScholzeTelemetry | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSpaces = async () => {
    try {
      const res = await fetch("/api/scholze-perfectoid-spaces/spaces");
      if (!res.ok) throw new Error("Failed to fetch perfectoid spaces");
      const data = await res.json();
      setSpaces(data.spaces || []);
      if (data.spaces?.length > 0 && !selectedSpace) {
        setSelectedSpace(data.spaces[0].space_id);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error fetching spaces");
    }
  };

  useEffect(() => {
    fetchSpaces();
  }, []);

  const handleEvaluateTiltingEquivalence = async () => {
    if (!selectedSpace) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/scholze-perfectoid-spaces/evaluate-tilting-equivalence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          space_id: selectedSpace,
          prime_p: Number(primeP),
          tilt_precision: Number(tiltPrecision),
          shield_gain: Number(shieldGain),
        }),
      });
      if (!res.ok) throw new Error("Failed to evaluate tilting equivalence");
      const data = await res.json();
      setTelemetry(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Evaluation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-100 shadow-2xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Scholze Perfectoid Spaces & Tilting Equivalence Shield
              <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono border border-emerald-500/30">
                CAP-197
              </span>
            </h2>
            <p className="text-sm text-slate-400">
              Peter Scholze, Ofer Gabber & Lorenzo Ramero perfectoid geometry, tilting functor K → K^♭, and Almost Purity Theorem.
            </p>
          </div>
        </div>
        <button
          onClick={fetchSpaces}
          className="p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-lg transition-colors border border-slate-700/50"
          title="Refresh Spaces"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-center space-x-3 text-rose-400 text-sm">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Target Perfectoid Space
          </label>
          <select
            value={selectedSpace}
            onChange={(e) => setSelectedSpace(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            {spaces.map((sp) => (
              <option key={sp.space_id} value={sp.space_id}>
                {sp.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            p-Adic Prime (p)
          </label>
          <input
            type="number"
            value={primeP}
            onChange={(e) => setPrimeP(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
            min={2}
            max={31}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Tilting Precision (Degree)
          </label>
          <input
            type="number"
            value={tiltPrecision}
            onChange={(e) => setTiltPrecision(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
            min={1}
            max={16}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Shield Gain Multiplier
          </label>
          <input
            type="number"
            step="0.05"
            value={shieldGain}
            onChange={(e) => setShieldGain(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
            min={1.0}
            max={3.0}
          />
        </div>
      </div>

      <button
        onClick={handleEvaluateTiltingEquivalence}
        disabled={loading || !selectedSpace}
        className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-lg shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
      >
        {loading ? (
          <RefreshCw className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <Lock className="w-5 h-5" />
            <span>Enforce Tilting Equivalence & Almost Purity Shield</span>
          </>
        )}
      </button>

      {telemetry && (
        <div className="mt-6 space-y-4">
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Activity className="w-5 h-5 text-emerald-400" />
              <div>
                <span className="text-xs text-slate-400">Descent Status</span>
                <p className="text-sm font-semibold text-emerald-400">{telemetry.status}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Effective Fidelity</span>
              <p className="text-sm font-bold text-white">{telemetry.effective_fidelity_pct.toFixed(4)}%</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-lg">
              <span className="text-xs text-slate-400">Tilt Residual</span>
              <p className="text-lg font-bold text-teal-400 font-mono mt-1">
                {telemetry.tilt_residual.toFixed(6)}
              </p>
              <span className="text-[10px] text-slate-500">Almost Purity: {telemetry.almost_purity_verified ? "VERIFIED" : "PENDING"}</span>
            </div>

            <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-lg">
              <span className="text-xs text-slate-400">Shield Strength</span>
              <p className="text-lg font-bold text-emerald-400 font-mono mt-1">
                {telemetry.scholze_shield_strength_pev} PeV
              </p>
              <span className="text-[10px] text-slate-500">p = {telemetry.prime_p} | Deg = {telemetry.tilt_precision}</span>
            </div>

            <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-lg">
              <span className="text-xs text-slate-400">Mixed-Char Suppression</span>
              <p className="text-lg font-bold text-cyan-400 font-mono mt-1">
                {telemetry.mixed_characteristic_suppression_db} dB
              </p>
              <span className="text-[10px] text-slate-500">Tilt Char: p = {telemetry.characteristic_tilt}</span>
            </div>

            <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-lg">
              <span className="text-xs text-slate-400">Space ID</span>
              <p className="text-sm font-bold text-slate-200 font-mono mt-1 truncate">
                {telemetry.space_id}
              </p>
              <span className="text-[10px] text-slate-500">
                {new Date(telemetry.timestamp * 1000).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
