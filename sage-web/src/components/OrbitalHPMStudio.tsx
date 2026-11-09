"use client";

import React, { useState, useEffect } from "react";
import {
  Radio,
  Zap,
  Activity,
  Terminal,
  RefreshCw,
  Target,
  Sparkles,
  Cpu,
  Flame,
} from "lucide-react";

interface HPMSatelliteNode {
  satellite_id: string;
  satellite_name: string;
  orbit_type: string;
  altitude_km: number;
  microwave_source_type: string;
  center_frequency_ghz: number;
  peak_pulse_power_gw: number;
  pulse_rise_time_ns: number;
  antenna_aperture_diameter_m: number;
  field_intensity_at_target_kv_m: number;
  status: string;
}

interface HPMPulseDischargeResult {
  discharge_id: string;
  satellite_id: string;
  target_identifier: string;
  target_category: string;
  pulse_duration_ns: number;
  delivered_energy_kj: number;
  field_intensity_kv_m: number;
  induced_junction_voltage_volts: number;
  lna_burnout_achieved: boolean;
  microcontroller_latchup: boolean;
  target_functional_kill_pct: number;
  status: string;
  timestamp: string;
}

export function OrbitalHPMStudio() {
  const [satellites, setSatellites] = useState<HPMSatelliteNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [discharging, setDischarging] = useState(false);
  const [selectedSat, setSelectedSat] = useState("HPM-SAT-LEO-ALPHA-01");
  const [targetId, setTargetId] = useState("RADAR-BATTERY-S400-SECTOR-9");
  const [targetCat, setTargetCat] = useState("SAM_RADAR_PHASED_ARRAY");
  const [pulseDurationNs, setPulseDurationNs] = useState(250.0);
  const [lastDischarge, setLastDischarge] = useState<HPMPulseDischargeResult | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const fetchSatellites = async () => {
    try {
      const res = await fetch("/api/orbital-hpm/arrays");
      if (res.ok) {
        const data = await res.json();
        setSatellites(data);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSatellites();
    setLogs([
      "[" + new Date().toLocaleTimeString() + "] Sovereign Orbital High-Power Microwave (HPM) Grid online.",
      "[" + new Date().toLocaleTimeString() + "] Relativistic magnetron capacitor banks charged to 100% nominal.",
      "[" + new Date().toLocaleTimeString() + "] Steerable Cassegrain reflectors calibrated for sub-nanosecond pulse delivery.",
    ]);
  }, []);

  const handleDischarge = async () => {
    setDischarging(true);
    setLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] Sighting target ${targetId} (${targetCat}) from ${selectedSat}...`,
      `[${new Date().toLocaleTimeString()}] Discharging ${pulseDurationNs} ns HPM pulse...`,
      ...prev,
    ]);

    try {
      const res = await fetch("/api/orbital-hpm/fire-pulse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          satellite_id: selectedSat,
          target_identifier: targetId,
          target_category: targetCat,
          pulse_duration_ns: pulseDurationNs,
        }),
      });

      if (res.ok) {
        const data: HPMPulseDischargeResult = await res.json();
        setLastDischarge(data);
        setLogs((prev) => [
          `[${new Date().toLocaleTimeString()}] TARGET ELECTRONICS DESTROYED: ${data.discharge_id}`,
          `[${new Date().toLocaleTimeString()}] Field Intensity: ${data.field_intensity_kv_m.toFixed(1)} kV/m | Delivered Energy: ${data.delivered_energy_kj.toFixed(1)} kJ`,
          `[${new Date().toLocaleTimeString()}] Induced Junction Voltage: ${data.induced_junction_voltage_volts.toFixed(0)} V (LNA Burnout: ${data.lna_burnout_achieved ? "YES" : "NO"})`,
          `[${new Date().toLocaleTimeString()}] Microcontroller Latchup: ${data.microcontroller_latchup ? "CONFIRMED" : "FAILED"} | Kill Rate: ${data.target_functional_kill_pct}%`,
          ...prev,
        ]);
      }
    } catch {
      setLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] DISCHARGE ERROR: Beam pointing telemetry desynchronization.`,
        ...prev,
      ]);
    } finally {
      setDischarging(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl border border-yellow-500/30 bg-gradient-to-r from-yellow-950/40 via-slate-900 to-amber-950/40 p-6 backdrop-blur">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400">
                <Radio className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  Sovereign Orbital High-Power Microwave (HPM) Electronics Directed Energy Grid
                  <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 font-mono">
                    Orbital HPM Grid
                  </span>
                </h1>
                <p className="text-sm text-slate-400">
                  Relativistic Magnetron / Vircator Pulsed Microwaves (1.2–3.5 GHz), LNA Burnout & Swarm Paralysis
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchSatellites}
              disabled={loading}
              className="px-3 py-1.5 text-xs font-mono rounded-lg border border-yellow-500/40 bg-yellow-500/10 text-yellow-300 hover:bg-yellow-500/20 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Sync Constellation
            </button>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-yellow-900/40 border border-yellow-500/30 text-yellow-300 text-xs font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 animate-pulse" />
              GRID DIRECTED ARMED
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Satellite Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {satellites.map((s) => (
          <div
            key={s.satellite_id}
            onClick={() => setSelectedSat(s.satellite_id)}
            className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 ${
              selectedSat === s.satellite_id
                ? "border-yellow-500 bg-yellow-950/30 shadow-lg shadow-yellow-950/50"
                : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-semibold text-yellow-400 truncate">
                {s.satellite_id}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border bg-yellow-500/20 text-yellow-300 border-yellow-500/40">
                {s.status}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-white truncate mb-1">
              {s.satellite_name}
            </h3>
            <p className="text-xs font-mono text-yellow-300/80 mb-3 truncate">
              {s.microwave_source_type}
            </p>

            <div className="space-y-1.5 text-xs text-slate-400 font-mono">
              <div className="flex justify-between">
                <span>Orbit:</span>
                <span className="text-slate-200">{s.altitude_km} km ({s.orbit_type.split("_")[0]})</span>
              </div>
              <div className="flex justify-between">
                <span>Center Freq:</span>
                <span className="text-yellow-300 font-bold">{s.center_frequency_ghz} GHz</span>
              </div>
              <div className="flex justify-between">
                <span>Peak Power:</span>
                <span className="text-amber-400 font-bold">{s.peak_pulse_power_gw} GW</span>
              </div>
              <div className="flex justify-between">
                <span>Target Field:</span>
                <span className="text-rose-400">{s.field_intensity_at_target_kv_m} kV/m</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Control Panel & Pulse Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-400" />
            Pulsed Microwave Discharge
          </h2>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1 font-mono">
                Firing Satellite Node
              </label>
              <select
                value={selectedSat}
                onChange={(e) => setSelectedSat(e.target.value)}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-slate-200 font-mono focus:border-yellow-500 focus:outline-none"
              >
                {satellites.map((s) => (
                  <option key={s.satellite_id} value={s.satellite_id}>
                    {s.satellite_name} ({s.peak_pulse_power_gw} GW)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1 font-mono">
                Target Identifier
              </label>
              <input
                type="text"
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-slate-200 font-mono focus:border-yellow-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1 font-mono">
                Target Category
              </label>
              <select
                value={targetCat}
                onChange={(e) => setTargetCat(e.target.value)}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-slate-200 font-mono focus:border-yellow-500 focus:outline-none"
              >
                <option value="SAM_RADAR_PHASED_ARRAY">SAM Radar Phased Array (LNA Burnout)</option>
                <option value="DRONE_SWARM_MICROCONTROLLERS">Drone Swarm Microcontrollers (Latchup)</option>
                <option value="C4ISR_HARDENED_BUNKER">C4ISR Bunker (Transient Surge Injection)</option>
                <option value="SATELLITE_UPLINK_TRANSCEIVER">Satellite Ground Uplink Transceiver</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                <span>Pulse Duration:</span>
                <span className="text-yellow-300 font-bold">{pulseDurationNs.toFixed(0)} ns</span>
              </div>
              <input
                type="range"
                min="50"
                max="800"
                step="25"
                value={pulseDurationNs}
                onChange={(e) => setPulseDurationNs(parseFloat(e.target.value))}
                className="w-full accent-yellow-500"
              />
            </div>

            <button
              onClick={handleDischarge}
              disabled={discharging}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-white font-semibold text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-yellow-900/30"
            >
              <Flame className={`h-4 w-4 ${discharging ? "animate-pulse" : ""}`} />
              {discharging ? "Discharging Gigawatt Pulse..." : "Discharge HPM Pulse"}
            </button>
          </div>
        </div>

        {/* Telemetry Display */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Activity className="h-4 w-4 text-yellow-400" />
            Target Intercept Telemetry
          </h2>

          {lastDischarge ? (
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-yellow-950/30 border border-yellow-500/30 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Discharge ID:</span>
                  <span className="text-yellow-300 font-bold">{lastDischarge.discharge_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Field Intensity:</span>
                  <span className="text-rose-400 font-bold">{lastDischarge.field_intensity_kv_m.toFixed(1)} kV/m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Induced Junction Spike:</span>
                  <span className="text-white font-bold">{lastDischarge.induced_junction_voltage_volts.toFixed(0)} V</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">LNA Burnout:</span>
                  <span className="text-emerald-400 font-bold">{lastDischarge.lna_burnout_achieved ? "DESTROYED" : "SURVIVED"}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Microcontroller Latchup:</span>
                  <span className="text-emerald-400 font-bold">{lastDischarge.microcontroller_latchup ? "CONFIRMED" : "NEGATIVE"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Kill Rate:</span>
                  <span className="text-emerald-400 font-bold">{lastDischarge.target_functional_kill_pct}%</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-40 flex flex-col items-center justify-center text-slate-500 text-xs font-mono space-y-2">
              <Target className="h-8 w-8 text-slate-700" />
              <span>Ready for high-power microwave discharge.</span>
            </div>
          )}
        </div>

        {/* Live Execution Terminal */}
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs flex flex-col h-[280px]">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400">
            <span className="flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5 text-yellow-400" />
              Orbital HPM Console
            </span>
            <span className="text-[10px] text-yellow-400/80">ONLINE</span>
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
