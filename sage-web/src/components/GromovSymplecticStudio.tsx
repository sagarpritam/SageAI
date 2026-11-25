"use client";

import React, { useState, useEffect } from "react";
import { Shield, Activity, RefreshCw, Zap, Lock, AlertTriangle, Layers } from "lucide-react";

interface SymplecticManifold {
  manifold_id: string;
  manifold_name: string;
  phase_space_dimension: number;
  ball_radius_r: number;
  cylinder_radius_r: number;
  base_fidelity_pct: number;
  non_squeezing_verified: boolean;
}

interface GromovTelemetry {
  manifold_id: string;
  status: string;
  capacity_defect: number;
  non_squeezing_verified: boolean;
  ball_radius: number;
  cylinder_radius: number;
  gromov_capacity_pi_r2: number;
  c0_rigidity_confirmed: boolean;
  eliashberg_firewall_strength_pev: number;
  phase_space_suppression_db: number;
  effective_fidelity_pct: number;
  timestamp: number;
}

export function GromovSymplecticStudio() {
  const [manifolds, setManifolds] = useState<SymplecticManifold[]>([]);
  const [selectedManifold, setSelectedManifold] = useState<string>("");
  const [ballRadius, setBallRadius] = useState<number>(1.0);
  const [cylinderRadius, setCylinderRadius] = useState<number>(1.0);
  const [firewallGain, setFirewallGain] = useState<number>(1.25);
  const [telemetry, setTelemetry] = useState<GromovTelemetry | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchManifolds = async () => {
    try {
      const res = await fetch("/api/gromov-eliashberg-symplectic/manifolds");
      if (!res.ok) throw new Error("Failed to fetch symplectic manifolds");
      const data = await res.json();
      setManifolds(data.manifolds || []);
      if (data.manifolds?.length > 0 && !selectedManifold) {
        setSelectedManifold(data.manifolds[0].manifold_id);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error fetching manifolds");
    }
  };

  useEffect(() => {
    fetchManifolds();
  }, []);

  const handleEvaluateCapacity = async () => {
    if (!selectedManifold) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/gromov-eliashberg-symplectic/evaluate-symplectic-capacity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          manifold_id: selectedManifold,
          ball_radius: ballRadius,
          cylinder_radius: cylinderRadius,
          firewall_gain: firewallGain,
        }),
      });
      if (!res.ok) throw new Error("Symplectic capacity evaluation failed");
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
              Capability 193 • Wave 57
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Gromov-Eliashberg Symplectic Topology & Non-Squeezing Firewall
            </h2>
            <p className="text-sm text-zinc-400">
              Enforces Mikhail Gromov and Yakov Eliashberg&apos;s symplectic non-squeezing theorem, pseudo-holomorphic curves, and C0-rigidity of phase-space embeddings.
            </p>
          </div>
          <button
            onClick={fetchManifolds}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono transition-colors self-start md:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Manifolds
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
            Select Symplectic Phase Space
          </h3>
          <div className="space-y-2">
            {manifolds.map((m) => (
              <button
                key={m.manifold_id}
                onClick={() => setSelectedManifold(m.manifold_id)}
                className={`w-full text-left p-3 rounded-lg border text-xs font-mono transition-all ${
                  selectedManifold === m.manifold_id
                    ? "bg-emerald-500/10 border-emerald-500/30 text-white"
                    : "bg-zinc-800/40 border-zinc-800 hover:bg-zinc-800/70 text-zinc-400"
                }`}
              >
                <div className="font-bold text-zinc-200">{m.manifold_id}</div>
                <div className="text-zinc-400 text-[11px] truncate">{m.manifold_name}</div>
                <div className="mt-1 flex gap-3 text-[10px] text-zinc-500">
                  <span>dim={m.phase_space_dimension}</span>
                  <span>R={m.ball_radius_r}</span>
                  <span>r={m.cylinder_radius_r}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 p-6 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-5">
          <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            Symplectic Capacity Parameters
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">Ball Radius (R): {ballRadius.toFixed(2)}</label>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.05"
                value={ballRadius}
                onChange={(e) => setBallRadius(parseFloat(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">Cylinder Radius (r): {cylinderRadius.toFixed(2)}</label>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.05"
                value={cylinderRadius}
                onChange={(e) => setCylinderRadius(parseFloat(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">Firewall Gain: {firewallGain.toFixed(2)}</label>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.05"
                value={firewallGain}
                onChange={(e) => setFirewallGain(parseFloat(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
          </div>

          <button
            onClick={handleEvaluateCapacity}
            disabled={loading || !selectedManifold}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-mono text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            Enforce Symplectic Non-Squeezing Rigidity
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
              <div className="text-[10px] text-zinc-400 font-mono">Firewall Strength</div>
              <div className="text-lg font-bold text-white font-mono">{telemetry.eliashberg_firewall_strength_pev.toFixed(1)} PeV</div>
            </div>
            <div className="p-3 bg-zinc-800/40 rounded-lg border border-zinc-800">
              <div className="text-[10px] text-zinc-400 font-mono">Phase Space Suppression</div>
              <div className="text-lg font-bold text-white font-mono">{telemetry.phase_space_suppression_db.toFixed(1)} dB</div>
            </div>
            <div className="p-3 bg-zinc-800/40 rounded-lg border border-zinc-800">
              <div className="text-[10px] text-zinc-400 font-mono">Gromov Capacity (pi R^2)</div>
              <div className="text-lg font-bold text-emerald-400 font-mono">{telemetry.gromov_capacity_pi_r2.toFixed(4)}</div>
            </div>
            <div className="p-3 bg-zinc-800/40 rounded-lg border border-zinc-800">
              <div className="text-[10px] text-zinc-400 font-mono">Non-Squeezing Verified</div>
              <div className="text-lg font-bold text-emerald-400 font-mono">{String(telemetry.non_squeezing_verified)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
