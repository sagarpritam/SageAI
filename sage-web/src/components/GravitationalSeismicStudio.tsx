"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Activity,
  ShieldCheck,
  ShieldAlert,
  Zap,
  RefreshCw,
  Terminal,
  Layers,
  MapPin,
  Waves,
  Eye,
  AlertTriangle,
} from "lucide-react";

interface GWObservatory {
  observatory_id: string;
  name: string;
  depth_km: number;
  location: string;
  arm_length_km: number;
  test_mass_temp_kelvin: number;
  strain_sensitivity_hz: number;
  status: string;
  anomalous_strains_detected: number;
}

interface StrainAnalysis {
  analysis_id: string;
  observatory_id: string;
  measured_strain_h: number;
  differential_displacement_fm: number;
  dominant_frequency_hz: number;
  p_s_wave_ratio: number;
  threat_type: string;
  threat_level: string;
  estimated_yield_kilotons: number;
  action_recommended: string;
  timestamp: number;
}

interface TriangulationResult {
  triangulation_id: string;
  event_label: string;
  reporting_observatories: string[];
  geodetic_coordinates: {
    latitude: number;
    longitude: number;
    depth_km: number;
    spatial_error_radius_meters: number;
  };
  strain_tensor_magnitude: number;
  triangulation_speed_ms: number;
  verification_status: string;
  timestamp: number;
}

export function GravitationalSeismicStudio() {
  const [observatories, setObservatories] = useState<GWObservatory[]>([]);
  const [selectedObsId, setSelectedObsId] = useState<string>("");
  const [latestAnalysis, setLatestAnalysis] = useState<StrainAnalysis | null>(null);
  const [latestTriangulation, setLatestTriangulation] = useState<TriangulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [triangulating, setTriangulating] = useState(false);
  const [simulateNuclearShock, setSimulateNuclearShock] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);

  const fetchObservatoriesAndMetrics = useCallback(async () => {
    setLoading(true);
    try {
      const [obsRes, metRes] = await Promise.all([
        fetch("/api/gravitational-seismic/observatories"),
        fetch("/api/gravitational-seismic/metrics"),
      ]);
      const obsData = await obsRes.json();
      const metData = await metRes.json();

      if (obsData.observatories) {
        setObservatories(obsData.observatories);
        if (obsData.observatories.length > 0) {
          setSelectedObsId((prev) => prev || obsData.observatories[0].observatory_id);
        }
      }
      if (metData.metrics) {
        setMetrics(metData.metrics);
      }
    } catch (e) {
      console.error("Failed to load gravitational seismic data", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchObservatoriesAndMetrics();
  }, [fetchObservatoriesAndMetrics]);

  const handleAnalyzeStrain = async () => {
    if (!selectedObsId) return;
    setAnalyzing(true);
    try {
      const payload = {
        observatory_id: selectedObsId,
        measured_strain_h: simulateNuclearShock ? 2.8e-19 : 3.5e-20,
        dominant_frequency_hz: simulateNuclearShock ? 12.5 : 28.0,
        p_wave_velocity_km_s: 6.2,
        s_wave_velocity_km_s: 3.5,
      };

      const res = await fetch("/api/gravitational-seismic/analyze-strain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.analysis) {
        setLatestAnalysis(data.analysis);
        fetchObservatoriesAndMetrics();
      }
    } catch (e) {
      console.error("Failed to analyze strain tensor", e);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleTriangulate = async () => {
    setTriangulating(true);
    try {
      const payload = {
        event_label: "SUBCRUSTAL_SEISMIC_TAMPER_TDOA",
        sensor_arrival_times_ms: {
          "gw-obs-kagra-subterra-01": 14.2,
          "gw-obs-einstein-telescope-02": 28.5,
          "gw-obs-cascina-virgo-03": 34.0,
        },
        assumed_depth_km: 4.8,
      };

      const res = await fetch("/api/gravitational-seismic/triangulate-tamper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.triangulation) {
        setLatestTriangulation(data.triangulation);
      }
    } catch (e) {
      console.error("Failed to triangulate sub-crustal tamper", e);
    } finally {
      setTriangulating(false);
    }
  };

  const selectedObs = observatories.find((o) => o.observatory_id === selectedObsId);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-xl border border-teal-800/50 bg-gradient-to-r from-slate-950 via-teal-950/25 to-slate-950 p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-500/10 border border-teal-500/30 rounded-lg text-teal-400">
              <Waves className="h-8 w-8 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-wider text-slate-100 uppercase">
                  Gravitational Wave Seismic Tamper & Sub-Crustal Tectonic Sensor Mesh
                </h2>
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/40">
                  CAPABILITY 71
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                Cryogenic subterranean laser strain interferometers measuring quadrupolar spacetime strain (&Delta;L/L ~ 10⁻²¹) to isolate covert sub-crustal nuclear detonations and deep tunnel boring.
              </p>
            </div>
          </div>
          <button
            onClick={fetchObservatoriesAndMetrics}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-sm transition-all"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Scan Interferometers
          </button>
        </div>

        {/* Global Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/60">
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
            <span className="text-xs text-slate-500 uppercase tracking-wider block">Laser Observatories</span>
            <span className="text-xl font-bold text-teal-400 font-mono">
              {metrics?.total_laser_observatories || observatories.length} Primary Nodes
            </span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
            <span className="text-xs text-slate-500 uppercase tracking-wider block">Total Optical Arm Span</span>
            <span className="text-xl font-bold text-emerald-400 font-mono">
              {metrics?.total_interferometer_arm_length_km || 20.0} km
            </span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
            <span className="text-xs text-slate-500 uppercase tracking-wider block">Sub-Femtometer Precision</span>
            <span className="text-xl font-bold text-cyan-400 font-mono">
              &plusmn;0.05 fm
            </span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
            <span className="text-xs text-slate-500 uppercase tracking-wider block">Anomalous Strains</span>
            <span className="text-xl font-bold text-amber-400 font-mono">
              {metrics?.anomalous_crustal_strains_intercepted || 0} Logged
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Observatories Selector & Telemetry */}
        <div className="space-y-4 lg:col-span-1">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-lg">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2 mb-4">
              <Layers className="h-4 w-4 text-teal-400" />
              Subterranean Laser Interferometers
            </h3>
            <div className="space-y-2">
              {observatories.map((o) => (
                <button
                  key={o.observatory_id}
                  onClick={() => setSelectedObsId(o.observatory_id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedObsId === o.observatory_id
                      ? "bg-teal-950/40 border-teal-500/50 text-white shadow-md"
                      : "bg-slate-900/50 border-slate-800/80 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-sm text-slate-200 truncate">{o.name}</span>
                    <span className="text-xs font-mono text-teal-400">{o.arm_length_km} km</span>
                  </div>
                  <div className="flex justify-between items-center mt-2 text-xs text-slate-400">
                    <span>Depth: {o.depth_km} km</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-mono">
                      {o.test_mass_temp_kelvin} K
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selectedObs && (
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-lg space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-teal-400" />
                Interferometer Parameters
              </h4>
              <div className="text-xs space-y-1.5 font-mono text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Facility ID:</span>
                  <span className="text-teal-400">{selectedObs.observatory_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Location:</span>
                  <span className="text-slate-300 truncate max-w-[180px]">{selectedObs.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Strain Sensitivity:</span>
                  <span className="text-cyan-400">{selectedObs.strain_sensitivity_hz} Hz⁻¹/²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Cavity Status:</span>
                  <span className="text-emerald-400">{selectedObs.status}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Center & Right Column: Strain Analysis & Geodetic Inversion Controls */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Activity className="h-4 w-4 text-teal-400" />
              Differential Strain Inversion & Geodetic Localization
            </h3>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="simulateNuclearShock"
                  checked={simulateNuclearShock}
                  onChange={(e) => setSimulateNuclearShock(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-teal-500 focus:ring-teal-500/20"
                />
                <label htmlFor="simulateNuclearShock" className="text-sm text-slate-300 cursor-pointer">
                  Simulate Sub-Crustal Nuclear Shockwave (h &gt; 10⁻¹⁹, 24.5 kT)
                </label>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handleAnalyzeStrain}
                  disabled={analyzing}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-sm font-medium transition-all shadow-md shadow-teal-600/20 disabled:opacity-50"
                >
                  <Eye className={`h-4 w-4 ${analyzing ? "animate-pulse" : ""}`} />
                  {analyzing ? "Analyzing Strain..." : "Analyze Strain"}
                </button>
                <button
                  onClick={handleTriangulate}
                  disabled={triangulating}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50"
                >
                  <Zap className={`h-4 w-4 ${triangulating ? "animate-spin" : ""}`} />
                  {triangulating ? "Triangulating..." : "Triangulate Tamper"}
                </button>
              </div>
            </div>

            {/* Analysis Results Card */}
            {latestAnalysis && (
              <div className="p-4 rounded-lg border border-slate-800 bg-slate-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    {latestAnalysis.threat_level.includes("CRITICAL") ? (
                      <ShieldAlert className="h-4 w-4 text-rose-400" />
                    ) : (
                      <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    )}
                    Strain Tensor Inversion Spectrum
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${
                      latestAnalysis.threat_level.includes("CRITICAL")
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                        : "bg-teal-500/20 text-teal-300 border border-teal-500/40"
                    }`}
                  >
                    {latestAnalysis.threat_type}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800">
                    <span className="text-slate-500 block">Strain Tensor h:</span>
                    <span className="text-teal-400 font-bold">{latestAnalysis.measured_strain_h.toExponential(2)}</span>
                  </div>
                  <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800">
                    <span className="text-slate-500 block">Displacement &Delta;L:</span>
                    <span className="text-cyan-400 font-bold">{latestAnalysis.differential_displacement_fm.toFixed(2)} fm</span>
                  </div>
                  <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800">
                    <span className="text-slate-500 block">Frequency Peak:</span>
                    <span className="text-indigo-400 font-bold">{latestAnalysis.dominant_frequency_hz} Hz</span>
                  </div>
                  <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800">
                    <span className="text-slate-500 block">Estimated Yield:</span>
                    <span className="text-rose-400 font-bold">{latestAnalysis.estimated_yield_kilotons} kT</span>
                  </div>
                </div>
              </div>
            )}

            {/* Triangulation Card */}
            {latestTriangulation && (
              <div className="p-4 rounded-lg border border-indigo-900/40 bg-indigo-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                    <Zap className="h-4 w-4 text-indigo-400" />
                    Geodetic TDOA Sub-Crustal Localization
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-bold font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                    {latestTriangulation.triangulation_speed_ms} ms Latency
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800">
                    <span className="text-slate-500 block">Geodetic Fix:</span>
                    <span className="text-slate-200">
                      {latestTriangulation.geodetic_coordinates.latitude}° N, {latestTriangulation.geodetic_coordinates.longitude}° E
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800">
                    <span className="text-slate-500 block">Spatial Error Radius:</span>
                    <span className="text-teal-400">&lt; {latestTriangulation.geodetic_coordinates.spatial_error_radius_meters} m</span>
                  </div>
                  <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800">
                    <span className="text-slate-500 block">Tensor Convergence:</span>
                    <span className="text-emerald-400">100% CONFIRMED</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Real-time Subterranean Strain Feed */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-lg">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2 mb-3">
              <Terminal className="h-4 w-4 text-teal-400" />
              Sub-Crustal Strain Interferometer Stream
            </h3>
            <div className="p-3 bg-slate-900/80 rounded border border-slate-800 text-xs font-mono text-slate-300 space-y-1.5 h-36 overflow-y-auto">
              <p className="text-teal-400">[0.00ms] KAGRA 20K cryostat: Sapphire test masses suspended on fused silica fibers.</p>
              <p className="text-emerald-400">[1.12ms] Einstein Telescope: Triangular 10km arms optical power build-up at 1.0 MW recirculating nominal.</p>
              <p className="text-slate-400">[3.40ms] Seismic isolation inverted pendulum attenuation: 140 dB rejection above 10 Hz.</p>
              <p className="text-indigo-400">[6.85ms] P/S wave acoustic velocity ratio: 1.77 (continental crust granite nominal).</p>
              {latestAnalysis && (
                <p className={latestAnalysis.threat_level.includes("CRITICAL") ? "text-rose-400" : "text-teal-300"}>
                  [{latestAnalysis.analysis_id}] Strain h={latestAnalysis.measured_strain_h.toExponential(2)}, threat={latestAnalysis.threat_type}, action={latestAnalysis.action_recommended}.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

