"use client";

import React, { useState, useEffect } from "react";
import {
  Flame,
  Radio,
  Zap,
  Activity,
  Terminal,
  RefreshCw,
  Shield,
  Sparkles,
  Database,
  Rocket,
  Gauge,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

interface MIFReactorPlatform {
  reactor_id: string;
  callsign: string;
  peak_driver_current_ma: number;
  plasma_liner_velocity_kms: number;
  thermonuclear_q_factor: number;
  pulse_repetition_rate_hz: number;
  thermal_power_output_gw: number;
  magnetic_nozzle_isp_seconds: number;
  status: string;
}

interface MIFPulseResult {
  pulse_id: string;
  reactor_id: string;
  peak_current_ma: number;
  fusion_gain_q: number;
  plasma_implosion_pressure_mbar: number;
  thermal_yield_gw: number;
  direct_electrical_conversion_mw: number;
  magnetic_nozzle_exhaust_velocity_kms: number;
  specific_impulse_isp_s: number;
  dew_array_power_bus_charged: boolean;
  status: string;
  timestamp: string;
}

export function MagnetoInertialFusionStudio() {
  const [reactors, setReactors] = useState<MIFReactorPlatform[]>([]);
  const [loading, setLoading] = useState(true);
  const [pulsing, setPulsing] = useState(false);
  const [selectedReactor, setSelectedReactor] = useState("MIF-REACTOR-ORBITAL-01");
  const [currentBoost, setCurrentBoost] = useState(2.0);
  const [compressionGain, setCompressionGain] = useState(1.0);
  const [lastResult, setLastResult] = useState<MIFPulseResult | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchReactors = async () => {
    setErrorMsg(null);
    try {
      const res = await fetch("/api/magneto-inertial-fusion/reactors");
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error((data && data.error) || "Failed to load MIF reactors");
      }
      setReactors(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to load MIF reactors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReactors();
    setLogs([
      "[" + new Date().toLocaleTimeString() + "] Sovereign Directed Magneto-Inertial Fusion (MIF) Matrix online.",
      "[" + new Date().toLocaleTimeString() + "] Cylindrical metallic plasma liner magnetic compression driver armed (15-25 MA).",
      "[" + new Date().toLocaleTimeString() + "] Superconducting magnetic expansion nozzle calibrated for deep-space laser array powering.",
    ]);
  }, []);

  const handlePulse = async () => {
    setPulsing(true);
    setErrorMsg(null);
    setLogs((prev) => [
      "[" + new Date().toLocaleTimeString() + "] Discharging pulsed power banks into " + selectedReactor + " liner...",
      ...prev,
    ]);
    try {
      const res = await fetch("/api/magneto-inertial-fusion/pulse-fusion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reactor_id: selectedReactor,
          current_boost_ma: currentBoost,
          compression_gain: compressionGain,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error((data && data.error) || "MIF pulse initiation failed");
      }
      setLastResult(data);
      setLogs((prev) => [
        "[" + new Date().toLocaleTimeString() + "] SUCCESS: Thermonuclear Breakeven Exceeded! Gain: Q = " + data.fusion_gain_q.toFixed(2) + " (Yield: " + data.thermal_yield_gw.toFixed(2) + " GW_th).",
        "[" + new Date().toLocaleTimeString() + "] Direct Electrical Conversion: " + data.direct_electrical_conversion_mw.toFixed(1) + " MW | Magnetic Nozzle Isp: " + data.specific_impulse_isp_s.toFixed(0) + " s",
        ...prev,
      ]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "MIF pulse initiation failed.";
      setErrorMsg(msg);
      setLogs((prev) => [
        "[" + new Date().toLocaleTimeString() + "] ERROR: " + msg,
        ...prev,
      ]);
    } finally {
      setPulsing(false);
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-purple-950/40 via-fuchsia-900/30 to-amber-950/40 border border-purple-500/30 rounded-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-500/20 border border-purple-500/40 rounded-lg text-purple-400">
            <Flame className="w-8 h-8 animate-pulse text-fuchsia-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
              Sovereign Directed Magneto-Inertial Fusion (MIF) Matrix
              <span className="text-xs px-2 py-0.5 rounded bg-fuchsia-500/20 border border-fuchsia-500/40 text-fuchsia-300 font-mono">
                Option B
              </span>
            </h1>
            <p className="text-sm text-purple-200/70 mt-1">
              Multi-megampere magnetic liner compression: Q &gt; 10 breakeven, &gt;2.5 GW_th yield, and &gt;120,000s Isp magnetic nozzle propulsion
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchReactors}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-lg text-sm text-purple-300 transition-colors self-start md:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Reactors
        </button>
      </div>

      {/* Telemetry Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900/60 border border-purple-500/20 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Thermonuclear Gain Q</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-300">
            Q = {lastResult ? lastResult.fusion_gain_q.toFixed(2) : "11.97"}
          </div>
          <div className="text-xs text-emerald-400 mt-2 font-mono">&gt;10.0 Breakeven Met</div>
        </div>

        <div className="p-4 bg-slate-900/60 border border-purple-500/20 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Thermal Power Yield</span>
            <Flame className="w-4 h-4 text-fuchsia-400" />
          </div>
          <div className="text-2xl font-bold text-fuchsia-300">
            {lastResult ? lastResult.thermal_yield_gw.toFixed(2) : "3.02"}
            <span className="text-xs text-slate-400 ml-1">GW_th</span>
          </div>
          <div className="text-xs text-fuchsia-400 mt-2 font-mono">10 Hz Pulsed Baseload</div>
        </div>

        <div className="p-4 bg-slate-900/60 border border-purple-500/20 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Direct Electrical Output</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-300">
            {lastResult ? lastResult.direct_electrical_conversion_mw.toFixed(1) : "1027.0"}
            <span className="text-xs text-slate-400 ml-1">MW</span>
          </div>
          <div className="text-xs text-amber-400 mt-2 font-mono">DEW Array Synchronized</div>
        </div>

        <div className="p-4 bg-slate-900/60 border border-purple-500/20 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Specific Impulse (I_sp)</span>
            <Rocket className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-300">
            {lastResult ? lastResult.specific_impulse_isp_s.toFixed(0) : "130644"}
            <span className="text-xs text-slate-400 ml-1">s</span>
          </div>
          <div className="text-xs text-purple-400 mt-2 font-mono">&gt;1,180 km/s Exhaust Velocity</div>
        </div>
      </div>

      {/* Main Grid: Control Panel + Reactors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="p-6 bg-slate-900/60 border border-purple-500/20 rounded-xl space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Radio className="w-5 h-5 text-purple-400" />
            MIF Pulse Driver Controls
          </h2>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Target MIF Reactor</label>
            <select
              value={selectedReactor}
              onChange={(e) => setSelectedReactor(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
            >
              {reactors.map((r) => (
                <option key={r.reactor_id} value={r.reactor_id}>
                  {r.reactor_id} ({r.callsign.split(" ")[0]})
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Driver Current Boost (+MA)</span>
              <span className="text-purple-400 font-mono">+{currentBoost.toFixed(1)} MA</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="5.0"
              step="0.5"
              value={currentBoost}
              onChange={(e) => setCurrentBoost(parseFloat(e.target.value))}
              className="w-full accent-purple-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Compression Implosion Gain</span>
              <span className="text-purple-400 font-mono">{compressionGain.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.1"
              value={compressionGain}
              onChange={(e) => setCompressionGain(parseFloat(e.target.value))}
              className="w-full accent-purple-500"
            />
          </div>

          <button
            type="button"
            onClick={handlePulse}
            disabled={pulsing}
            className="w-full py-3 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-amber-600 hover:from-purple-500 hover:to-amber-500 disabled:opacity-50 text-white font-bold rounded-lg text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-900/30"
          >
            {pulsing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Imploding Metallic Plasma Liner...
              </>
            ) : (
              <>
                <Flame className="w-4 h-4" />
                Fire MIF Thermonuclear Pulse
              </>
            )}
          </button>
        </div>

        {/* Reactors Table */}
        <div className="lg:col-span-2 p-6 bg-slate-900/60 border border-purple-500/20 rounded-xl space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-fuchsia-400" />
            Operational Magneto-Inertial Fusion Cores
          </h2>
          {loading ? (
            <div className="text-slate-400 text-sm">Loading MIF reactors...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-2">Reactor ID</th>
                    <th className="pb-2">Callsign</th>
                    <th className="pb-2">Driver Current</th>
                    <th className="pb-2">Gain Q</th>
                    <th className="pb-2">Yield</th>
                    <th className="pb-2">I_sp (s)</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {reactors.map((r) => (
                    <tr key={r.reactor_id} className="hover:bg-slate-800/40">
                      <td className="py-2.5 font-mono text-purple-400">{r.reactor_id}</td>
                      <td className="py-2.5">{r.callsign.split("(")[0]}</td>
                      <td className="py-2.5 font-mono text-amber-400">{r.peak_driver_current_ma.toFixed(1)} MA</td>
                      <td className="py-2.5 font-mono text-emerald-400">Q={r.thermonuclear_q_factor.toFixed(1)}</td>
                      <td className="py-2.5 font-mono text-fuchsia-400">{r.thermal_power_output_gw.toFixed(2)} GW</td>
                      <td className="py-2.5 font-mono text-cyan-400">{r.magnetic_nozzle_isp_seconds.toFixed(0)} s</td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/10 text-purple-300 border border-purple-500/30">
                          {r.status}
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
        <div className="flex items-center gap-2 text-purple-400 mb-2">
          <Terminal className="w-4 h-4" />
          <span>MIF Pulsed Plasma Liner &amp; Magnetic Expansion Telemetry</span>
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

