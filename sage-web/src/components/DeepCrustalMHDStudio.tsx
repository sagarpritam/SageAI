"use client";

import React, { useState, useEffect } from "react";
import {
  Mountain,
  Zap,
  Activity,
  Terminal,
  RefreshCw,
  Shield,
  Sparkles,
  Flame,
  Radio,
  Sliders,
} from "lucide-react";

interface MHDGeothermalNode {
  vault_id: string;
  vault_name: string;
  depth_kilometers: number;
  geothermal_brine_temp_celsius: number;
  brine_pressure_mpa: number;
  superconducting_b_field_tesla: number;
  brine_conductivity_siemens_m: number;
  rated_mhd_output_mw: number;
  vault_hardening_rating: string;
  status: string;
}

interface MHDPowerDischargeResult {
  discharge_id: string;
  vault_id: string;
  brine_flow_velocity_m_s: number;
  generated_mhd_power_mw: number;
  hall_parameter_beta: number;
  mhd_generator_efficiency_pct: number;
  vault_internal_power_allocated_mw: number;
  sovereign_grid_export_mw: number;
  subterranean_isolation_confirmed: boolean;
  status: string;
  timestamp: string;
}

export function DeepCrustalMHDStudio() {
  const [vaults, setVaults] = useState<MHDGeothermalNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedVault, setSelectedVault] = useState("MHD-VAULT-ICELAND-01");
  const [velocityFactor, setVelocityFactor] = useState(1.0);
  const [loadFactor, setLoadFactor] = useState(0.85);
  const [lastDischarge, setLastDischarge] = useState<MHDPowerDischargeResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const fetchVaults = async () => {
    setErrorMsg(null);
    try {
      const res = await fetch("/api/deep-crustal-mhd/vaults");
      if (!res.ok) {
        throw new Error(`MHD vaults fetch returned HTTP ${res.status}`);
      }
      const data = await res.json();
      setVaults(data);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to load deep-crustal MHD vaults.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVaults();
    setLogs([
      "[" + new Date().toLocaleTimeString() + "] Sovereign Subterranean Deep-Crustal MHD Geothermal Grid online.",
      "[" + new Date().toLocaleTimeString() + "] Supercritical brine loops stabilized at 450°C - 580°C and 28 - 34 MPa.",
      "[" + new Date().toLocaleTimeString() + "] Transverse 8.5 Tesla superconducting magnetic channels energized.",
    ]);
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setErrorMsg(null);
    setLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] Engaging supercritical brine flow at ${selectedVault} (Velocity: ${velocityFactor}x, Load: ${loadFactor})...`,
      ...prev,
    ]);

    try {
      const res = await fetch("/api/deep-crustal-mhd/generate-power", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vault_id: selectedVault,
          brine_velocity_factor: velocityFactor,
          load_factor: loadFactor,
        }),
      });

      if (!res.ok) {
        throw new Error(`MHD power discharge returned HTTP ${res.status}`);
      }
      const data: MHDPowerDischargeResult = await res.json();
      setLastDischarge(data);
      setLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] DIRECT DC BASELOAD ENGAGED: ${data.discharge_id}`,
        `[${new Date().toLocaleTimeString()}] Generated Power: ${data.generated_mhd_power_mw.toFixed(1)} MW | Grid Export: ${data.sovereign_grid_export_mw.toFixed(1)} MW`,
        `[${new Date().toLocaleTimeString()}] Generator Efficiency: ${data.mhd_generator_efficiency_pct}% | Hall Parameter beta: ${data.hall_parameter_beta.toFixed(3)}`,
        `[${new Date().toLocaleTimeString()}] Subterranean Isolation: ${data.subterranean_isolation_confirmed ? "SECURED (CLASS-V)" : "ATTENUATED"}`,
        ...prev,
      ]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Supercritical brine pressure destabilization.";
      setErrorMsg(msg);
      setLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] GENERATION ERROR: ${msg}`,
        ...prev,
      ]);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-slate-900 to-yellow-950/40 p-6 backdrop-blur">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Mountain className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  Sovereign Subterranean Deep-Crustal MHD Geothermal Power & Kinetic Vault
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono">
                    Deep-Crustal MHD Vault
                  </span>
                </h1>
                <p className="text-sm text-slate-400">
                  Supercritical Geothermal Brine (600°C), 8.5T Transverse Superconducting Channels & 1.8 GW Direct DC Baseload
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchVaults}
              disabled={loading}
              className="px-3 py-1.5 text-xs font-mono rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Sync Deep Vaults
            </button>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-900/40 border border-amber-500/30 text-amber-300 text-xs font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              MHD BASELOAD ACTIVE
            </div>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="rounded-xl border border-red-800/60 bg-red-950/40 px-4 py-3 text-xs font-mono text-red-300 flex items-center justify-between gap-3"
        >
          <span>{errorMsg}</span>
          <button type="button" onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-red-200 underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Grid: Vault Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {vaults.map((v) => (
          <div
            key={v.vault_id}
            onClick={() => setSelectedVault(v.vault_id)}
            className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 ${
              selectedVault === v.vault_id
                ? "border-amber-500 bg-amber-950/30 shadow-lg shadow-amber-950/50"
                : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-semibold text-amber-400 truncate">
                {v.vault_id}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border bg-amber-500/20 text-amber-300 border-amber-500/40">
                {v.status}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-white truncate mb-1">
              {v.vault_name}
            </h3>
            <p className="text-xs font-mono text-amber-300/80 mb-3 truncate">
              {v.vault_hardening_rating} ({v.depth_kilometers} km depth)
            </p>

            <div className="space-y-1.5 text-xs text-slate-400 font-mono">
              <div className="flex justify-between">
                <span>Brine Temp:</span>
                <span className="text-rose-400 font-bold">{v.geothermal_brine_temp_celsius}°C</span>
              </div>
              <div className="flex justify-between">
                <span>Brine Pressure:</span>
                <span className="text-slate-200">{v.brine_pressure_mpa} MPa</span>
              </div>
              <div className="flex justify-between">
                <span>Superconducting B:</span>
                <span className="text-yellow-300 font-bold">{v.superconducting_b_field_tesla} Tesla</span>
              </div>
              <div className="flex justify-between">
                <span>Rated Output:</span>
                <span className="text-emerald-400 font-bold">{v.rated_mhd_output_mw} MW</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Control Panel & MHD Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-400" />
            MHD Channel Actuator
          </h2>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1 font-mono">
                Active Deep Geothermal Vault
              </label>
              <select
                value={selectedVault}
                onChange={(e) => setSelectedVault(e.target.value)}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-slate-200 font-mono focus:border-amber-500 focus:outline-none"
              >
                {vaults.map((v) => (
                  <option key={v.vault_id} value={v.vault_id}>
                    {v.vault_name} ({v.rated_mhd_output_mw} MW)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                <span>Brine Velocity Factor:</span>
                <span className="text-amber-300 font-bold">{velocityFactor.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.05"
                value={velocityFactor}
                onChange={(e) => setVelocityFactor(parseFloat(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                <span>Electrical Load Factor:</span>
                <span className="text-amber-300 font-bold">{(loadFactor * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.4"
                max="1.0"
                step="0.05"
                value={loadFactor}
                onChange={(e) => setLoadFactor(parseFloat(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-semibold text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-amber-900/30"
            >
              <Sparkles className={`h-4 w-4 ${generating ? "animate-spin" : ""}`} />
              {generating ? "Harvesting Supercritical Plasma..." : "Generate MHD Baseload"}
            </button>
          </div>
        </div>

        {/* Telemetry Display */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Activity className="h-4 w-4 text-amber-400" />
            MHD Power Telemetry
          </h2>

          {lastDischarge ? (
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/30 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Discharge ID:</span>
                  <span className="text-amber-300 font-bold">{lastDischarge.discharge_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Generated:</span>
                  <span className="text-white font-bold">{lastDischarge.generated_mhd_power_mw.toFixed(1)} MW</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Sovereign Grid Export:</span>
                  <span className="text-emerald-400 font-bold">{lastDischarge.sovereign_grid_export_mw.toFixed(1)} MW</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Vault Internal Power:</span>
                  <span className="text-amber-300">{lastDischarge.vault_internal_power_allocated_mw.toFixed(1)} MW</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">MHD Efficiency:</span>
                  <span className="text-emerald-400 font-bold">{lastDischarge.mhd_generator_efficiency_pct}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Hall Parameter beta:</span>
                  <span className="text-slate-200">{lastDischarge.hall_parameter_beta.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Subterranean Isolation:</span>
                  <span className="text-emerald-400 font-bold">{lastDischarge.subterranean_isolation_confirmed ? "SECURED (CLASS-V)" : "ALERT"}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-40 flex flex-col items-center justify-center text-slate-500 text-xs font-mono space-y-2">
              <Mountain className="h-8 w-8 text-slate-700" />
              <span>Ready for deep geothermal MHD baseload generation.</span>
            </div>
          )}
        </div>

        {/* Live Execution Terminal */}
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs flex flex-col h-[280px]">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400">
            <span className="flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5 text-amber-400" />
              MHD Vault Console
            </span>
            <span className="text-[10px] text-amber-400/80">ONLINE</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 text-slate-300 pr-1 select-text">
            {logs.map((log, index) => (
              <div key={index} className="leading-relaxed">
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

