"use client";

import React, { useState, useEffect } from "react";
import {
  Satellite,
  Target,
  Zap,
  Activity,
  Terminal,
  RefreshCw,
  Crosshair,
  Shield,
  Eye,
  Radio,
  Rocket,
} from "lucide-react";

interface SatelliteNode {
  satellite_id: string;
  satellite_name: string;
  orbit_type: string;
  altitude_km: number;
  spectral_bands_count: number;
  wavelength_range_nm: string;
  ground_sample_distance_m: number;
  signal_to_noise_ratio: number;
  swath_width_km: number;
  on_orbit_neural_tpu_tops: number;
  status: string;
}

interface ScanResult {
  scan_id: string;
  satellite_id: string;
  target_coordinates: string;
  target_classification: string;
  spectral_absorption_signature: string;
  thermal_delta_t_kelvin: number;
  subpixel_abundance_fraction: number;
  confidence_score_pct: number;
  target_geohash: string;
  status: string;
  timestamp: string;
}

interface EngagementResult {
  engagement_id: string;
  scan_id: string;
  target_coordinates: string;
  interceptor_platform: string;
  cross_cue_latency_ms: number;
  intercept_trajectory_solution: string;
  projected_time_to_impact_sec: number;
  kill_probability_pct: number;
  status: string;
  timestamp: string;
}

export function HyperspectralInterceptorStudio() {
  const [satellites, setSatellites] = useState<SatelliteNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [engaging, setEngaging] = useState(false);
  const [selectedSat, setSelectedSat] = useState("HYPER-SAT-POLAR-01");
  const [targetCoords, setTargetCoords] = useState("34.0522°N, 51.4215°E (Natanz Complex)");
  const [classification, setClassification] = useState("COVERT_NUCLEAR_ENRICHMENT");
  const [interceptorType, setInterceptorType] = useState("SPACE_GROUND_KINETIC_ROD");
  const [lastScan, setLastScan] = useState<ScanResult | null>(null);
  const [lastEngagement, setLastEngagement] = useState<EngagementResult | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const fetchSatellites = async () => {
    try {
      const res = await fetch("/api/hyperspectral-interceptor/constellation");
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
      "[" + new Date().toLocaleTimeString() + "] Sovereign Planetary Hyperspectral Constellation online (288 spectral bands).",
      "[" + new Date().toLocaleTimeString() + "] On-orbit neural TPU array calibrated for real-time sub-pixel unmixing.",
      "[" + new Date().toLocaleTimeString() + "] Space-to-ground kinetic and orbital laser interceptor links hot-standby.",
    ]);
  }, []);

  const handleScan = async () => {
    setScanning(true);
    setLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] Scanning target ${targetCoords} using ${selectedSat} (${classification})...`,
      ...prev,
    ]);

    try {
      const res = await fetch("/api/hyperspectral-interceptor/scan-target", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          satellite_id: selectedSat,
          target_coordinates: targetCoords,
          suspected_classification: classification,
        }),
      });

      if (res.ok) {
        const data: ScanResult = await res.json();
        setLastScan(data);
        setLogs((prev) => [
          `[${new Date().toLocaleTimeString()}] TARGET IDENTIFIED: ${data.scan_id}`,
          `[${new Date().toLocaleTimeString()}] Signature: ${data.spectral_absorption_signature}`,
          `[${new Date().toLocaleTimeString()}] Thermal Delta T: +${data.thermal_delta_t_kelvin} K | Confidence: ${data.confidence_score_pct}%`,
          `[${new Date().toLocaleTimeString()}] Geohash: ${data.target_geohash} | Sub-Pixel Abundance: ${(data.subpixel_abundance_fraction * 100).toFixed(1)}%`,
          ...prev,
        ]);
      }
    } catch {
      setLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] SCAN ERROR: Cloud cover or atmospheric scattering interference.`,
        ...prev,
      ]);
    } finally {
      setScanning(false);
    }
  };

  const handleEngage = async () => {
    if (!lastScan) return;
    setEngaging(true);
    setLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] Cross-cueing ${interceptorType} to target coordinates ${lastScan.target_coordinates}...`,
      ...prev,
    ]);

    try {
      const res = await fetch("/api/hyperspectral-interceptor/engage-target", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scan_id: lastScan.scan_id,
          interceptor_platform: interceptorType,
        }),
      });

      if (res.ok) {
        const data: EngagementResult = await res.json();
        setLastEngagement(data);
        setLogs((prev) => [
          `[${new Date().toLocaleTimeString()}] INTERCEPTOR DISPATCHED: ${data.engagement_id}`,
          `[${new Date().toLocaleTimeString()}] Cross-Cue Latency: ${data.cross_cue_latency_ms} ms | Kill Prob: ${data.kill_probability_pct}%`,
          `[${new Date().toLocaleTimeString()}] Trajectory: ${data.intercept_trajectory_solution}`,
          `[${new Date().toLocaleTimeString()}] Time to Impact: ${data.projected_time_to_impact_sec.toFixed(4)} s`,
          ...prev,
        ]);
      }
    } catch {
      setLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] ENGAGEMENT FAILED: Interceptor telemetry link timeout.`,
        ...prev,
      ]);
    } finally {
      setEngaging(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl border border-sky-500/30 bg-gradient-to-r from-sky-950/40 via-slate-900 to-indigo-950/40 p-6 backdrop-blur">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400">
                <Satellite className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  Planetary Hyperspectral Earth Observation & Interceptor Swarm
                  <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/20 border border-sky-500/40 text-sky-300 font-mono">
                    Option B
                  </span>
                </h1>
                <p className="text-sm text-slate-400">
                  Sub-Meter 288-Band VNIR/SWIR/TIR Surveillance, Covert Nuclear Centrifuge Unmixing & Kinetic Cross-Cueing
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchSatellites}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-xs transition"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh Swarm
            </button>
          </div>
        </div>
      </div>

      {/* Metric Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg border border-sky-500/20 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Ground Resolution</span>
            <Eye className="h-4 w-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-sky-300">
            0.42 m GSD
          </div>
          <div className="text-xs text-slate-500 mt-1">Sub-Meter Optical Fidelity</div>
        </div>

        <div className="rounded-lg border border-indigo-500/20 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Spectral Channels</span>
            <Activity className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-300">
            288 Bands
          </div>
          <div className="text-xs text-slate-500 mt-1">400 &ndash; 14,000 nm (VNIR/SWIR/TIR)</div>
        </div>

        <div className="rounded-lg border border-emerald-500/20 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Cross-Cue Latency</span>
            <Zap className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-300">
            {lastEngagement ? `${lastEngagement.cross_cue_latency_ms.toFixed(1)} ms` : "14.8 ms"}
          </div>
          <div className="text-xs text-slate-500 mt-1">Sub-18ms Autonomous Handoff</div>
        </div>

        <div className="rounded-lg border border-rose-500/20 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Target Neutralization</span>
            <Crosshair className="h-4 w-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-300">
            {lastEngagement ? `${lastEngagement.kill_probability_pct.toFixed(1)}%` : "99.6%"}
          </div>
          <div className="text-xs text-slate-500 mt-1">Orbital Kinetic Strike Probability</div>
        </div>
      </div>

      {/* Main Grid: Target Scanner + Active Constellation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scanner & Engagement Controls */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Target className="h-4 w-4 text-sky-400" />
              Hyperspectral Target Acquisition
            </h2>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Orbital Sensor Platform</label>
                <select
                  value={selectedSat}
                  onChange={(e) => setSelectedSat(e.target.value)}
                  className="w-full text-xs font-mono rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  {satellites.map((s) => (
                    <option key={s.satellite_id} value={s.satellite_id}>
                      {s.satellite_name} ({s.orbit_type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Target Geocoordinates</label>
                <input
                  type="text"
                  value={targetCoords}
                  onChange={(e) => setTargetCoords(e.target.value)}
                  className="w-full text-xs font-mono rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Suspected Signature Profile</label>
                <select
                  value={classification}
                  onChange={(e) => setClassification(e.target.value)}
                  className="w-full text-xs font-mono rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="COVERT_NUCLEAR_ENRICHMENT">Covert Nuclear Enrichment (UF6 Plume)</option>
                  <option value="REINFORCED_UNDERGROUND_BUNKER">Reinforced Bunker (Thermal Venting)</option>
                  <option value="MOBILE_CAMOUFLAGED_TEL">Camouflaged TEL (Red-Edge Breakdown)</option>
                  <option value="SUBMERSIBLE_WAKE_CAVITATION">Submersible Wake (Thermal Shear)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleScan}
                disabled={scanning}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs transition disabled:opacity-50"
              >
                <Eye className={`h-4 w-4 ${scanning ? "animate-spin" : ""}`} />
                {scanning ? "Scanning Spectrum..." : "Hyperspectral Scan"}
              </button>

              <button
                onClick={handleEngage}
                disabled={engaging || !lastScan}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs transition disabled:opacity-50"
              >
                <Rocket className={`h-4 w-4 ${engaging ? "animate-spin" : ""}`} />
                {engaging ? "Cross-Cueing..." : "Cross-Cue Strike"}
              </button>
            </div>
          </div>

          {/* Last Target Analysis Box */}
          {lastScan && (
            <div className="rounded-xl border border-sky-500/30 bg-sky-950/20 p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between text-sky-300 font-semibold">
                <span>Active Target Telemetry</span>
                <Crosshair className="h-4 w-4 text-rose-400" />
              </div>
              <div className="font-mono text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Scan ID:</span>
                  <span className="text-white">{lastScan.scan_id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Signature:</span>
                  <span className="text-sky-300 truncate max-w-[200px]">{lastScan.spectral_absorption_signature}</span>
                </div>
                <div className="flex justify-between">
                  <span>Thermal Delta T:</span>
                  <span className="text-amber-400">+{lastScan.thermal_delta_t_kelvin} K</span>
                </div>
                <div className="flex justify-between">
                  <span>Confidence:</span>
                  <span className="text-emerald-400">{lastScan.confidence_score_pct}%</span>
                </div>
                {lastEngagement && (
                  <div className="flex justify-between border-t border-slate-800 pt-1 text-rose-300">
                    <span>Strike Asset:</span>
                    <span>{lastEngagement.interceptor_platform}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Constellation Grid + Terminal */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-3">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Satellite className="h-4 w-4 text-sky-400" />
                Planetary Hyperspectral Constellation ({satellites.length} Satellites)
              </span>
              <span className="text-xs text-slate-400 font-mono">0.42m Ground Resolution</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {satellites.map((s) => (
                <div
                  key={s.satellite_id}
                  className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 space-y-2 hover:border-sky-500/40 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">{s.satellite_name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-950 border border-sky-800 text-sky-300 font-mono">
                      {s.orbit_type}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800/80">
                    <div>
                      <span className="text-slate-500">Altitude:</span>{" "}
                      <span className="text-slate-300">{s.altitude_km.toLocaleString()} km</span>
                    </div>
                    <div>
                      <span className="text-slate-500">GSD:</span>{" "}
                      <span className="text-sky-300">{s.ground_sample_distance_m}m</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Bands:</span>{" "}
                      <span className="text-indigo-400">{s.spectral_bands_count}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">TPU Neural:</span>{" "}
                      <span className="text-emerald-400">{s.on_orbit_neural_tpu_tops} TOPS</span>
                    </div>
                  </div>

                  <div className="text-[10px] text-emerald-400 flex items-center gap-1 pt-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    SURVEILLANCE ACTIVE
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Terminal Console Stream */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-400 space-y-2">
            <div className="flex items-center justify-between text-slate-300 border-b border-slate-800 pb-2">
              <span className="flex items-center gap-2">
                <Terminal className="h-3.5 w-3.5 text-sky-400" />
                Orbital Hyperspectral & Kinetic Downlink Stream
              </span>
              <span className="text-[10px] text-slate-500">TACTICAL TARGETING FEED</span>
            </div>
            <div className="h-36 overflow-y-auto space-y-1 text-[11px]">
              {logs.map((log, idx) => (
                <div key={idx} className="leading-tight">
                  <span className="text-sky-500">&gt;</span> {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
