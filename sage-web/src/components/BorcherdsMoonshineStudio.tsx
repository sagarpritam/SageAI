"use client";

import React, { useState, useEffect } from "react";
import { Shield, Activity, RefreshCw, Zap, Lock, AlertTriangle, Cpu } from "lucide-react";

interface BorcherdsAlgebra {
  algebra_id: string;
  name: string;
  central_charge: number;
  group: string;
  borcherds_dimension: number;
  base_fidelity_pct: number;
  modular_invariance_verified: boolean;
}

interface BorcherdsTelemetry {
  algebra_id: string;
  status: string;
  modular_invariance_defect: number;
  monster_symmetry_verified: boolean;
  central_charge: number;
  q_expansion_order: number;
  borcherds_dimension: number;
  borcherds_barrier_strength_pev: number;
  non_modular_suppression_db: number;
  effective_fidelity_pct: number;
  timestamp: number;
}

export function BorcherdsMoonshineStudio() {
  const [algebras, setAlgebras] = useState<BorcherdsAlgebra[]>([]);
  const [selectedAlgebra, setSelectedAlgebra] = useState<string>("");
  const [centralCharge, setCentralCharge] = useState<number>(24);
  const [qExpansionOrder, setQExpansionOrder] = useState<number>(4);
  const [barrierGain, setBarrierGain] = useState<number>(1.25);
  const [telemetry, setTelemetry] = useState<BorcherdsTelemetry | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAlgebras = async () => {
    try {
      const res = await fetch("/api/borcherds-kac-moody-moonshine/algebras");
      if (!res.ok) throw new Error("Failed to fetch Borcherds Moonshine algebras");
      const data = await res.json();
      setAlgebras(data.algebras || []);
      if (data.algebras?.length > 0 && !selectedAlgebra) {
        setSelectedAlgebra(data.algebras[0].algebra_id);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error fetching algebras");
    }
  };

  useEffect(() => {
    fetchAlgebras();
  }, []);

  const handleEvaluateAutomorphicProduct = async () => {
    if (!selectedAlgebra) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/borcherds-kac-moody-moonshine/evaluate-automorphic-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          algebra_id: selectedAlgebra,
          central_charge: Number(centralCharge),
          q_expansion_order: Number(qExpansionOrder),
          barrier_gain: Number(barrierGain),
        }),
      });
      if (!res.ok) throw new Error("Failed to evaluate automorphic product");
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
          <div className="p-2 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-400">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Borcherds Automorphic Products & Monstrous Moonshine Barrier
              <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded font-mono border border-purple-500/30">
                CAP-198
              </span>
            </h2>
            <p className="text-sm text-slate-400">
              Richard Borcherds, Igor Frenkel, James Lepowsky & Arne Meurman Monstrous Moonshine, VOA V^♮ (c=24), and singular theta lifts.
            </p>
          </div>
        </div>
        <button
          onClick={fetchAlgebras}
          className="p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-lg transition-colors border border-slate-700/50"
          title="Refresh Algebras"
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
            Target Moonshine Algebra
          </label>
          <select
            value={selectedAlgebra}
            onChange={(e) => setSelectedAlgebra(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
          >
            {algebras.map((alg) => (
              <option key={alg.algebra_id} value={alg.algebra_id}>
                {alg.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Central Charge (c)
          </label>
          <input
            type="number"
            value={centralCharge}
            onChange={(e) => setCentralCharge(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
            min={1}
            max={48}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            q-Expansion Order
          </label>
          <input
            type="number"
            value={qExpansionOrder}
            onChange={(e) => setQExpansionOrder(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
            min={1}
            max={12}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Barrier Gain Multiplier
          </label>
          <input
            type="number"
            step="0.05"
            value={barrierGain}
            onChange={(e) => setBarrierGain(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
            min={1.0}
            max={3.0}
          />
        </div>
      </div>

      <button
        onClick={handleEvaluateAutomorphicProduct}
        disabled={loading || !selectedAlgebra}
        className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-lg shadow-lg shadow-purple-950/40 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
      >
        {loading ? (
          <RefreshCw className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <Lock className="w-5 h-5" />
            <span>Lock Borcherds Monstrous Moonshine Barrier</span>
          </>
        )}
      </button>

      {telemetry && (
        <div className="mt-6 space-y-4">
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Activity className="w-5 h-5 text-purple-400" />
              <div>
                <span className="text-xs text-slate-400">Barrier Status</span>
                <p className="text-sm font-semibold text-purple-400">{telemetry.status}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Effective Fidelity</span>
              <p className="text-sm font-bold text-white">{telemetry.effective_fidelity_pct.toFixed(4)}%</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-lg">
              <span className="text-xs text-slate-400">Modular Invariance Defect</span>
              <p className="text-lg font-bold text-pink-400 font-mono mt-1">
                {telemetry.modular_invariance_defect.toFixed(8)}
              </p>
              <span className="text-[10px] text-slate-500">Monster Symmetry: {telemetry.monster_symmetry_verified ? "LOCKED" : "UNLOCKED"}</span>
            </div>

            <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-lg">
              <span className="text-xs text-slate-400">Barrier Strength</span>
              <p className="text-lg font-bold text-purple-400 font-mono mt-1">
                {telemetry.borcherds_barrier_strength_pev} PeV
              </p>
              <span className="text-[10px] text-slate-500">c = {telemetry.central_charge} | q-order = {telemetry.q_expansion_order}</span>
            </div>

            <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-lg">
              <span className="text-xs text-slate-400">Non-Modular Suppression</span>
              <p className="text-lg font-bold text-indigo-400 font-mono mt-1">
                {telemetry.non_modular_suppression_db} dB
              </p>
              <span className="text-[10px] text-slate-500">Dim = {telemetry.borcherds_dimension}</span>
            </div>

            <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-lg">
              <span className="text-xs text-slate-400">Algebra ID</span>
              <p className="text-sm font-bold text-slate-200 font-mono mt-1 truncate">
                {telemetry.algebra_id}
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
