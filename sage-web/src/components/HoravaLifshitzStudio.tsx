"use client";

import React, { useState, useEffect } from "react";
import {
  Compass,
  Radio,
  Zap,
  Activity,
  Terminal,
  RefreshCw,
  Shield,
  Sparkles,
  Database,
  Layers,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

interface HoravaDomainNode {
  domain_id: string;
  spacetime_sector: string;
  dynamical_critical_exponent_z: number;
  foliation_parameter_lambda: number;
  spatial_curvature_order: number;
  residual_lorentz_violation_pct: number;
  status: string;
}

interface HoravaScalingResult {
  scaling_id: string;
  domain_id: string;
  initial_z: number;
  governed_z: number;
  foliation_invariance_pct: number;
  ghost_free_mode_count: number;
  ir_lorentz_recovery_fidelity_pct: number;
  high_derivative_suppression_db: number;
  status: string;
  timestamp: string;
}

export function HoravaLifshitzStudio() {
  const [domains, setDomains] = useState<HoravaDomainNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [governing, setGoverning] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState("HORAVA-DOMAIN-TRANS-PLANCK-01");
  const [targetZ, setTargetZ] = useState(3.0);
  const [dampingGain, setDampingGain] = useState(1.0);
  const [lastResult, setLastResult] = useState<HoravaScalingResult | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchDomains = async () => {
    setErrorMsg(null);
    try {
      const res = await fetch("/api/horava-lifshitz/domains");
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error((data && data.error) || "Failed to load Horava-Lifshitz foliation domains");
      }
      setDomains(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to load Horava-Lifshitz foliation domains");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDomains();
    setLogs([
      "[" + new Date().toLocaleTimeString() + "] Horava-Lifshitz Anisotropic Lifshitz Scaling Governor online.",
      "[" + new Date().toLocaleTimeString() + "] Foliation-preserving diffeomorphism Diff(M, F) symmetry verified.",
      "[" + new Date().toLocaleTimeString() + "] UV Lifshitz critical exponent z=3 active for power-counting renormalizability.",
    ]);
  }, []);

  const handleGovernScaling = async () => {
    setGoverning(true);
    setErrorMsg(null);
    setLogs((prev) => [
      "[" + new Date().toLocaleTimeString() + "] Locking dynamical critical exponent z = " + targetZ.toFixed(2) + " on " + selectedDomain + "...",
      ...prev,
    ]);
    try {
      const res = await fetch("/api/horava-lifshitz/govern-scaling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain_id: selectedDomain,
          target_exponent_z: targetZ,
          foliation_damping_gain: dampingGain,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error((data && data.error) || "Lifshitz scaling adjustment failed");
      }
      const result = data as HoravaScalingResult;
      setLastResult(result);
      setLogs((prev) => [
        "[" + new Date().toLocaleTimeString() + "] SUCCESS: Foliation invariance locked (" + result.foliation_invariance_pct.toFixed(3) + "%). z = " + result.governed_z.toFixed(2) + ".",
        "[" + new Date().toLocaleTimeString() + "] Ghost-Free Modes: " + result.ghost_free_mode_count + " | High-Derivative Spatial Suppression: " + result.high_derivative_suppression_db.toFixed(1) + " dB",
        ...prev,
      ]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lifshitz scaling adjustment failed.";
      setErrorMsg(msg);
      setLogs((prev) => [
        "[" + new Date().toLocaleTimeString() + "] ERROR: " + msg,
        ...prev,
      ]);
    } finally {
      setGoverning(false);
    }
  };

  return (
    <div className="space-y-6">
      {errorMsg && (
        <div
          role="alert"
          className="bg-red-950/30 border border-red-800/60 rounded-lg px-4 py-2.5 text-xs font-mono text-red-300 flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-red-300 hover:text-white underline"
          >
            Dismiss
          </button>
        </div>
      )}
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-sky-950/40 via-cyan-900/30 to-blue-950/40 border border-sky-500/30 rounded-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-sky-500/20 border border-sky-500/40 rounded-lg text-sky-400">
            <Compass className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
              Horava-Lifshitz Anisotropic Lifshitz Scaling Governor
              <span className="text-xs px-2 py-0.5 rounded bg-sky-500/20 border border-sky-500/40 text-sky-300 font-mono">
                Cap 99
              </span>
            </h1>
            <p className="text-sm text-sky-200/70 mt-1">
              Foliation-preserving diffeomorphism governor: z=3 UV power-counting renormalizability to z=1 IR recovery
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchDomains}
          className="flex items-center gap-2 px-4 py-2 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 rounded-lg text-sm text-sky-300 transition-colors self-start md:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Domains
        </button>
      </div>

      {/* Telemetry Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900/60 border border-sky-500/20 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Critical Exponent z</span>
            <Sparkles className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            z = {lastResult ? lastResult.governed_z.toFixed(2) : "3.00"}
          </div>
          <div className="text-xs text-sky-400 mt-2 font-mono">UV Power-Counting Finite</div>
        </div>

        <div className="p-4 bg-slate-900/60 border border-sky-500/20 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Foliation Invariance</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-300">
            {lastResult ? lastResult.foliation_invariance_pct.toFixed(3) : "99.985"}%
          </div>
          <div className="text-xs text-emerald-400 mt-2 font-mono">Diff(M, F) Symmetry Locked</div>
        </div>

        <div className="p-4 bg-slate-900/60 border border-sky-500/20 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Ghost-Free Quantum Modes</span>
            <Shield className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-300">
            {lastResult ? lastResult.ghost_free_mode_count : "48"}
            <span className="text-xs text-slate-400 ml-1">modes</span>
          </div>
          <div className="text-xs text-cyan-400 mt-2 font-mono">Positive-Norm Unitarity</div>
        </div>

        <div className="p-4 bg-slate-900/60 border border-sky-500/20 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>High-Derivative Quench</span>
            <Zap className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-300">
            {lastResult ? lastResult.high_derivative_suppression_db.toFixed(1) : "122.4"}
            <span className="text-xs text-slate-400 ml-1">dB</span>
          </div>
          <div className="text-xs text-blue-400 mt-2 font-mono">Cubic Curvature Spatial Decay</div>
        </div>
      </div>

      {/* Main Grid: Control Panel + Foliation Domains */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="p-6 bg-slate-900/60 border border-sky-500/20 rounded-xl space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Radio className="w-5 h-5 text-sky-400" />
            Lifshitz Scaling Controls
          </h2>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Target Spacetime Foliation</label>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
            >
              {domains.map((d) => (
                <option key={d.domain_id} value={d.domain_id}>
                  {d.domain_id} (z={d.dynamical_critical_exponent_z})
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Dynamical Exponent z (1.0 IR - 3.0 UV)</span>
              <span className="text-sky-400 font-mono">z = {targetZ.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="3.0"
              step="0.05"
              value={targetZ}
              onChange={(e) => setTargetZ(parseFloat(e.target.value))}
              className="w-full accent-sky-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Foliation Damping Gain</span>
              <span className="text-sky-400 font-mono">{dampingGain.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.1"
              value={dampingGain}
              onChange={(e) => setDampingGain(parseFloat(e.target.value))}
              className="w-full accent-sky-500"
            />
          </div>

          <button
            type="button"
            onClick={handleGovernScaling}
            disabled={governing}
            className="w-full py-3 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 disabled:opacity-50 text-white font-medium rounded-lg text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-900/30"
          >
            {governing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Enforcing Lifshitz Foliation...
              </>
            ) : (
              <>
                <Compass className="w-4 h-4" />
                Govern Lifshitz Metric Scaling
              </>
            )}
          </button>
        </div>

        {/* Foliation Domains Table */}
        <div className="lg:col-span-2 p-6 bg-slate-900/60 border border-sky-500/20 rounded-xl space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-400" />
            Monitored Horava-Lifshitz Foliation Domains
          </h2>
          {loading ? (
            <div className="text-slate-400 text-sm">Loading foliation domains...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-2">Domain ID</th>
                    <th className="pb-2">Spacetime Sector</th>
                    <th className="pb-2">Critical z</th>
                    <th className="pb-2">Lambda Parameter</th>
                    <th className="pb-2">Spatial Order</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {domains.map((d) => (
                    <tr key={d.domain_id} className="hover:bg-slate-800/40">
                      <td className="py-2.5 font-mono text-sky-400">{d.domain_id}</td>
                      <td className="py-2.5">{d.spacetime_sector.split(" ")[0]} Foliation</td>
                      <td className="py-2.5 font-mono text-cyan-400">z = {d.dynamical_critical_exponent_z.toFixed(2)}</td>
                      <td className="py-2.5 font-mono">{d.foliation_parameter_lambda.toFixed(3)}</td>
                      <td className="py-2.5 font-mono text-amber-400">Order {d.spatial_curvature_order}</td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-sky-500/10 text-sky-300 border border-sky-500/30">
                          {d.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Terminal Telemetry Logs */}
      <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl font-mono text-xs">
        <div className="flex items-center gap-2 text-sky-400 mb-2">
          <Terminal className="w-4 h-4" />
          <span>Horava-Lifshitz Foliation &amp; Curvature Invariant Stream</span>
        </div>
        <div className="space-y-1 max-h-36 overflow-y-auto text-slate-400">
          {logs.map((log, idx) => (
            <div key={idx} className="leading-relaxed">
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

