"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Rocket,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Activity,
  RefreshCw,
  Sliders,
  Sparkles,
  Terminal,
  Target,
  Flame,
  Radio,
  Crosshair,
} from "lucide-react";

interface HypersonicThreat {
  threat_id: string;
  name: string;
  velocity_mach: number;
  altitude_km: number;
  plasma_density_cm3: number;
  cross_range_maneuver: string;
  status: string;
  sensor_fusion: string;
  time_to_impact_sec: number;
  interceptions_count: number;
}

interface GlideTracking {
  tracking_id: string;
  threat_id: string;
  threat_detected: boolean;
  threat_type: string;
  threat_level: string;
  measured_mach: number;
  altitude_km: number;
  skip_glide_detected: boolean;
  plasma_sheath_blackout: boolean;
  plasma_cutoff_freq_ghz: number;
  predicted_impact_latitude: number;
  predicted_impact_longitude: number;
  action_recommended: string;
}

interface InterceptResult {
  intercept_id: string;
  threat_id: string;
  interceptor_weapon: string;
  fire_control_latency_ms: number;
  intercept_altitude_km: number;
  relative_closing_mach: number;
  kinetic_kill_verified: boolean;
  debris_burnup_guaranteed: boolean;
  new_threat_status: string;
}

export function HypersonicDefenseStudio() {
  const [threats, setThreats] = useState<HypersonicThreat[]>([]);
  const [selectedThreat, setSelectedThreat] = useState<HypersonicThreat | null>(null);
  const [loading, setLoading] = useState(false);
  const [mach, setMach] = useState<number>(24.5);
  const [altitude, setAltitude] = useState<number>(68.0);
  const [skipGlide, setSkipGlide] = useState<boolean>(true);
  const [plasmaBlackout, setPlasmaBlackout] = useState<boolean>(true);
  const [weaponType, setWeaponType] = useState<string>("DIRECTED_ENERGY_OPTICAL_LASER_EKV");
  const [tracking, setTracking] = useState(false);
  const [firing, setFiring] = useState(false);
  const [trackResult, setTrackResult] = useState<GlideTracking | null>(null);
  const [interceptResult, setInterceptResult] = useState<InterceptResult | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const hasInitializedSelectionRef = useRef(false);

  const fetchThreats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/hypersonic-defense/threats");
      const data = await res.json();
      if (data.threats) {
        setThreats(data.threats);
        if (!hasInitializedSelectionRef.current && data.threats.length > 0) {
          hasInitializedSelectionRef.current = true;
          setSelectedThreat(data.threats[0]);
          setMach(data.threats[0].velocity_mach);
          setAltitude(data.threats[0].altitude_km);
        }
      }
    } catch (err) {
      console.error("Failed to load hypersonic threats", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchThreats();
  }, [fetchThreats]);

  async function handleTrack() {
    if (!selectedThreat) return;
    setTracking(true);
    setTrackResult(null);
    try {
      const res = await fetch("/api/hypersonic-defense/track-glide-path", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threat_id: selectedThreat.threat_id,
          measured_mach: mach,
          altitude_km: altitude,
          skip_glide_detected: skipGlide,
          plasma_blackout_active: plasmaBlackout,
        }),
      });
      const data = await res.json();
      if (data.tracking) {
        setTrackResult(data.tracking);
        if (data.tracking.threat_detected) {
          setThreats((prev) =>
            prev.map((t) =>
              t.threat_id === selectedThreat.threat_id
                ? { ...t, status: "IMMINENT_HYPERSONIC_MANEUVER" }
                : t
            )
          );
        }
        setLogs((prev) => [
          `[${new Date().toLocaleTimeString()}] HGV TRACK: ${selectedThreat.threat_id} -> ${data.tracking.threat_type} (Mach ${mach} @ ${altitude} km, Cutoff: ${data.tracking.plasma_cutoff_freq_ghz} GHz)`,
          ...prev.slice(0, 15),
        ]);
      }
    } catch (err) {
      console.error("Tracking failed", err);
    } finally {
      setTracking(false);
    }
  }

  async function handleFire() {
    if (!selectedThreat) return;
    setFiring(true);
    try {
      const res = await fetch("/api/hypersonic-defense/fire-interceptor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threat_id: selectedThreat.threat_id,
          interceptor_type: weaponType,
          fire_control_latency_ms: 2.1,
        }),
      });
      const data = await res.json();
      if (data.interception) {
        setInterceptResult(data.interception);
        setThreats((prev) =>
          prev.map((t) =>
            t.threat_id === selectedThreat.threat_id
              ? {
                  ...t,
                  status: "NEUTRALIZED_KINETIC_KILL",
                  interceptions_count: t.interceptions_count + 1,
                }
              : t
          )
        );
        setSelectedThreat((prev) =>
          prev ? { ...prev, status: "NEUTRALIZED_KINETIC_KILL" } : null
        );
        setLogs((prev) => [
          `[${new Date().toLocaleTimeString()}] HYPERSONIC KILL: Intercepted ${selectedThreat.threat_id} with ${data.interception.interceptor_weapon} in ${data.interception.fire_control_latency_ms} ms (Closing Mach: ${data.interception.relative_closing_mach})`,
          ...prev.slice(0, 15),
        ]);
      }
    } catch (err) {
      console.error("Firing failed", err);
    } finally {
      setFiring(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-6 rounded-2xl bg-gradient-to-r from-orange-950/40 via-red-900/20 to-slate-900/50 border border-orange-500/30 backdrop-blur-md shadow-2xl">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-orange-500/20 border border-orange-500/40 rounded-xl text-orange-400">
            <Rocket className="w-8 h-8 animate-pulse text-orange-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
              Autonomous Hypersonic Glide Vehicle (HGV) Trajectory Tracker & Interceptor
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 font-mono">
                CAP-61 • v4.6.0
              </span>
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              Mach 15–25 Non-Ballistic Atmospheric Skip-Glide Tracking, Plasma Blackout Modeling & Sub-2.4ms Interception
            </p>
          </div>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <button
            onClick={fetchThreats}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-medium transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Threats</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-lg">
          <span className="text-xs font-medium text-slate-400">Tracked HGV Threats</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{threats.length}</span>
            <span className="text-xs text-slate-400">Mach 9-25</span>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-lg">
          <span className="text-xs font-medium text-orange-400">Closing Velocity</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-orange-300">Mach 38.5</span>
            <span className="text-xs text-orange-400/80">Relative</span>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-lg">
          <span className="text-xs font-medium text-red-400">Fire-Control Latency</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-red-300">2.1 ms</span>
            <span className="text-xs text-red-400/80">Sub-2.4ms Target</span>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-lg">
          <span className="text-xs font-medium text-emerald-400">Kinetic Kill Rate</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-300">100.0%</span>
            <span className="text-xs text-emerald-400/80">Atmospheric Burn</span>
          </div>
        </div>
      </div>

      {/* Main Studio Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hypersonic Threats List */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <Target className="w-4 h-4 text-orange-400" />
            Monitored Hypersonic Incursions
          </h3>
          <div className="space-y-3">
            {threats.map((threat) => {
              const isSelected = selectedThreat?.threat_id === threat.threat_id;
              const isNeutralized = threat.status === "NEUTRALIZED_KINETIC_KILL";

              return (
                <div
                  key={threat.threat_id}
                  onClick={() => {
                    hasInitializedSelectionRef.current = true;
                    setSelectedThreat(threat);
                    setMach(threat.velocity_mach);
                    setAltitude(threat.altitude_km);
                    setTrackResult(null);
                    setInterceptResult(null);
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-orange-950/30 border-orange-500/60 shadow-lg shadow-orange-950/40"
                      : "bg-slate-900/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{threat.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Fusion: {threat.sensor_fusion}</p>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        isNeutralized
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                      }`}
                    >
                      {threat.status}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                    <span>Maneuver: {threat.cross_range_maneuver.slice(0, 12)}</span>
                    <span>Alt: {threat.altitude_km} km</span>
                    <span className="font-mono text-orange-300">Mach {threat.velocity_mach}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Telemetry and Interceptor Controls */}
        <div className="lg:col-span-2 space-y-6">
          {selectedThreat ? (
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    {selectedThreat.name}
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {selectedThreat.threat_id}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Sensor: {selectedThreat.sensor_fusion} • Maneuver: {selectedThreat.cross_range_maneuver}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Flight Speed</span>
                  <span className="text-lg font-bold text-orange-400 font-mono">
                    Mach {mach.toFixed(1)}
                  </span>
                </div>
              </div>

              {/* Sliders and Sensor Toggles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-orange-400" />
                      Flight Velocity
                    </span>
                    <span className="font-mono text-orange-300">Mach {mach.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="5.0"
                    max="30.0"
                    step="0.5"
                    value={mach}
                    onChange={(e) => setMach(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-orange-400" />
                      Atmospheric Altitude
                    </span>
                    <span className="font-mono text-orange-300">{altitude.toFixed(1)} km</span>
                  </div>
                  <input
                    type="range"
                    min="20.0"
                    max="100.0"
                    step="1.0"
                    value={altitude}
                    onChange={(e) => setAltitude(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                </div>

                <div>
                  <span className="text-xs font-medium text-slate-300 mb-1.5 block">
                    Interceptor Countermeasure Battery
                  </span>
                  <select
                    value={weaponType}
                    onChange={(e) => setWeaponType(e.target.value)}
                    className="w-full bg-slate-800 text-xs text-slate-200 border border-slate-700 rounded-lg p-2 font-mono"
                  >
                    <option value="DIRECTED_ENERGY_OPTICAL_LASER_EKV">Directed-Energy Optical Laser EKV (Megawatt)</option>
                    <option value="EXO_ATMOSPHERIC_KINETIC_KILL_VEHICLE">Exo-Atmospheric Kinetic Kill Vehicle (EKV)</option>
                  </select>
                </div>

                {/* Toggles */}
                <div className="flex flex-col justify-center space-y-2 text-xs text-slate-300">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={skipGlide}
                      onChange={(e) => setSkipGlide(e.target.checked)}
                      className="rounded bg-slate-800 border-slate-700 text-orange-500 focus:ring-0"
                    />
                    <Flame className="w-3.5 h-3.5 text-orange-400" />
                    Atmospheric Skip-Glide Bounce Detected
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={plasmaBlackout}
                      onChange={(e) => setPlasmaBlackout(e.target.checked)}
                      className="rounded bg-slate-800 border-slate-700 text-orange-500 focus:ring-0"
                    />
                    <Radio className="w-3.5 h-3.5 text-red-400" />
                    Plasma Sheath RF Blackout Active
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={handleTrack}
                  disabled={tracking}
                  className="flex-1 min-w-[200px] flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-sm transition-all shadow-lg shadow-orange-900/30"
                >
                  <Activity className={`w-4 h-4 ${tracking ? "animate-spin" : ""}`} />
                  <span>{tracking ? "Computing Glide Path..." : "Track Hypersonic Trajectory"}</span>
                </button>

                <button
                  onClick={handleFire}
                  disabled={firing || selectedThreat.status === "NEUTRALIZED_KINETIC_KILL"}
                  className={`flex-1 min-w-[200px] flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-white font-semibold text-sm transition-all shadow-lg ${
                    selectedThreat.status !== "NEUTRALIZED_KINETIC_KILL"
                      ? "bg-red-600 hover:bg-red-500 shadow-red-900/30 animate-pulse"
                      : "bg-slate-800 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  <Crosshair className={`w-4 h-4 ${firing ? "animate-spin" : ""}`} />
                  <span>{firing ? "Discharging Interceptor..." : "Fire Sub-2.4ms Interceptor"}</span>
                </button>
              </div>

              {/* Tracking Verdict */}
              {trackResult && (
                <div
                  className={`p-4 rounded-xl border ${
                    trackResult.threat_detected
                      ? "bg-rose-950/20 border-rose-500/40"
                      : "bg-emerald-950/20 border-emerald-500/40"
                  } space-y-2`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-white">
                      {trackResult.threat_detected ? (
                        <>
                          <ShieldAlert className="w-4 h-4 text-rose-400" />
                          Hypersonic Incursion Confirmed ({trackResult.threat_level})
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          Nominal Sub-Hypersonic Airspace
                        </>
                      )}
                    </span>
                    <span className="text-xs font-mono text-slate-300">
                      {trackResult.tracking_id}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-slate-300 pt-1">
                    <div>
                      <span className="text-slate-400">Threat Type:</span>{" "}
                      <span className="font-semibold text-orange-300">{trackResult.threat_type}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Plasma Cutoff:</span>{" "}
                      <span className="font-mono text-white">{trackResult.plasma_cutoff_freq_ghz} GHz</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Action:</span>{" "}
                      <span className="font-semibold text-white">
                        {trackResult.action_recommended}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {interceptResult && (
                <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-red-300 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-red-400" />
                      Hypersonic Hard Kinetic Intercept Confirmed — Debris Burnup Guaranteed
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {interceptResult.intercept_id}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-xs text-slate-300 pt-1">
                    <div>
                      <span className="text-slate-400">Reaction Time:</span>{" "}
                      <span className="text-red-300 font-bold font-mono">
                        {interceptResult.fire_control_latency_ms} ms
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Closing Velocity:</span>{" "}
                      <span className="text-red-300 font-bold font-mono">
                        Mach {interceptResult.relative_closing_mach}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Altitude:</span>{" "}
                      <span className="text-red-300 font-bold font-mono">
                        {interceptResult.intercept_altitude_km} km
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Kinetic Kill:</span>{" "}
                      <span className="text-emerald-300 font-bold">VERIFIED</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
              Select a hypersonic threat to calculate intercept solutions
            </div>
          )}

          {/* Activity Terminal */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 shadow-lg">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-2">
              <Terminal className="w-3.5 h-3.5 text-orange-400" />
              Hypersonic Trajectory & Early Warning Terminal
            </h4>
            <div className="space-y-1 font-mono text-xs text-slate-300 max-h-36 overflow-y-auto">
              {logs.length > 0 ? (
                logs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed">
                    {log}
                  </div>
                ))
              ) : (
                <div className="text-slate-600">No hypersonic telemetry events logged in this session.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

