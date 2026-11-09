"use client";

import React, { useState, useEffect } from "react";
import {
  Wind,
  Radio,
  Zap,
  Activity,
  Terminal,
  RefreshCw,
  Shield,
  Sparkles,
  Database,
  Flame,
  CheckCircle,
  VolumeX,
} from "lucide-react";

interface MHDAeroPlatformNode {
  platform_id: string;
  callsign: string;
  mach_number: number;
  altitude_km: number;
  magnetic_field_tesla: number;
  plasma_density_cm3: number;
  rf_rcs_attenuation_db: number;
  lorentz_bow_shock_damping_pct: number;
  drag_reduction_pct: number;
  status: string;
}

interface MHDStealthEngagementResult {
  engagement_id: string;
  platform_id: string;
  mach_number: number;
  magnetic_field_tesla: number;
  plasma_density_cm3: number;
  rf_rcs_attenuation_db: number;
  lorentz_bow_shock_damping_pct: number;
  drag_reduction_pct: number;
  sonic_boom_ground_footprint_db: number;
  radar_cross_section_m2: number;
  status: string;
  timestamp: string;
}

export function MHDPlasmaStealthStudio() {
  const [platforms, setPlatforms] = useState<MHDAeroPlatformNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [engaging, setEngaging] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState("MHD-AERO-01");
  const [fieldBoost, setFieldBoost] = useState(0.5);
  const [plasmaFreq, setPlasmaFreq] = useState(24.5);
  const [lastEngagement, setLastEngagement] = useState<MHDStealthEngagementResult | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const fetchPlatforms = async () => {
    try {
      const res = await fetch("/api/mhd-plasma-stealth/platforms");
      if (res.ok) {
        const data = await res.json();
        setPlatforms(data);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlatforms();
    setLogs([
      "[" + new Date().toLocaleTimeString() + "] Sovereign Sub-Atmospheric MHD Aerodynamic Plasma Stealth & Wave-Rider Shield initialized.",
      "[" + new Date().toLocaleTimeString() + "] High-Mach (Mach 6-24) boundary-layer seed ionization grid online.",
      "[" + new Date().toLocaleTimeString() + "] Superconducting Halbach array Lorentz j x B magnetic coils calibrated (2.5-4.0 Tesla).",
    ]);
  }, []);

  const handleEngageStealth = async () => {
    setEngaging(true);
    setLogs((prev) => [
      "[" + new Date().toLocaleTimeString() + "] Energizing superconducting Halbach magnets & microwave ionization on " + selectedPlatform + "...",
      ...prev,
    ]);
    try {
      const res = await fetch("/api/mhd-plasma-stealth/engage-stealth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform_id: selectedPlatform,
          field_boost_tesla: fieldBoost,
          plasma_freq_ghz: plasmaFreq,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setLastEngagement(data);
        setLogs((prev) => [
          "[" + new Date().toLocaleTimeString() + "] SUCCESS: Full MHD Plasma Stealth Engaged. Radar RCS Attenuation: " + data.rf_rcs_attenuation_db.toFixed(1) + " dB (Radar Blackout).",
          "[" + new Date().toLocaleTimeString() + "] Lorentz Bow-Shock Damped: " + data.lorentz_bow_shock_damping_pct.toFixed(2) + "% | Ground Sonic Boom: " + data.sonic_boom_ground_footprint_db.toFixed(1) + " dB | Drag Cut: " + data.drag_reduction_pct.toFixed(1) + "%",
          ...prev,
        ]);
      }
    } catch {
      setLogs((prev) => [
        "[" + new Date().toLocaleTimeString() + "] ERROR: Plasma stealth engagement failed.",
        ...prev,
      ]);
    } finally {
      setEngaging(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-blue-950/40 via-indigo-900/30 to-sky-950/40 border border-blue-500/30 rounded-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/20 border border-blue-500/40 rounded-lg text-blue-400">
            <Wind className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
              Sovereign Sub-Atmospheric MHD Aerodynamic Plasma Stealth Shield
              <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 border border-blue-500/40 text-blue-300 font-mono">
                Option B
              </span>
            </h1>
            <p className="text-sm text-blue-200/70 mt-1">
              Mach 6-24 boundary plasma sheath with 2.5-4.0 T Halbach arrays: &gt;45 dB RF RCS attenuation and Lorentz j x B bow-shock damping
            </p>
          </div>
        </div>
        <button
          onClick={fetchPlatforms}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg text-sm text-blue-300 transition-colors self-start md:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Platforms
        </button>
      </div>

      {/* Telemetry Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900/60 border border-blue-500/20 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Broadband Radar RCS Attenuation</span>
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-300">
            {lastEngagement ? lastEngagement.rf_rcs_attenuation_db.toFixed(1) : "52.4"}
            <span className="text-xs text-slate-400 ml-1">dB</span>
          </div>
          <div className="text-xs text-emerald-400 mt-2 font-mono">&gt;45 dB Complete Blackout</div>
        </div>

        <div className="p-4 bg-slate-900/60 border border-blue-500/20 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Bow-Shock Lorentz Damping</span>
            <Zap className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-sky-300">
            {lastEngagement ? lastEngagement.lorentz_bow_shock_damping_pct.toFixed(2) : "99.85"}%
          </div>
          <div className="text-xs text-sky-400 mt-2 font-mono">j x B Wave-Rider Clamping</div>
        </div>

        <div className="p-4 bg-slate-900/60 border border-blue-500/20 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Ground Sonic Boom Signature</span>
            <VolumeX className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-300">
            {lastEngagement ? lastEngagement.sonic_boom_ground_footprint_db.toFixed(1) : "6.8"}
            <span className="text-xs text-slate-400 ml-1">dB</span>
          </div>
          <div className="text-xs text-cyan-400 mt-2 font-mono">Zero Ground Boom Footprint</div>
        </div>

        <div className="p-4 bg-slate-900/60 border border-blue-500/20 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Aero-Thermal Drag Reduction</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-300">
            {lastEngagement ? lastEngagement.drag_reduction_pct.toFixed(1) : "71.4"}%
          </div>
          <div className="text-xs text-amber-400 mt-2 font-mono">&gt;65% Boundary Friction Cut</div>
        </div>
      </div>

      {/* Main Grid: Control Panel + Hypersonic Aero Platforms */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="p-6 bg-slate-900/60 border border-blue-500/20 rounded-xl space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Radio className="w-5 h-5 text-blue-400" />
            MHD Stealth Activation Controls
          </h2>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Target Aero-Platform</label>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              {platforms.map((p) => (
                <option key={p.platform_id} value={p.platform_id}>
                  {p.platform_id} (Mach {p.mach_number})
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Halbach Magnetic Field Boost</span>
              <span className="text-blue-400 font-mono">+{fieldBoost.toFixed(2)} T</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.5"
              step="0.05"
              value={fieldBoost}
              onChange={(e) => setFieldBoost(parseFloat(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Excitation Plasma Frequency</span>
              <span className="text-blue-400 font-mono">{plasmaFreq.toFixed(1)} GHz</span>
            </div>
            <input
              type="range"
              min="10.0"
              max="50.0"
              step="0.5"
              value={plasmaFreq}
              onChange={(e) => setPlasmaFreq(parseFloat(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          <button
            onClick={handleEngageStealth}
            disabled={engaging}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-medium rounded-lg text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30"
          >
            {engaging ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Igniting Plasma Sheath &amp; Halbach Array...
              </>
            ) : (
              <>
                <Wind className="w-4 h-4" />
                Engage Full MHD Plasma Stealth
              </>
            )}
          </button>
        </div>

        {/* Hypersonic Platforms Table */}
        <div className="lg:col-span-2 p-6 bg-slate-900/60 border border-blue-500/20 rounded-xl space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-400" />
            Active Hypersonic Wave-Rider Fleet
          </h2>
          {loading ? (
            <div className="text-slate-400 text-sm">Loading aero platforms...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-2">Platform ID</th>
                    <th className="pb-2">Callsign</th>
                    <th className="pb-2">Mach</th>
                    <th className="pb-2">Altitude</th>
                    <th className="pb-2">B-Field</th>
                    <th className="pb-2">RCS Attenuation</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {platforms.map((p) => (
                    <tr key={p.platform_id} className="hover:bg-slate-800/40">
                      <td className="py-2.5 font-mono text-blue-400">{p.platform_id}</td>
                      <td className="py-2.5">{p.callsign.split("(")[0]}</td>
                      <td className="py-2.5 font-mono text-amber-400">Mach {p.mach_number}</td>
                      <td className="py-2.5 font-mono">{p.altitude_km.toFixed(1)} km</td>
                      <td className="py-2.5 font-mono text-sky-400">{p.magnetic_field_tesla.toFixed(1)} T</td>
                      <td className="py-2.5 font-mono text-emerald-400">{p.rf_rcs_attenuation_db.toFixed(1)} dB</td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-300 border border-blue-500/30">
                          {p.status}
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
        <div className="flex items-center gap-2 text-blue-400 mb-2">
          <Terminal className="w-4 h-4" />
          <span>MHD Boundary Layer Plasma &amp; Lorentz Telemetry Stream</span>
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

