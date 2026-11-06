"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Zap,
  RefreshCw,
  Terminal,
  Layers,
  Orbit,
  Crosshair,
  Flame,
  Sun,
} from "lucide-react";

interface PlasmaPlatform {
  platform_id: string;
  name: string;
  orbit_class: string;
  power_capacity_mw: number;
  plasma_density_cm3: number;
  magnetic_field_tesla: number;
  electron_temp_ev: number;
  status: string;
  threats_deflected_count: number;
}

interface WindowResult {
  window_event_id: string;
  platform_id: string;
  target_threat_id: string;
  response_latency_ms: number;
  magnetic_confinement_tesla: number;
  plasma_electron_density_cm3: number;
  threat_kinetic_energy_mj: number;
  induced_hydrodynamic_drag_g: number;
  containment_status: string;
  timestamp: number;
}

interface DeflectionResult {
  deflection_event_id: string;
  platform_id: string;
  target_threat_id: string;
  discharge_speed_ms: number;
  pulse_energy_mj: number;
  beam_cross_section_cm: number;
  recoil_delta_v_m_s: number;
  new_miss_distance_km: number;
  kinetic_kill_neutralized: boolean;
  outcome: string;
  timestamp: number;
}

export function PlasmaShieldStudio() {
  const [platforms, setPlatforms] = useState<PlasmaPlatform[]>([]);
  const [selectedPlatformId, setSelectedPlatformId] = useState<string>("");
  const [latestWindow, setLatestWindow] = useState<WindowResult | null>(null);
  const [latestDeflection, setLatestDeflection] = useState<DeflectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [engaging, setEngaging] = useState(false);
  const [firing, setFiring] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);

  const fetchPlatformsAndMetrics = async () => {
    setLoading(true);
    try {
      const [platRes, metRes] = await Promise.all([
        fetch("/api/plasma-shield/platforms"),
        fetch("/api/plasma-shield/metrics"),
      ]);
      const platData = await platRes.json();
      const metData = await metRes.json();

      if (platData.platforms) {
        setPlatforms(platData.platforms);
        if (!selectedPlatformId && platData.platforms.length > 0) {
          setSelectedPlatformId(platData.platforms[0].platform_id);
        }
      }
      if (metData.metrics) {
        setMetrics(metData.metrics);
      }
    } catch (e) {
      console.error("Failed to load spaceborne plasma shield data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlatformsAndMetrics();
  }, []);

  const handleEngageWindow = async () => {
    if (!selectedPlatformId) return;
    setEngaging(true);
    try {
      const payload = {
        platform_id: selectedPlatformId,
        target_threat_id: "HOSTILE-ASAT-KKV-OMEGA-09",
        incoming_velocity_km_s: 8.8,
        estimated_threat_mass_kg: 48.0,
      };

      const res = await fetch("/api/plasma-shield/engage-window", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.window_event) {
        setLatestWindow(data.window_event);
        fetchPlatformsAndMetrics();
      }
    } catch (e) {
      console.error("Failed to engage plasma window", e);
    } finally {
      setEngaging(false);
    }
  };

  const handleFirePulse = async () => {
    if (!selectedPlatformId) return;
    setFiring(true);
    try {
      const payload = {
        platform_id: selectedPlatformId,
        target_threat_id: "HOSTILE-ASAT-KKV-OMEGA-09",
        pulse_energy_mj: 140.0,
        beam_diameter_cm: 16.0,
      };

      const res = await fetch("/api/plasma-shield/fire-pulse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.deflection_event) {
        setLatestDeflection(data.deflection_event);
        fetchPlatformsAndMetrics();
      }
    } catch (e) {
      console.error("Failed to fire plasma deflection pulse", e);
    } finally {
      setFiring(false);
    }
  };

  const selectedPlatform = platforms.find((p) => p.platform_id === selectedPlatformId);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-xl border border-sky-800/50 bg-gradient-to-r from-slate-950 via-sky-950/20 to-slate-950 p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-sky-500/10 border border-sky-500/30 rounded-lg text-sky-400">
              <Sun className="h-8 w-8 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-wider text-slate-100 uppercase">
                  Sovereign Spaceborne Megawatt-Class Directed Energy Plasma Shield
                </h2>
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/40">
                  CAPABILITY 73
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                Orbital high-temperature superconducting (HTS) magnetic confinement dense plasma window &amp; relativistic electron beam (REB) kinetic kill deflection network.
              </p>
            </div>
          </div>
          <button
            onClick={fetchPlatformsAndMetrics}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-sm transition-all"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Scan Fleet
          </button>
        </div>

        {/* Global Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/60">
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
            <span className="text-xs text-slate-500 uppercase tracking-wider block">Shield Platforms</span>
            <span className="text-xl font-bold text-sky-400 font-mono">
              {metrics?.total_shield_platforms || platforms.length} Orbital Sentry Nodes
            </span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
            <span className="text-xs text-slate-500 uppercase tracking-wider block">Total Power Capacity</span>
            <span className="text-xl font-bold text-emerald-400 font-mono">
              {metrics?.total_megawatt_capacity || 17.5} MW
            </span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
            <span className="text-xs text-slate-500 uppercase tracking-wider block">Threats Deflected</span>
            <span className="text-xl font-bold text-cyan-400 font-mono">
              {metrics?.total_threats_deflected || 0} KKVs Vaporized
            </span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
            <span className="text-xs text-slate-500 uppercase tracking-wider block">Perimeter Grid Status</span>
            <span className="text-xs font-bold text-indigo-400 font-mono truncate block mt-1">
              {metrics?.spaceborne_perimeter_defense || "PLASMA_GRID_OPTIMAL"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Platforms Selector */}
        <div className="space-y-4 lg:col-span-1">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-lg">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2 mb-4">
              <Layers className="h-4 w-4 text-sky-400" />
              Orbital Plasma Platforms
            </h3>
            <div className="space-y-2">
              {platforms.map((p) => (
                <button
                  key={p.platform_id}
                  onClick={() => setSelectedPlatformId(p.platform_id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedPlatformId === p.platform_id
                      ? "bg-sky-950/40 border-sky-500/50 text-white shadow-md"
                      : "bg-slate-900/50 border-slate-800/80 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-sm text-slate-200 truncate">{p.name}</span>
                    <span className="text-xs font-mono text-sky-400">{p.power_capacity_mw} MW</span>
                  </div>
                  <div className="flex justify-between items-center mt-2 text-xs text-slate-400">
                    <span className="truncate max-w-[140px]">{p.orbit_class.split("(")[0]}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-mono">
                      {p.magnetic_field_tesla} Tesla
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selectedPlatform && (
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-lg space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Orbit className="h-3.5 w-3.5 text-sky-400" />
                Magnetohydrodynamic Parameters
              </h4>
              <div className="text-xs space-y-1.5 font-mono text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Platform ID:</span>
                  <span className="text-sky-400">{selectedPlatform.platform_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Plasma Density:</span>
                  <span className="text-cyan-400">{selectedPlatform.plasma_density_cm3.toExponential(1)} cm⁻³</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Electron Temp:</span>
                  <span className="text-amber-400">{selectedPlatform.electron_temp_ev} eV</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Confinement State:</span>
                  <span className="text-emerald-400">{selectedPlatform.status}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Center & Right Column: Shield Controls */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Flame className="h-4 w-4 text-sky-400" />
              Plasma Window Standoff &amp; Relativistic Beam Deflection Controls
            </h3>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="text-xs text-slate-300 font-mono">
                <span className="text-slate-500 block">Target Threat Tracking:</span>
                <span className="text-rose-400 font-bold">ASAT KKV (8.8 km/s, 48 kg kinetic mass)</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handleEngageWindow}
                  disabled={engaging}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-sm font-medium transition-all shadow-md shadow-sky-600/20 disabled:opacity-50"
                >
                  <Sun className={`h-4 w-4 ${engaging ? "animate-spin" : ""}`} />
                  {engaging ? "Igniting..." : "Engage Plasma Window"}
                </button>
                <button
                  onClick={handleFirePulse}
                  disabled={firing}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-sm font-medium transition-all shadow-md shadow-rose-600/20 disabled:opacity-50"
                >
                  <Zap className={`h-4 w-4 ${firing ? "animate-pulse" : ""}`} />
                  {firing ? "Discharging..." : "Fire 140MJ Beam Pulse"}
                </button>
              </div>
            </div>

            {/* Window Result */}
            {latestWindow && (
              <div className="p-4 rounded-lg border border-sky-900/40 bg-sky-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-sky-300 uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    Magnetic Confinement Dense Plasma Window Engaged
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-bold font-mono bg-sky-500/20 text-sky-300 border border-sky-500/40">
                    {latestWindow.response_latency_ms} ms Latency
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800">
                    <span className="text-slate-500 block">Dissipated Kinetic Energy:</span>
                    <span className="text-amber-400 font-bold">{latestWindow.threat_kinetic_energy_mj} MJ</span>
                  </div>
                  <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800">
                    <span className="text-slate-500 block">Hydrodynamic Drag:</span>
                    <span className="text-cyan-400 font-bold">{latestWindow.induced_hydrodynamic_drag_g} G</span>
                  </div>
                  <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800">
                    <span className="text-slate-500 block">Confinement Field:</span>
                    <span className="text-indigo-400 font-bold">{latestWindow.magnetic_confinement_tesla} Tesla</span>
                  </div>
                  <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800">
                    <span className="text-slate-500 block">Containment Status:</span>
                    <span className="text-emerald-400 font-bold truncate block">{latestWindow.containment_status}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Deflection Result */}
            {latestDeflection && (
              <div className="p-4 rounded-lg border border-emerald-900/40 bg-emerald-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                    <Zap className="h-4 w-4 text-emerald-400" />
                    Relativistic Electron Beam Ablation Recoil Successful
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    {latestDeflection.discharge_speed_ms} ms Discharge
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800">
                    <span className="text-slate-500 block">Recoil Impulse &Delta;v:</span>
                    <span className="text-emerald-400 font-bold">+{latestDeflection.recoil_delta_v_m_s} m/s</span>
                  </div>
                  <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800">
                    <span className="text-slate-500 block">New Miss Distance:</span>
                    <span className="text-cyan-400 font-bold">{latestDeflection.new_miss_distance_km} km</span>
                  </div>
                  <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800">
                    <span className="text-slate-500 block">Deflection Outcome:</span>
                    <span className="text-slate-200 truncate">{latestDeflection.outcome}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Real-time Plasma Telemetry Stream */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-lg">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2 mb-3">
              <Terminal className="h-4 w-4 text-sky-400" />
              Orbital Plasma Telemetry Stream
            </h3>
            <div className="p-3 bg-slate-900/80 rounded border border-slate-800 text-xs font-mono text-slate-300 space-y-1.5 h-36 overflow-y-auto">
              <p className="text-sky-400">[0.00ms] Aegis-Orbital: High-temperature superconducting magnet coils locked at 8.5 Tesla.</p>
              <p className="text-emerald-400">[1.85ms] Argon gas injection ionized by RF helicon antenna establishing 1.4x10^15 cm^-3 plasma window.</p>
              <p className="text-slate-400">[4.20ms] Relativistic electron beam capacitor banks charged to 140 MJ standby.</p>
              {latestDeflection && (
                <p className="text-emerald-300 font-bold">
                  [{latestDeflection.deflection_event_id}] Beam discharge! KKV trajectory deflected: Miss={latestDeflection.new_miss_distance_km} km.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

