"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Atom,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Activity,
  RefreshCw,
  Terminal,
  Layers,
  MapPin,
  Radio,
  Eye,
  AlertTriangle,
} from "lucide-react";

interface NeutrinoDetector {
  detector_id: string;
  name: string;
  depth_km: number;
  location: string;
  target_mass_kton: number;
  medium: string;
  optical_sensors_count: number;
  baseline_flux_ev_per_day: number;
  status: string;
  anomalous_bursts_detected: number;
}

interface FluxAnalysis {
  analysis_id: string;
  detector_id: string;
  neutrino_energy_mev: number;
  delayed_coincidence_time_us: number;
  flux_deviation_sigma: number;
  cherenkov_angle_deg: number;
  incoming_vector: {
    zenith_deg: number;
    azimuth_deg: number;
  };
  estimated_thermal_power_gw: number;
  threat_level: string;
  status: string;
  timestamp: number;
}

interface TriangulationResult {
  triangulation_id: string;
  event_label: string;
  participating_detectors: string[];
  triangulation_latency_ms: number;
  estimated_origin: {
    latitude: number;
    longitude: number;
    depth_km: number;
    uncertainty_radius_km: number;
  };
  confidence_score: number;
  verification_status: string;
  timestamp: number;
}

export function NeutrinoArrayStudio() {
  const [detectors, setDetectors] = useState<NeutrinoDetector[]>([]);
  const [selectedDetectorId, setSelectedDetectorId] = useState<string>("");
  const [latestAnalysis, setLatestAnalysis] = useState<FluxAnalysis | null>(null);
  const [latestTriangulation, setLatestTriangulation] = useState<TriangulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [triangulating, setTriangulating] = useState(false);
  const [promptBurstSim, setPromptBurstSim] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);

  const fetchDetectorsAndMetrics = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [detRes, metRes] = await Promise.all([
        fetch("/api/neutrino-array/detectors"),
        fetch("/api/neutrino-array/metrics"),
      ]);
      const detData = await detRes.json().catch(() => ({}));
      const metData = await metRes.json().catch(() => ({}));

      if (!detRes.ok) {
        throw new Error(detData.error || "Failed to load neutrino array data");
      }

      if (detData.detectors) {
        setDetectors(detData.detectors);
        if (detData.detectors.length > 0) {
          setSelectedDetectorId((prev) => prev || detData.detectors[0].detector_id);
        }
      }
      if (metData.metrics) {
        setMetrics(metData.metrics);
      }
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : "Failed to load neutrino array data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDetectorsAndMetrics();
  }, [fetchDetectorsAndMetrics]);

  const handleAnalyzeFlux = async () => {
    if (!selectedDetectorId) return;
    setAnalyzing(true);
    setErrorMsg(null);
    try {
      const payload = {
        detector_id: selectedDetectorId,
        observed_prompt_energy_mev: promptBurstSim ? 18.5 : 3.4,
        delayed_coincidence_time_us: promptBurstSim ? 12.0 : 24.5,
        measured_flux_ev_per_day: promptBurstSim ? 540.0 : 142.0,
        zenith_angle_deg: promptBurstSim ? 32.5 : 45.0,
        azimuth_angle_deg: promptBurstSim ? 215.0 : 180.0,
      };

      const res = await fetch("/api/neutrino-array/analyze-flux", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze neutrino flux");
      }
      if (data.analysis) {
        setLatestAnalysis(data.analysis);
        fetchDetectorsAndMetrics();
      }
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : "Failed to analyze neutrino flux");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleTriangulate = async () => {
    setTriangulating(true);
    setErrorMsg(null);
    try {
      const payload = {
        event_label: "SUBTERRANEAN_FISSILE_SURGE_TRIANGULATION",
        reported_azimuth_angles: {
          "detector-icecube-southpole-01": 180.0,
          "detector-superk-kamioka-02": 215.0,
          "detector-sno-ontario-03": 75.0,
        },
        estimated_source_distance_km: 950.0,
      };

      const res = await fetch("/api/neutrino-array/triangulate-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to triangulate fissile event");
      }
      if (data.triangulation) {
        setLatestTriangulation(data.triangulation);
      }
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : "Failed to triangulate fissile event");
    } finally {
      setTriangulating(false);
    }
  };

  const selectedDetector = detectors.find((d) => d.detector_id === selectedDetectorId);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-xl border border-cyan-800/50 bg-gradient-to-r from-slate-950 via-cyan-950/30 to-slate-950 p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400">
              <Atom className="h-8 w-8 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-wider text-slate-100 uppercase">
                  Global Deep-Underground Neutrino-Flux Early Warning Array
                </h2>
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  CAPABILITY 68
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                Planetary subterranean antineutrino (&nu;&#772;ₑ) monitoring via Inverse Beta Decay (IBD) &amp; Cherenkov cone reconstruction across 1.0–2.5 km depth observatories.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={fetchDetectorsAndMetrics}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-sm transition-all"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh Array
          </button>
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="mt-4 flex items-center justify-between bg-red-950/50 border border-red-500/40 text-red-300 p-4 rounded-xl text-sm"
          >
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMsg(null)}
              className="text-xs text-red-400 hover:text-red-200 underline ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Global Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/60">
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
            <span className="text-xs text-slate-500 uppercase tracking-wider block">Subterranean Observatories</span>
            <span className="text-xl font-bold text-cyan-400 font-mono">
              {metrics?.total_detectors_online || detectors.length} Nodes
            </span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
            <span className="text-xs text-slate-500 uppercase tracking-wider block">Active Target Mass</span>
            <span className="text-xl font-bold text-emerald-400 font-mono">
              {metrics?.total_subterranean_target_mass_kton || "1,053.98"} kTon
            </span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
            <span className="text-xs text-slate-500 uppercase tracking-wider block">Optical Sensor PMTs</span>
            <span className="text-xl font-bold text-indigo-400 font-mono">
              {metrics?.total_photomultiplier_tubes?.toLocaleString() || "29,789"} PMTs
            </span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
            <span className="text-xs text-slate-500 uppercase tracking-wider block">Anomalous Fission Bursts</span>
            <span className="text-xl font-bold text-amber-400 font-mono">
              {metrics?.anomalous_fission_bursts_intercepted ?? 0} Detected
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
              <Layers className="h-4 w-4 text-cyan-400" />
              Subterranean Observatories
            </h3>
            <div className="space-y-2">
              {detectors.map((d) => (
                <button
                  type="button"
                  key={d.detector_id}
                  onClick={() => setSelectedDetectorId(d.detector_id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedDetectorId === d.detector_id
                      ? "bg-cyan-950/40 border-cyan-500/50 text-white shadow-md"
                      : "bg-slate-900/50 border-slate-800/80 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-sm text-slate-200 truncate">{d.name}</span>
                    <span className="text-xs font-mono text-cyan-400">{d.depth_km} km</span>
                  </div>
                  <div className="flex justify-between items-center mt-2 text-xs text-slate-400">
                    <span>{d.target_mass_kton} kTon ({d.medium.split(" ")[0]})</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                      {d.optical_sensors_count} PMTs
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selectedDetector && (
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-lg space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                Active Node Parameters
              </h4>
              <div className="text-xs space-y-1.5 font-mono text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Detector ID:</span>
                  <span className="text-cyan-400">{selectedDetector.detector_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Geographic Location:</span>
                  <span className="text-slate-300 truncate max-w-[180px]">{selectedDetector.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Detection Medium:</span>
                  <span className="text-indigo-300">{selectedDetector.medium}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Baseline Event Rate:</span>
                  <span className="text-emerald-400">{selectedDetector.baseline_flux_ev_per_day} ev/day</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Node Status:</span>
                  <span className="text-emerald-400">{selectedDetector.status}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Center & Right Column: Flux Analysis & Triangulation Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Controls Bar */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-lg">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2 mb-4">
              <Activity className="h-4 w-4 text-cyan-400" />
              Sub-Surface Flux & Cherenkov Reconstruction Controls
            </h3>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="promptBurstSim"
                  checked={promptBurstSim}
                  onChange={(e) => setPromptBurstSim(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-cyan-500/20"
                />
                <label htmlFor="promptBurstSim" className="text-sm text-slate-300 cursor-pointer">
                  Simulate Rogue Fission Prompt Burst (&gt; 12 MeV, &gt; 500 ev/day)
                </label>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleAnalyzeFlux}
                  disabled={analyzing}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium transition-all shadow-md shadow-cyan-600/20 disabled:opacity-50"
                >
                  <Eye className={`h-4 w-4 ${analyzing ? "animate-pulse" : ""}`} />
                  {analyzing ? "Analyzing IBD..." : "Analyze Flux"}
                </button>
                <button
                  type="button"
                  onClick={handleTriangulate}
                  disabled={triangulating}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50"
                >
                  <Radio className={`h-4 w-4 ${triangulating ? "animate-spin" : ""}`} />
                  {triangulating ? "Triangulating..." : "Triangulate Event"}
                </button>
              </div>
            </div>

            {/* Analysis Results */}
            {latestAnalysis && (
              <div className="mt-4 p-4 rounded-lg border border-slate-800 bg-slate-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    {latestAnalysis.threat_level.includes("CRITICAL") ? (
                      <ShieldAlert className="h-4 w-4 text-rose-400" />
                    ) : (
                      <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    )}
                    Neutrino Energy & Cherenkov Reconstruction
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${
                      latestAnalysis.threat_level.includes("CRITICAL")
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    }`}
                  >
                    {latestAnalysis.threat_level}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800">
                    <span className="text-slate-500 block">Reconstructed E(&nu;):</span>
                    <span className="text-cyan-400 font-bold">{latestAnalysis.neutrino_energy_mev} MeV</span>
                  </div>
                  <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800">
                    <span className="text-slate-500 block">Cherenkov Angle &theta;c:</span>
                    <span className="text-indigo-400 font-bold">{latestAnalysis.cherenkov_angle_deg}°</span>
                  </div>
                  <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800">
                    <span className="text-slate-500 block">Flux Deviation:</span>
                    <span className={latestAnalysis.flux_deviation_sigma > 3.0 ? "text-amber-400 font-bold" : "text-emerald-400 font-bold"}>
                      +{latestAnalysis.flux_deviation_sigma} σ
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800">
                    <span className="text-slate-500 block">Thermal Fission Power:</span>
                    <span className="text-rose-400 font-bold">{latestAnalysis.estimated_thermal_power_gw} GWth</span>
                  </div>
                </div>
              </div>
            )}

            {/* Triangulation Results */}
            {latestTriangulation && (
              <div className="mt-4 p-4 rounded-lg border border-indigo-900/40 bg-indigo-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                    <Radio className="h-4 w-4 text-indigo-400" />
                    Multi-Lateral Subterranean Source Localization
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-bold font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                    {latestTriangulation.triangulation_latency_ms} ms Latency
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800">
                    <span className="text-slate-500 block">Estimated Origin:</span>
                    <span className="text-slate-200">
                      {latestTriangulation.estimated_origin.latitude}° N, {latestTriangulation.estimated_origin.longitude}° E
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800">
                    <span className="text-slate-500 block">Uncertainty Radius:</span>
                    <span className="text-cyan-400">&lt; {latestTriangulation.estimated_origin.uncertainty_radius_km} km</span>
                  </div>
                  <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800">
                    <span className="text-slate-500 block">Confidence Score:</span>
                    <span className="text-emerald-400">{(latestTriangulation.confidence_score * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Real-time Subterranean Telemetry Feed */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-lg">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2 mb-3">
              <Terminal className="h-4 w-4 text-cyan-400" />
              Subatomic Neutrino Stream Telemetry Log
            </h3>
            <div className="p-3 bg-slate-900/80 rounded border border-slate-800 text-xs font-mono text-slate-300 space-y-1.5 h-36 overflow-y-auto">
              <p className="text-cyan-400">[0.00ms] IceCube DeepCore: 5,160 DOMs synchronized; glacial optical transparency 225m nominal.</p>
              <p className="text-emerald-400">[1.42ms] Super-Kamiokande: 0.02% Gd2(SO4)3 solution neutron capture gating active (22.5 μs coincidence).</p>
              <p className="text-slate-400">[3.85ms] SNO+ Creighton: Linear Alkylbenzene scintillator light yield: 10,200 optical photons/MeV.</p>
              <p className="text-indigo-400">[8.12ms] LNGS Gran Sasso: 1.4 km rock overburden attenuates cosmic muon background by factor of 10^6.</p>
              <p className="text-slate-400">[14.20ms] Geoneutrino background (238U / 232Th decay) stable across continental crust plates.</p>
              {latestAnalysis && (
                <p className={latestAnalysis.threat_level.includes("CRITICAL") ? "text-rose-400" : "text-cyan-300"}>
                  [{latestAnalysis.analysis_id}] Ingress vector (zenith={latestAnalysis.incoming_vector.zenith_deg}°, azimuth={latestAnalysis.incoming_vector.azimuth_deg}°), energy={latestAnalysis.neutrino_energy_mev} MeV, status={latestAnalysis.status}.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
