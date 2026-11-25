"use client";

import React, { useState, useEffect } from "react";
import { Compass, Activity, RefreshCw, Zap, Lock, AlertTriangle, Shield } from "lucide-react";

interface HyperbolicGroup {
  group_id: string;
  group_type: string;
  subgroup_h: string;
  gromov_delta: number;
  fractal_dimension_d: number;
  peano_space_filling: boolean;
  base_boundary_fidelity_pct: number;
  status: string;
}

interface CTTelemetry {
  group_id: string;
  status: string;
  cannon_thurston_map_continuous: boolean;
  peano_curve_density: number;
  gromov_delta: number;
  geodesic_ray_steps: number;
  cannon_thurston_barrier_strength_pev: number;
  distortion_suppression_db: number;
  effective_fidelity_pct: number;
  timestamp: number;
}

export function CannonThurstonStudio() {
  const [groups, setGroups] = useState<HyperbolicGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [geodesicSteps, setGeodesicSteps] = useState<number>(100);
  const [barrierGain, setBarrierGain] = useState<number>(1.25);
  const [telemetry, setTelemetry] = useState<CTTelemetry | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = async () => {
    try {
      const res = await fetch("/api/cannon-thurston-hyperbolic/groups");
      if (!res.ok) throw new Error("Failed to fetch hyperbolic group configurations");
      const data = await res.json();
      setGroups(data.groups || []);
      if (data.groups?.length > 0 && !selectedGroup) {
        setSelectedGroup(data.groups[0].group_id);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error fetching groups");
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleVerifyBoundaryRigidity = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/cannon-thurston-hyperbolic/verify-boundary-rigidity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group_id: selectedGroup,
          geodesic_ray_steps: geodesicSteps,
          barrier_gain: barrierGain,
        }),
      });
      if (!res.ok) throw new Error("Failed to verify Cannon-Thurston boundary rigidity");
      const data = await res.json();
      setTelemetry(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error verifying boundary rigidity");
    } finally {
      setLoading(false);
    }
  };

  const currentGroup = groups.find((g) => g.group_id === selectedGroup);

  return (
    <div className="p-6 bg-slate-950 text-slate-100 rounded-xl border border-slate-800 shadow-2xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-cyan-400">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Cannon-Thurston Hyperbolic Group Boundary Barrier
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-medium">
                Capability 186
              </span>
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              James Cannon, William Thurston &amp; Misha Gromov visual boundary continuous surjection i_hat: d_infty H to d_infty G
            </p>
          </div>
        </div>
        <button
          onClick={fetchGroups}
          className="flex items-center gap-2 px-3.5 py-2 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Groups
        </button>
      </div>

      {error && (
        <div className="p-4 bg-cyan-950/50 border border-cyan-800 rounded-lg text-cyan-200 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-cyan-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Hyperbolic Group Configuration
          </label>
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            {groups.map((g) => (
              <option key={g.group_id} value={g.group_id}>
                {g.group_id} (delta={g.gromov_delta})
              </option>
            ))}
          </select>
          {currentGroup && (
            <p className="text-xs text-slate-500 italic mt-1">{currentGroup.subgroup_h}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Geodesic Ray Steps: {geodesicSteps}
          </label>
          <input
            type="range"
            min="20"
            max="300"
            step="10"
            value={geodesicSteps}
            onChange={(e) => setGeodesicSteps(parseInt(e.target.value, 10))}
            className="w-full accent-cyan-500"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>20 (Coarse)</span>
            <span>300 (Fine Peano Sweep)</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Boundary Rigidity Gain: {barrierGain}x
          </label>
          <input
            type="range"
            min="0.5"
            max="3.0"
            step="0.25"
            value={barrierGain}
            onChange={(e) => setBarrierGain(parseFloat(e.target.value))}
            className="w-full accent-cyan-500"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>0.5x</span>
            <span>3.0x</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleVerifyBoundaryRigidity}
          disabled={loading || !selectedGroup}
          className="flex items-center gap-2 px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-medium rounded-lg shadow-lg shadow-cyan-950/50 transition cursor-pointer"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
          Enforce Cannon-Thurston Boundary Rigidity
        </button>
      </div>

      {telemetry && (
        <div className="p-5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Cannon-Thurston Boundary Telemetry
            </h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/50">
              {telemetry.status}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/60">
              <p className="text-xs text-slate-400">Continuous Surjection</p>
              <p className="text-lg font-bold text-white mt-0.5">{telemetry.cannon_thurston_map_continuous ? "VERIFIED" : "DEVIATING"}</p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/60">
              <p className="text-xs text-slate-400">Peano Curve Density</p>
              <p className="text-lg font-bold text-cyan-400 mt-0.5">{telemetry.peano_curve_density}</p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/60">
              <p className="text-xs text-slate-400">Barrier Strength</p>
              <p className="text-lg font-bold text-white mt-0.5">{telemetry.cannon_thurston_barrier_strength_pev} PeV</p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/60">
              <p className="text-xs text-slate-400">Distortion Suppression</p>
              <p className="text-lg font-bold text-emerald-400 mt-0.5">+{telemetry.distortion_suppression_db} dB</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CannonThurstonStudio;
