"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Crosshair,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Activity,
  RefreshCw,
  AlertTriangle,
  Sliders,
  CheckCircle2,
  Radio,
  Eye,
  Target,
  Flame,
  Terminal,
} from "lucide-react";

interface DefenseSite {
  site_id: string;
  name: string;
  location: string;
  defense_system: string;
  radar_type: string;
  optical_sensors: string;
  coverage_radius_km: number;
  status: string;
  swarms_neutralized: number;
  rf_jamming_active: boolean;
}

interface SwarmDetection {
  detection_id: string;
  site_id: string;
  threat_detected: boolean;
  threat_type: string;
  threat_level: string;
  swarm_units_tracked: number;
  radar_rcs_m2: number;
  approach_velocity_mps: number;
  optical_target_locked: boolean;
  rf_control_link_anomaly: boolean;
  recommended_countermeasure: string;
  time_to_impact_sec: number;
}

interface InterceptionResult {
  intercept_id: string;
  site_id: string;
  countermeasure_type: string;
  burst_duration_ms: number;
  pulse_power_megawatts: number;
  swarm_kill_ratio_pct: number;
  electronic_avionic_kill_confirmed: boolean;
  new_site_status: string;
}

export function KineticDroneShieldStudio() {
  const [sites, setSites] = useState<DefenseSite[]>([]);
  const [selectedSite, setSelectedSite] = useState<DefenseSite | null>(null);
  const [loading, setLoading] = useState(false);
  const [swarmSize, setSwarmSize] = useState<number>(6);
  const [radarRcs, setRadarRcs] = useState<number>(0.05);
  const [velocity, setVelocity] = useState<number>(65.0);
  const [opticalLocked, setOpticalLocked] = useState<boolean>(true);
  const [rfAnomaly, setRfAnomaly] = useState<boolean>(true);
  const [weaponType, setWeaponType] = useState<string>("HIGH_POWER_MICROWAVE_HPM");
  const [detecting, setDetecting] = useState(false);
  const [firing, setFiring] = useState(false);
  const [detection, setDetection] = useState<SwarmDetection | null>(null);
  const [interception, setInterception] = useState<InterceptionResult | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const fetchSites = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/drone-swarm-shield/sites");
      const data = await res.json();
      if (data.sites) {
        setSites(data.sites);
        if (data.sites.length > 0) {
          setSelectedSite((prev) => prev || data.sites[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch defense sites", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSites();
  }, [fetchSites]);

  async function handleDetect() {
    if (!selectedSite) return;
    setDetecting(true);
    setDetection(null);
    try {
      const res = await fetch("/api/drone-swarm-shield/detect-swarm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          site_id: selectedSite.site_id,
          radar_rcs_m2: radarRcs,
          swarm_size: swarmSize,
          optical_confirmed: opticalLocked,
          rf_spectrum_anomaly: rfAnomaly,
          approach_velocity_mps: velocity,
        }),
      });
      const data = await res.json();
      if (data.detection) {
        setDetection(data.detection);
        if (data.detection.threat_detected) {
          setSites((prev) =>
            prev.map((s) =>
              s.site_id === selectedSite.site_id
                ? { ...s, status: "HOSTILE_SWARM_INBOUND" }
                : s
            )
          );
        }
        setLogs((prev) => [
          `[${new Date().toLocaleTimeString()}] SWARM TRACK: ${selectedSite.site_id} -> ${data.detection.threat_type} (${data.detection.swarm_units_tracked} drones @ ${data.detection.approach_velocity_mps} m/s, TTI: ${data.detection.time_to_impact_sec}s)`,
          ...prev.slice(0, 15),
        ]);
      }
    } catch (err) {
      console.error("Detection failed", err);
    } finally {
      setDetecting(false);
    }
  }

  async function handleFire() {
    if (!selectedSite) return;
    setFiring(true);
    try {
      const res = await fetch("/api/drone-swarm-shield/fire-directed-energy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          site_id: selectedSite.site_id,
          weapon_type: weaponType,
          burst_duration_ms: 3.8,
        }),
      });
      const data = await res.json();
      if (data.interception) {
        setInterception(data.interception);
        setSites((prev) =>
          prev.map((s) =>
            s.site_id === selectedSite.site_id
              ? {
                  ...s,
                  status: "AIRSPACE_SECURED",
                  swarms_neutralized: s.swarms_neutralized + 1,
                }
              : s
          )
        );
        setSelectedSite((prev) =>
          prev ? { ...prev, status: "AIRSPACE_SECURED" } : null
        );
        setLogs((prev) => [
          `[${new Date().toLocaleTimeString()}] DIRECTED-ENERGY BURST: Fired ${data.interception.pulse_power_megawatts} MW ${data.interception.countermeasure_type} -> 100% Swarm Kill Confirmed in ${data.interception.burst_duration_ms}ms`,
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
      <div className="flex flex-col md:flex-row md:items-center justify-between p-6 rounded-2xl bg-gradient-to-r from-red-950/40 via-amber-900/20 to-slate-900/50 border border-red-500/30 backdrop-blur-md shadow-2xl">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-red-400">
            <Crosshair className="w-8 h-8 animate-pulse text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
              Autonomous Kinetic Drone Swarm RF/Optical Directed-Energy Shield
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 font-mono">
                CAP-58 • v4.5.0
              </span>
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              Sub-5ms High-Power Microwave (HPM) Pulses & Optical Laser Neutralization Against Hostile FPV/Loitering Swarms
            </p>
          </div>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <button
            onClick={fetchSites}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-medium transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Airspace</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-lg">
          <span className="text-xs font-medium text-slate-400">Protected Sites</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{sites.length}</span>
            <span className="text-xs text-slate-400">Sovereign Enclaves</span>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-lg">
          <span className="text-xs font-medium text-red-400">Swarms Neutralized</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-red-300">
              {sites.reduce((acc, s) => acc + s.swarms_neutralized, 0)}
            </span>
            <span className="text-xs text-red-400/80">Confirmed Kills</span>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-lg">
          <span className="text-xs font-medium text-amber-400">Reaction Latency</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-300">3.8 ms</span>
            <span className="text-xs text-amber-400/80">Sub-5ms Intercept</span>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-lg">
          <span className="text-xs font-medium text-emerald-400">Avionic Kill Ratio</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-300">100.0%</span>
            <span className="text-xs text-emerald-400/80">Zero Collateral</span>
          </div>
        </div>
      </div>

      {/* Main Studio Interactive Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Protected Airspace Sites */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <Target className="w-4 h-4 text-red-400" />
            Monitored Defense Sites
          </h3>
          <div className="space-y-3">
            {sites.map((site) => {
              const isSelected = selectedSite?.site_id === site.site_id;
              const isSecured = site.status === "AIRSPACE_SECURED";

              return (
                <div
                  key={site.site_id}
                  onClick={() => {
                    setSelectedSite(site);
                    setDetection(null);
                    setInterception(null);
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-red-950/30 border-red-500/60 shadow-lg shadow-red-950/40"
                      : "bg-slate-900/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{site.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{site.location}</p>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        isSecured
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-red-500/10 text-red-400 border-red-500/30"
                      }`}
                    >
                      {site.status}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                    <span>Radius: {site.coverage_radius_km} km</span>
                    <span>System: {site.defense_system.slice(0, 10)}</span>
                    <span className="font-mono text-red-300">
                      Kills: {site.swarms_neutralized}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Controls and Sensor Tracking */}
        <div className="lg:col-span-2 space-y-6">
          {selectedSite ? (
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    {selectedSite.name}
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {selectedSite.site_id}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Radar: {selectedSite.radar_type} • Optics: {selectedSite.optical_sensors}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Defense System</span>
                  <span className="text-xs font-bold text-red-400 font-mono">
                    {selectedSite.defense_system}
                  </span>
                </div>
              </div>

              {/* Sliders and Sensor Toggles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-red-400" />
                      Swarm Formation Size
                    </span>
                    <span className="font-mono text-red-300">{swarmSize} Units</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="24"
                    step="1"
                    value={swarmSize}
                    onChange={(e) => setSwarmSize(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-red-400" />
                      Approach Velocity
                    </span>
                    <span className="font-mono text-red-300">{velocity} m/s</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="120"
                    step="5"
                    value={velocity}
                    onChange={(e) => setVelocity(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-red-400" />
                      Radar Cross Section (RCS)
                    </span>
                    <span className="font-mono text-red-300">{radarRcs.toFixed(3)} m²</span>
                  </div>
                  <input
                    type="range"
                    min="0.005"
                    max="0.200"
                    step="0.005"
                    value={radarRcs}
                    onChange={(e) => setRadarRcs(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500"
                  />
                </div>

                <div>
                  <span className="text-xs font-medium text-slate-300 mb-1.5 block">
                    Directed-Energy Weapon Battery
                  </span>
                  <select
                    value={weaponType}
                    onChange={(e) => setWeaponType(e.target.value)}
                    className="w-full bg-slate-800 text-xs text-slate-200 border border-slate-700 rounded-lg p-2 font-mono"
                  >
                    <option value="HIGH_POWER_MICROWAVE_HPM">High-Power Microwave (HPM 250MW)</option>
                    <option value="MULTI_BEAM_DIRECTED_ENERGY_LASER">Directed-Energy Optical Laser (50MW)</option>
                  </select>
                </div>
              </div>

              {/* Sensor Lock Toggles */}
              <div className="flex items-center gap-6 pt-1 text-xs text-slate-300">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={opticalLocked}
                    onChange={(e) => setOpticalLocked(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-red-500 focus:ring-0"
                  />
                  <Eye className="w-3.5 h-3.5 text-red-400" />
                  Thermal EO/IR Target Lock
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rfAnomaly}
                    onChange={(e) => setRfAnomaly(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-red-500 focus:ring-0"
                  />
                  <Radio className="w-3.5 h-3.5 text-amber-400" />
                  Hostile RF Control Link Anomaly
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={handleDetect}
                  disabled={detecting}
                  className="flex-1 min-w-[200px] flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-sm transition-all shadow-lg shadow-red-900/30"
                >
                  <Activity className={`w-4 h-4 ${detecting ? "animate-spin" : ""}`} />
                  <span>{detecting ? "Tracking Swarm Vectors..." : "Track Swarm Vectors"}</span>
                </button>

                <button
                  onClick={handleFire}
                  disabled={firing || selectedSite.status !== "HOSTILE_SWARM_INBOUND"}
                  className={`flex-1 min-w-[200px] flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-white font-semibold text-sm transition-all shadow-lg ${
                    selectedSite.status === "HOSTILE_SWARM_INBOUND"
                      ? "bg-amber-600 hover:bg-amber-500 shadow-amber-900/30 animate-pulse"
                      : "bg-slate-800 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  <Flame className={`w-4 h-4 ${firing ? "animate-spin" : ""}`} />
                  <span>{firing ? "Discharging Pulse..." : "Fire Directed-Energy Pulse"}</span>
                </button>
              </div>

              {/* Verdicts */}
              {detection && (
                <div
                  className={`p-4 rounded-xl border ${
                    detection.threat_detected
                      ? "bg-red-950/20 border-red-500/40"
                      : "bg-emerald-950/20 border-emerald-500/40"
                  } space-y-2`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-white">
                      {detection.threat_detected ? (
                        <>
                          <ShieldAlert className="w-4 h-4 text-red-400" />
                          Hostile Swarm Vector Locked ({detection.threat_level})
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          Airspace Clear — Nominal
                        </>
                      )}
                    </span>
                    <span className="text-xs font-mono text-slate-300">{detection.detection_id}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-slate-300 pt-1">
                    <div>
                      <span className="text-slate-400">Threat:</span>{" "}
                      <span className="font-semibold text-red-300">{detection.threat_type}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Countermeasure:</span>{" "}
                      <span className="font-semibold text-white">
                        {detection.recommended_countermeasure}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Time to Impact:</span>{" "}
                      <span className="font-bold text-amber-300 font-mono">
                        {detection.time_to_impact_sec} s
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {interception && (
                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-400" />
                      Directed-Energy Pulse Discharged — Hard Electronic Kill
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {interception.intercept_id}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-slate-300 pt-1">
                    <div>
                      <span className="text-slate-400">Power:</span>{" "}
                      <span className="text-amber-300 font-bold">
                        {interception.pulse_power_megawatts} MW
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Burst Duration:</span>{" "}
                      <span className="text-amber-300 font-bold">
                        {interception.burst_duration_ms} ms
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Kill Ratio:</span>{" "}
                      <span className="text-emerald-300 font-bold">
                        {interception.swarm_kill_ratio_pct}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
              Select an airspace site to track
            </div>
          )}

          {/* Activity Terminal */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 shadow-lg">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-2">
              <Terminal className="w-3.5 h-3.5 text-red-400" />
              Air-Defense Tactical Command Log
            </h4>
            <div className="space-y-1 font-mono text-xs text-slate-300 max-h-36 overflow-y-auto">
              {logs.length > 0 ? (
                logs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed">
                    {log}
                  </div>
                ))
              ) : (
                <div className="text-slate-600">No air-defense engagements logged.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

