"use client";

import React, { useState, useEffect } from "react";
import { Shield, Activity, RefreshCw, Zap, Lock, AlertTriangle, Layers } from "lucide-react";

interface NoncommutativeMotive {
  motive_id: string;
  name: string;
  categorical_dimension: number;
  invariant_type: string;
  base_fidelity_pct: number;
  morita_equivalence_verified: boolean;
}

interface KontsevichTelemetry {
  motive_id: string;
  status: string;
  chern_character_defect: number;
  morita_verified: boolean;
  categorical_dimension: number;
  hochschild_degree: number;
  invariant_type: string;
  kontsevich_firewall_strength_pev: number;
  categorical_entropy_suppression_db: number;
  effective_fidelity_pct: number;
  timestamp: number;
}

export function KontsevichMotivesStudio() {
  const [motives, setMotives] = useState<NoncommutativeMotive[]>([]);
  const [selectedMotive, setSelectedMotive] = useState<string>("");
  const [categoricalDimension, setCategoricalDimension] = useState<number>(3);
  const [hochschildDegree, setHochschildDegree] = useState<number>(2);
  const [firewallGain, setFirewallGain] = useState<number>(1.25);
  const [telemetry, setTelemetry] = useState<KontsevichTelemetry | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMotives = async () => {
    try {
      const res = await fetch("/api/kontsevich-noncommutative-motives/motives");
      if (!res.ok) throw new Error("Failed to fetch noncommutative motives");
      const data = await res.json();
      setMotives(data.motives || []);
      if (data.motives?.length > 0 && !selectedMotive) {
        setSelectedMotive(data.motives[0].motive_id);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error fetching motives");
    }
  };

  useEffect(() => {
    fetchMotives();
  }, []);

  const handleEvaluateNoncommutativeChern = async () => {
    if (!selectedMotive) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/kontsevich-noncommutative-motives/evaluate-noncommutative-chern-character", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          motive_id: selectedMotive,
          categorical_dimension: Number(categoricalDimension),
          hochschild_degree: Number(hochschildDegree),
          firewall_gain: Number(firewallGain),
        }),
      });
      if (!res.ok) throw new Error("Failed to evaluate noncommutative Chern character");
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
          <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Kontsevich Noncommutative Motives & Chern Character Firewall
              <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-mono border border-amber-500/30">
                CAP-199
              </span>
            </h2>
            <p className="text-sm text-slate-400">
              Maxim Kontsevich, Gonçalo Tabuada & Bernhard Keller noncommutative motives NCMot, dg-categories, and localizing invariants.
            </p>
          </div>
        </div>
        <button
          onClick={fetchMotives}
          className="p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-lg transition-colors border border-slate-700/50"
          title="Refresh Motives"
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
            Target Noncommutative Motive
          </label>
          <select
            value={selectedMotive}
            onChange={(e) => setSelectedMotive(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
          >
            {motives.map((mot) => (
              <option key={mot.motive_id} value={mot.motive_id}>
                {mot.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Categorical Dimension
          </label>
          <input
            type="number"
            value={categoricalDimension}
            onChange={(e) => setCategoricalDimension(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
            min={1}
            max={10}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Hochschild Degree
          </label>
          <input
            type="number"
            value={hochschildDegree}
            onChange={(e) => setHochschildDegree(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
            min={0}
            max={8}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Firewall Gain Multiplier
          </label>
          <input
            type="number"
            step="0.05"
            value={firewallGain}
            onChange={(e) => setFirewallGain(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
            min={1.0}
            max={3.0}
          />
        </div>
      </div>

      <button
        onClick={handleEvaluateNoncommutativeChern}
        disabled={loading || !selectedMotive}
        className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold rounded-lg shadow-lg shadow-amber-950/40 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
      >
        {loading ? (
          <RefreshCw className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <Lock className="w-5 h-5" />
            <span>Enforce Noncommutative Motivic Chern Firewall</span>
          </>
        )}
      </button>

      {telemetry && (
        <div className="mt-6 space-y-4">
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Activity className="w-5 h-5 text-amber-400" />
              <div>
                <span className="text-xs text-slate-400">Firewall Status</span>
                <p className="text-sm font-semibold text-amber-400">{telemetry.status}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Effective Fidelity</span>
              <p className="text-sm font-bold text-white">{telemetry.effective_fidelity_pct.toFixed(4)}%</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-lg">
              <span className="text-xs text-slate-400">Chern Defect</span>
              <p className="text-lg font-bold text-amber-400 font-mono mt-1">
                {telemetry.chern_character_defect.toFixed(8)}
              </p>
              <span className="text-[10px] text-slate-500">Morita: {telemetry.morita_verified ? "LOCKED" : "UNLOCKED"}</span>
            </div>

            <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-lg">
              <span className="text-xs text-slate-400">Firewall Strength</span>
              <p className="text-lg font-bold text-orange-400 font-mono mt-1">
                {telemetry.kontsevich_firewall_strength_pev} PeV
              </p>
              <span className="text-[10px] text-slate-500">Dim = {telemetry.categorical_dimension} | Deg = {telemetry.hochschild_degree}</span>
            </div>

            <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-lg">
              <span className="text-xs text-slate-400">Categorical Entropy Suppr.</span>
              <p className="text-lg font-bold text-yellow-400 font-mono mt-1">
                {telemetry.categorical_entropy_suppression_db} dB
              </p>
              <span className="text-[10px] text-slate-500">Invariant: {telemetry.invariant_type}</span>
            </div>

            <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-lg">
              <span className="text-xs text-slate-400">Motive ID</span>
              <p className="text-sm font-bold text-slate-200 font-mono mt-1 truncate">
                {telemetry.motive_id}
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
