"use client";

import React, { useState, useEffect } from "react";
import {
  Flame,
  ShieldAlert,
  ShieldCheck,
  Zap,
  RefreshCw,
  Terminal,
  Activity,
  Layers,
  Search,
  Compass,
  AlertTriangle,
} from "lucide-react";

interface GeoneutrinoObs {
  obs_id: string;
  observatory_name: string;
  latitude: number;
  longitude: number;
  overburden_mwe: number;
  scintillator_mass_ktons: number;
  threshold_energy_mev: number;
  annual_geoneutrino_events: number;
  status: string;
}

interface ThermalPlume {
  plume_id: string;
  classification: string;
  core_origin_depth_km: number;
  magma_ascent_velocity_cm_yr: number;
  convective_heat_anomaly_mw_m2: number;
  estimated_caldera_overpressure_mpa: number;
  risk_tier: string;
}

interface MantleInversion {
  inversion_id: string;
  observatories_participating: string[];
  target_geological_region: string;
  depth_layer_km: number;
  uranium_flux_tnu: number;
  thorium_flux_tnu: number;
  u_th_ratio: number;
  mantle_heat_flux_tw: number;
  detected_thermal_plumes: ThermalPlume[];
  magma_overpressure_status: string;
  days_to_potential_breach: number | null;
  early_warning_confidence_pct: number;
  timestamp: string;
}

export function MantleGeoneutrinoStudio() {
  const [observatories, setObservatories] = useState<GeoneutrinoObs[]>([]);
  const [loading, setLoading] = useState(true);
  const [inverting, setInverting] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState("YELLOWSTONE_CALDERA_SUPERPLUME");
  const [depthTarget, setDepthTarget] = useState(2890.0);
  const [lastInversion, setLastInversion] = useState<MantleInversion | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const fetchObservatories = async () => {
    try {
      const res = await fetch("/api/mantle-geoneutrino/observatories");
      if (res.ok) {
        const data = await res.json();
        setObservatories(data);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchObservatories();
  }, []);

  const handleReconstructMantle = async () => {
    setInverting(true);
    setLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] Measuring inverse beta decay geoneutrino flux (&nu;&#772;ₑ + p &rarr; e⁺ + n) across JUNO, KamLAND & Borexino (Region: ${selectedRegion}, Depth: ${depthTarget}km)...`,
      ...prev,
    ]);

    try {
      const res = await fetch("/api/mantle-geoneutrino/reconstruct-tomography", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          region_label: selectedRegion,
          depth_target_km: depthTarget,
          observation_days: 60.0,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setLastInversion(data);
        const warn = data.days_to_potential_breach
          ? `Breach Warning: ${data.days_to_potential_breach} days lead time`
          : "Mantle stable";
        setLogs((prev) => [
          `[${new Date().toLocaleTimeString()}] 3D Mantle Inversion complete: U/Th Ratio ${data.u_th_ratio} | Heat Flux ${data.mantle_heat_flux_tw} TW | ${warn} (Confidence: ${data.early_warning_confidence_pct}%)`,
          ...prev,
        ]);
      }
    } catch {
      setLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] Inversion error: Liquid scintillator signal loss`,
        ...prev,
      ]);
    } finally {
      setInverting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl border border-orange-500/20 bg-gradient-to-r from-orange-950/40 via-red-900/20 to-neutral-900/40 p-6 backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-orange-500/10 px-2 py-0.5 text-xs font-semibold text-orange-400 border border-orange-500/30">
                Capability 79
              </span>
              <span className="text-xs text-neutral-400">Wave 19 Deep Earth Physics</span>
            </div>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Flame className="h-6 w-6 text-orange-400" />
              Deep Mantle Geoneutrino Earth-Core Tomography &amp; Magma Plume Breach Predictor
            </h2>
            <p className="mt-1 text-sm text-neutral-300">
              Subatomic detection of radiogenic antineutrinos (&nu;&#772;ₑ) from U-238/Th-232 decays via inverse beta decay. Reconstructs thermal convective superplumes across the Core-Mantle Boundary (D&apos;&apos; layer at 2,890 km depth) with &gt; 30-day early warnings.
            </p>
          </div>
          <button
            onClick={fetchObservatories}
            className="flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-800/80 px-4 py-2 text-sm font-medium text-neutral-200 transition hover:bg-neutral-700"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Sync Observatories
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
          <div className="flex items-center gap-2 text-neutral-400 text-xs">
            <Layers className="h-4 w-4 text-orange-400" />
            Core-Mantle Boundary Depth
          </div>
          <div className="mt-2 text-2xl font-bold text-white">2,890 km</div>
          <div className="mt-1 text-xs text-orange-400">D&apos;&apos; Layer Thermal Boundary</div>
        </div>

        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
          <div className="flex items-center gap-2 text-neutral-400 text-xs">
            <Activity className="h-4 w-4 text-amber-400" />
            Radiogenic Heat Flux
          </div>
          <div className="mt-2 text-2xl font-bold text-white">21.8 TW</div>
          <div className="mt-1 text-xs text-amber-400">U-238 / Th-232 Beta Decay</div>
        </div>

        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
          <div className="flex items-center gap-2 text-neutral-400 text-xs">
            <ShieldAlert className="h-4 w-4 text-rose-400" />
            Plume Breach Early Warning
          </div>
          <div className="mt-2 text-2xl font-bold text-white">&gt; 30 Days</div>
          <div className="mt-1 text-xs text-rose-400">Predictive Lead Time Margin</div>
        </div>

        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
          <div className="flex items-center gap-2 text-neutral-400 text-xs">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Scintillator Target Mass
          </div>
          <div className="mt-2 text-2xl font-bold text-white">21.3 ktons</div>
          <div className="mt-1 text-xs text-emerald-400">JUNO + KamLAND + Borexino</div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Observatories & Reconstruction Form */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Search className="h-4 w-4 text-orange-400" />
                Active Ultra-Pure Liquid Scintillator Observatories
              </h3>
              <span className="text-xs text-neutral-400">{observatories.length} Observatories</span>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              {observatories.map((obs) => (
                <div
                  key={obs.obs_id}
                  className="rounded-lg border border-neutral-800 bg-neutral-950/60 p-3.5 hover:border-orange-500/40 transition"
                >
                  <div className="font-semibold text-white text-xs">{obs.obs_id}</div>
                  <div className="text-[11px] text-orange-400 font-mono mt-0.5">{obs.observatory_name}</div>
                  <div className="mt-3 space-y-1 text-[11px] text-neutral-400">
                    <div>Mass: <span className="text-white font-bold">{obs.scintillator_mass_ktons} kton</span></div>
                    <div>Shielding: <span className="text-neutral-200">{obs.overburden_mwe} m.w.e.</span></div>
                    <div>Rate: <span className="text-neutral-200">{obs.annual_geoneutrino_events} / yr</span></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Reconstruction Form */}
            <div className="mt-6 rounded-lg border border-orange-500/20 bg-orange-950/20 p-4">
              <h4 className="text-xs font-semibold text-orange-300 uppercase tracking-wider">
                Initiate Core-Mantle Boundary 3D Geoneutrino Tomography
              </h4>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-neutral-400">Target Geological Region</label>
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="mt-1 w-full rounded border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs text-white"
                  >
                    <option value="YELLOWSTONE_CALDERA_SUPERPLUME">Yellowstone Caldera Deep Mantle Plume</option>
                    <option value="PACIFIC_LLSV_ANOMALY">Pacific Large Low-Shear Velocity Province (LLSVP)</option>
                    <option value="AFRICAN_SUPERPLUME_ROOT">African Superplume Core-Mantle Boundary</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-neutral-400">Depth Target: {depthTarget} km</label>
                  <input
                    type="range"
                    min="500"
                    max="2890"
                    step="50"
                    value={depthTarget}
                    onChange={(e) => setDepthTarget(parseFloat(e.target.value))}
                    className="mt-1 w-full accent-orange-500"
                  />
                </div>
              </div>

              <button
                onClick={handleReconstructMantle}
                disabled={inverting}
                className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-medium text-xs py-2.5 transition disabled:opacity-50"
              >
                <Zap className="h-4 w-4" />
                {inverting ? "Correlating Inverse Beta Decay Signals..." : "Reconstruct Core-Mantle Geoneutrino Tomography"}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Inversion Telemetry */}
        <div className="space-y-4">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-neutral-800 pb-3">
              <Compass className="h-4 w-4 text-orange-400" />
              Mantle Convection &amp; Plume Telemetry
            </h3>

            {lastInversion ? (
              <div className="mt-4 space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Inversion ID:</span>
                  <span className="font-mono text-orange-400">{lastInversion.inversion_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Target Region:</span>
                  <span className="text-white font-semibold">{lastInversion.target_geological_region}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Depth Layer:</span>
                  <span className="text-white font-bold">{lastInversion.depth_layer_km} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">U / Th Flux:</span>
                  <span className="text-white font-mono">{lastInversion.uranium_flux_tnu} / {lastInversion.thorium_flux_tnu} TNU</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Radiogenic Heat:</span>
                  <span className="text-amber-400 font-bold">{lastInversion.mantle_heat_flux_tw} TW</span>
                </div>
                {lastInversion.days_to_potential_breach && (
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Predictive Breach Margin:</span>
                    <span className="text-rose-400 font-bold">{lastInversion.days_to_potential_breach} Days Lead Time</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-neutral-400">Confidence:</span>
                  <span className="text-emerald-400 font-bold">{lastInversion.early_warning_confidence_pct}%</span>
                </div>

                <div className="mt-3 pt-3 border-t border-neutral-800 space-y-2">
                  <div className="text-[11px] font-semibold text-neutral-300">Detected Thermal Plumes:</div>
                  {lastInversion.detected_thermal_plumes.map((plume) => (
                    <div
                      key={plume.plume_id}
                      className="rounded border border-neutral-800 bg-neutral-950/80 p-2.5 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-orange-400 font-semibold">{plume.plume_id}</span>
                        <span className="text-[10px] text-amber-400 font-semibold">{plume.risk_tier}</span>
                      </div>
                      <div className="text-white font-medium">{plume.classification}</div>
                      <div className="flex justify-between text-[11px] text-neutral-400">
                        <span>Ascent: {plume.magma_ascent_velocity_cm_yr} cm/yr</span>
                        <span>Overpressure: {plume.estimated_caldera_overpressure_mpa} MPa</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-6 text-center text-xs text-neutral-500 py-6">
                Click &quot;Reconstruct Core-Mantle Geoneutrino Tomography&quot; to inspect mantle plumes.
              </div>
            )}
          </div>

          {/* Console Log */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400 border-b border-neutral-800/80 pb-2">
              <Terminal className="h-3.5 w-3.5 text-orange-400" />
              Scintillator Geoneutrino Stream
            </div>
            <div className="mt-3 h-44 overflow-y-auto space-y-1.5 font-mono text-[11px] text-neutral-400">
              {logs.length > 0 ? (
                logs.map((log, i) => <div key={i}>{log}</div>)
              ) : (
                <div className="text-neutral-600">JUNO and KamLAND arrays collecting coincidence events...</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

