"use client";

import React, { useState, useEffect } from "react";
import { Shield, Activity, RefreshCw, Zap, Lock, AlertTriangle, Layers } from "lucide-react";

interface DAHAAlgebra {
  algebra_id: string;
  root_system: string;
  rank: number;
  q_parameter: number;
  t_parameter: number;
  base_fidelity_pct: number;
  duality_verified: boolean;
}

interface DAHATelemetry {
  algebra_id: string;
  status: string;
  daha_duality_defect: number;
  duality_verified: boolean;
  polynomial_degree: number;
  dunkl_order: number;
  macdonald_norm: number;
  daha_barrier_strength_pev: number;
  quantum_group_suppression_db: number;
  effective_fidelity_pct: number;
  timestamp: number;
}

export function MacdonaldDAHAStudio() {
  const [algebras, setAlgebras] = useState<DAHAAlgebra[]>([]);
  const [selectedAlgebra, setSelectedAlgebra] = useState<string>("");
  const [polynomialDegree, setPolynomialDegree] = useState<number>(4);
  const [dunklOrder, setDunklOrder] = useState<number>(6);
  const [barrierGain, setBarrierGain] = useState<number>(1.25);
  const [telemetry, setTelemetry] = useState<DAHATelemetry | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAlgebras = async () => {
    try {
      const res = await fetch("/api/macdonald-daha-polynomial/algebras");
      if (!res.ok) throw new Error("Failed to fetch DAHA algebras");
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

  const handleEvaluateDuality = async () => {
    if (!selectedAlgebra) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/macdonald-daha-polynomial/evaluate-macdonald-duality", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          algebra_id: selectedAlgebra,
          polynomial_degree: polynomialDegree,
          dunkl_order: dunklOrder,
          barrier_gain: barrierGain,
        }),
      });
      if (!res.ok) throw new Error("Macdonald DAHA duality evaluation failed");
      const data = await res.json();
      setTelemetry(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Evaluation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 bg-zinc-900/60 border border-zinc-800 rounded-xl backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
              <Shield className="w-3.5 h-3.5" />
              Capability 192 • Wave 57
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Macdonald Polynomials & Double Affine Hecke Algebra Barrier
            </h2>
            <p className="text-sm text-zinc-400">
              Implements Ian Macdonald and Ivan Cherednik&apos;s Double Affine Hecke Algebras (DAHA), Dunkl-Cherednik operators, and self-dual polynomial orthogonality.
            </p>
          </div>
          <button
            onClick={fetchAlgebras}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono transition-colors self-start md:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Algebras
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Control & Parameters Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-4">
          <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            Select DAHA Root System
          </h3>
          <div className="space-y-2">
            {algebras.map((a) => (
              <button
                key={a.algebra_id}
                onClick={() => setSelectedAlgebra(a.algebra_id)}
                className={`w-full text-left p-3 rounded-lg border text-xs font-mono transition-all ${
                  selectedAlgebra === a.algebra_id
                    ? "bg-emerald-500/10 border-emerald-500/30 text-white"
                    : "bg-zinc-800/40 border-zinc-800 hover:bg-zinc-800/70 text-zinc-400"
                }`}
              >
                <div className="font-bold text-zinc-200">{a.algebra_id}</div>
                <div className="text-zinc-400 text-[11px] truncate">{a.root_system} (rank {a.rank})</div>
                <div className="mt-1 flex gap-3 text-[10px] text-zinc-500">
                  <span>q={a.q_parameter}</span>
                  <span>t={a.t_parameter}</span>
                  <span>Duality={String(a.duality_verified)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 p-6 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-5">
          <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            DAHA Duality Parameters
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">Polynomial Degree: {polynomialDegree}</label>
              <input
                type="range"
                min="1"
                max="24"
                step="1"
                value={polynomialDegree}
                onChange={(e) => setPolynomialDegree(parseInt(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">Dunkl Order: {dunklOrder}</label>
              <input
                type="range"
                min="1"
                max="16"
                step="1"
                value={dunklOrder}
                onChange={(e) => setDunklOrder(parseInt(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">Barrier Gain: {barrierGain.toFixed(2)}</label>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.05"
                value={barrierGain}
                onChange={(e) => setBarrierGain(parseFloat(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
          </div>

          <button
            onClick={handleEvaluateDuality}
            disabled={loading || !selectedAlgebra}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-mono text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            Verify Macdonald Polynomial Duality
          </button>
        </div>
      </div>

      {/* Telemetry Output */}
      {telemetry && (
        <div className="p-6 bg-zinc-900/60 border border-emerald-500/20 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2 font-mono">
              <Activity className="w-4 h-4" />
              TELEMETRY: {telemetry.status}
            </h3>
            <span className="text-xs font-mono text-zinc-500">
              {new Date(telemetry.timestamp * 1000).toLocaleTimeString()}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-zinc-800/40 rounded-lg border border-zinc-800">
              <div className="text-[10px] text-zinc-400 font-mono">Barrier Strength</div>
              <div className="text-lg font-bold text-white font-mono">{telemetry.daha_barrier_strength_pev.toFixed(1)} PeV</div>
            </div>
            <div className="p-3 bg-zinc-800/40 rounded-lg border border-zinc-800">
              <div className="text-[10px] text-zinc-400 font-mono">Quantum Group Suppression</div>
              <div className="text-lg font-bold text-white font-mono">{telemetry.quantum_group_suppression_db.toFixed(1)} dB</div>
            </div>
            <div className="p-3 bg-zinc-800/40 rounded-lg border border-zinc-800">
              <div className="text-[10px] text-zinc-400 font-mono">Duality Defect</div>
              <div className="text-lg font-bold text-emerald-400 font-mono">{telemetry.daha_duality_defect.toFixed(6)}</div>
            </div>
            <div className="p-3 bg-zinc-800/40 rounded-lg border border-zinc-800">
              <div className="text-[10px] text-zinc-400 font-mono">Macdonald Norm</div>
              <div className="text-lg font-bold text-emerald-400 font-mono">{telemetry.macdonald_norm.toFixed(4)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
