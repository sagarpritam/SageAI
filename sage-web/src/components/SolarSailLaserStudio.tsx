"use client";

import React, { useState, useEffect } from "react";
import {
  Sun,
  ShieldCheck,
  Zap,
  RefreshCw,
  Terminal,
  Layers,
  Compass,
  Rocket,
  Target,
  Sparkles,
  AlertTriangle,
} from "lucide-react";

interface LaserArray {
  array_id: string;
  location_name: string;
  latitude: number;
  longitude: number;
  altitude_m: number;
  total_power_gw: number;
  operating_wavelength_nm: number;
  synthesized_aperture_m: number;
  sub_emitter_tiles: number;
  strehl_ratio: number;
  tracking_slew_rate_deg_s: number;
  status: string;
}

interface PropulsionEvent {
  event_id: string;
  array_id: string;
  target_type: string;
  target_id: string;
  beam_power_gw: number;
  duration_seconds: number;
  radiation_pressure_pa: number;
  total_photonic_thrust_newtons: number;
  achieved_delta_v_m_s: number;
  terminal_velocity_fraction_c: number;
  projected_miss_distance_km: number;
  strehl_ratio: number;
  status: string;
  timestamp: string;
}

export function SolarSailLaserStudio() {
  const [arrays, setArrays] = useState<LaserArray[]>([]);
  const [loading, setLoading] = useState(true);
  const [discharging, setDischarging] = useState(false);
  const [selectedArray, setSelectedArray] = useState("LASER-ARRAY-ATACAMA-01");
  const [targetType, setTargetType] = useState("RELATIVISTIC_LIGHTSAIL");
  const [targetId, setTargetId] = useState("STARSHOT-PROBE-01");
  const [powerGw, setPowerGw] = useState(90.0);
  const [durationSec, setDurationSec] = useState(120.0);
  const [lastEvent, setLastEvent] = useState<PropulsionEvent | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchArrays = async () => {
    setErrorMsg(null);
    try {
      const res = await fetch("/api/solar-sail-laser/arrays");
      if (!res.ok) {
        const errData = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(errData.error || "Failed to load solar sail laser arrays");
      }
      const data = await res.json();
      setArrays(data);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to load solar sail laser arrays");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArrays();
  }, []);

  const handleFirePulse = async () => {
    setDischarging(true);
    setErrorMsg(null);
    setLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] Locking coherent phased laser array ${selectedArray} (${powerGw} GW, 1064nm) onto ${targetId}...`,
      ...prev,
    ]);

    try {
      const res = await fetch("/api/solar-sail-laser/fire-pulse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          array_id: selectedArray,
          target_type: targetType,
          target_id: targetId,
          beam_power_gw: powerGw,
          duration_seconds: durationSec,
          target_mass_kg: targetType.includes("LIGHTSAIL") ? 0.001 : 1e7,
          sail_area_m2: 16.0,
          reflectivity: 0.9995,
        }),
      });

      if (!res.ok) {
        const errData = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(errData.error || "Phased laser radiation pulse failed");
      }
      const data = await res.json();
      setLastEvent(data);
      const relInfo = targetType.includes("LIGHTSAIL")
        ? `Terminal Velocity: ${(data.terminal_velocity_fraction_c * 100).toFixed(1)}% c`
        : `Deflection Miss: ${data.projected_miss_distance_km.toLocaleString()} km`;
      setLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] Photonic discharge complete: Thrust ${data.total_photonic_thrust_newtons} N | Pressure ${data.radiation_pressure_pa} Pa | ${relInfo}`,
        ...prev,
      ]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Atmospheric adaptive optics de-phased";
      setErrorMsg(msg);
      setLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] Laser pulse error: ${msg}`,
        ...prev,
      ]);
    } finally {
      setDischarging(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-950/40 via-yellow-900/20 to-neutral-900/40 p-6 backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-400 border border-amber-500/30">
                Capability 77
              </span>
              <span className="text-xs text-neutral-400">Wave 19 Relativistic Laser Pushing</span>
            </div>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Sun className="h-6 w-6 text-amber-400" />
              Phased Array Gigawatt Relativistic Solar Sail Laser Propulsion Mesh
            </h2>
            <p className="mt-1 text-sm text-neutral-300">
              100 Gigawatt coherent phased-array laser (1064 nm) delivering photon radiation pressure for relativistic lightsail probes (0.15–0.20 c) and planetary kinetic asteroid deflection.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchArrays}
            className="flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-800/80 px-4 py-2 text-sm font-medium text-neutral-200 transition hover:bg-neutral-700"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Sync Laser Emitters
          </button>
        </div>
      </div>

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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
          <div className="flex items-center gap-2 text-neutral-400 text-xs">
            <Zap className="h-4 w-4 text-amber-400" />
            Total Synthesized Power
          </div>
          <div className="mt-2 text-2xl font-bold text-white">305 GW Peak</div>
          <div className="mt-1 text-xs text-amber-400">Phase-Locked Emitter Tiles</div>
        </div>

        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
          <div className="flex items-center gap-2 text-neutral-400 text-xs">
            <Compass className="h-4 w-4 text-yellow-400" />
            Mean Strehl Ratio
          </div>
          <div className="mt-2 text-2xl font-bold text-white">0.93 S</div>
          <div className="mt-1 text-xs text-yellow-400">Adaptive Wavefront Optics</div>
        </div>

        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
          <div className="flex items-center gap-2 text-neutral-400 text-xs">
            <Rocket className="h-4 w-4 text-cyan-400" />
            Relativistic Velocity
          </div>
          <div className="mt-2 text-2xl font-bold text-white">0.185 c</div>
          <div className="mt-1 text-xs text-cyan-400">55,500 km/s Cruise Speed</div>
        </div>

        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
          <div className="flex items-center gap-2 text-neutral-400 text-xs">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Photonic Radiation Thrust
          </div>
          <div className="mt-2 text-2xl font-bold text-white">533.4 N</div>
          <div className="mt-1 text-xs text-emerald-400">P = 2&middot;R&middot;I / c</div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Laser Arrays */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                Coherent Laser Phased Arrays
              </h3>
              <span className="text-xs text-neutral-400">{arrays.length} Active Installations</span>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              {arrays.map((arr) => (
                <div
                  key={arr.array_id}
                  className="rounded-lg border border-neutral-800 bg-neutral-950/60 p-3.5 hover:border-amber-500/40 transition"
                >
                  <div className="font-semibold text-white text-xs">{arr.array_id}</div>
                  <div className="text-[11px] text-amber-400 font-mono mt-0.5">{arr.location_name}</div>
                  <div className="mt-3 space-y-1 text-[11px] text-neutral-400">
                    <div>Power: <span className="text-white font-bold">{arr.total_power_gw} GW</span></div>
                    <div>Aperture: <span className="text-neutral-200">{arr.synthesized_aperture_m} m</span></div>
                    <div>Strehl: <span className="text-neutral-200">{arr.strehl_ratio}</span></div>
                    <div>Tiles: <span className="text-neutral-200">{arr.sub_emitter_tiles.toLocaleString()}</span></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Firing Controls */}
            <div className="mt-6 rounded-lg border border-amber-500/20 bg-amber-950/20 p-4">
              <h4 className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
                Target Lock &amp; Laser Pulse Configuration
              </h4>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-neutral-400">Array</label>
                  <select
                    value={selectedArray}
                    onChange={(e) => setSelectedArray(e.target.value)}
                    className="mt-1 w-full rounded border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs text-white"
                  >
                    {arrays.map((a) => (
                      <option key={a.array_id} value={a.array_id}>
                        {a.array_id}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-neutral-400">Target Mission Type</label>
                  <select
                    value={targetType}
                    onChange={(e) => setTargetType(e.target.value)}
                    className="mt-1 w-full rounded border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs text-white"
                  >
                    <option value="RELATIVISTIC_LIGHTSAIL">Relativistic Lightsail (Interstellar)</option>
                    <option value="ASTEROID_HAZARD_DEFLECTION">Asteroid Hazard Kinetic Deflection</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-neutral-400">Target Identifier</label>
                  <input
                    type="text"
                    value={targetId}
                    onChange={(e) => setTargetId(e.target.value)}
                    className="mt-1 w-full rounded border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-neutral-400">Beam Power: {powerGw} GW</label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={powerGw}
                    onChange={(e) => setPowerGw(parseFloat(e.target.value))}
                    className="mt-1 w-full accent-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-400">Duration: {durationSec} Seconds</label>
                  <input
                    type="range"
                    min="30"
                    max="600"
                    step="30"
                    value={durationSec}
                    onChange={(e) => setDurationSec(parseFloat(e.target.value))}
                    className="mt-1 w-full accent-amber-500"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleFirePulse}
                disabled={discharging}
                className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs py-2.5 transition disabled:opacity-50"
              >
                <Zap className="h-4 w-4" />
                {discharging ? "Discharging Coherent Phased Laser Beam..." : "Discharge Gigawatt Radiation Pressure Pulse"}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Pulse Telemetry & Logs */}
        <div className="space-y-4">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-neutral-800 pb-3">
              <Target className="h-4 w-4 text-amber-400" />
              Pulse Telemetry &amp; Velocity
            </h3>

            {lastEvent ? (
              <div className="mt-4 space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Event ID:</span>
                  <span className="font-mono text-amber-400">{lastEvent.event_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Target ID:</span>
                  <span className="text-white font-bold">{lastEvent.target_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Radiation Pressure:</span>
                  <span className="text-white font-mono">{lastEvent.radiation_pressure_pa} Pa</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Photonic Thrust:</span>
                  <span className="text-amber-400 font-bold">{lastEvent.total_photonic_thrust_newtons} N</span>
                </div>
                {lastEvent.terminal_velocity_fraction_c > 0 ? (
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Relativistic Velocity:</span>
                    <span className="text-cyan-400 font-bold">{(lastEvent.terminal_velocity_fraction_c * 100).toFixed(1)}% c</span>
                  </div>
                ) : (
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Asteroid Miss Distance:</span>
                    <span className="text-emerald-400 font-bold">{lastEvent.projected_miss_distance_km.toLocaleString()} km</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-neutral-400">Strehl Ratio:</span>
                  <span className="text-white font-mono">{lastEvent.strehl_ratio}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Status:</span>
                  <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-emerald-400 border border-emerald-500/20">
                    {lastEvent.status}
                  </span>
                </div>
              </div>
            ) : (
              <div className="mt-6 text-center text-xs text-neutral-500 py-6">
                Click &quot;Discharge Gigawatt Radiation Pressure Pulse&quot; to inspect propulsion telemetry.
              </div>
            )}
          </div>

          {/* Console Log */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400 border-b border-neutral-800/80 pb-2">
              <Terminal className="h-3.5 w-3.5 text-amber-400" />
              Laser Array Telemetry Feed
            </div>
            <div className="mt-3 h-44 overflow-y-auto space-y-1.5 font-mono text-[11px] text-neutral-400">
              {logs.length > 0 ? (
                logs.map((log, i) => <div key={i}>{log}</div>)
              ) : (
                <div className="text-neutral-600">Phased array phase-locked. Standing by for beam steering...</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

