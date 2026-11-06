"use client";

import React, { useState, useEffect } from "react";
import {
  Layers,
  ShieldAlert,
  ShieldCheck,
  Zap,
  RefreshCw,
  Terminal,
  Compass,
  Search,
  Eye,
  AlertTriangle,
  Mountain,
} from "lucide-react";

interface TelescopeStation {
  station_id: string;
  location_name: string;
  latitude: number;
  longitude: number;
  altitude_m: number;
  detector_type: string;
  effective_area_m2: number;
  angular_resolution_mrad: number;
  zenith_acceptance_deg: number;
  muon_count_rate_hz: number;
  status: string;
}

interface DensityAnomaly {
  anomaly_id: string;
  classification: string;
  estimated_density_g_cm3: number;
  density_contrast_pct: number;
  relative_depth_m: number;
  estimated_volume_m3: number;
  confidence_score: number;
}

interface ScanResult {
  scan_id: string;
  station_id: string;
  target_geological_zone: string;
  depth_meters: number;
  overburden_density_mean_g_cm3: number;
  integrated_muon_events: number;
  detected_density_anomalies: DensityAnomaly[];
  void_detection_confidence_pct: number;
  high_z_material_confidence_pct: number;
  spatial_resolution_meters: number;
  reconstruction_time_ms: number;
  timestamp: string;
}

export function MuonTomographyStudio() {
  const [stations, setStations] = useState<TelescopeStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [selectedStation, setSelectedStation] = useState("MUON-TEL-ALPS-GRANITE");
  const [targetZone, setTargetZone] = useState("Mont Blanc Deep Shaft Adit-4");
  const [targetDepth, setTargetDepth] = useState(450.0);
  const [exposureHours, setExposureHours] = useState(12.0);
  const [lastScan, setLastScan] = useState<ScanResult | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const fetchStations = async () => {
    try {
      const res = await fetch("/api/muon-tomography/stations");
      if (res.ok) {
        const data = await res.json();
        setStations(data);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  const handleExecuteScan = async () => {
    setScanning(true);
    setLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] Initializing cosmic muon radiographic scan at ${selectedStation} (Target: ${targetZone}, Depth: ${targetDepth}m)...`,
      ...prev,
    ]);

    try {
      const res = await fetch("/api/muon-tomography/execute-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          station_id: selectedStation,
          target_zone: targetZone,
          target_depth_meters: targetDepth,
          exposure_time_hours: exposureHours,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setLastScan(data);
        setLogs((prev) => [
          `[${new Date().toLocaleTimeString()}] 3D Inversion complete in ${data.reconstruction_time_ms}ms: ${data.integrated_muon_events.toLocaleString()} muons | Voids: ${data.void_detection_confidence_pct}% | High-Z Masses: ${data.high_z_material_confidence_pct}%`,
          ...prev,
        ]);
      }
    } catch {
      setLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] Scan failed: Muon telescope acquisition timeout`,
        ...prev,
      ]);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl border border-violet-500/20 bg-gradient-to-r from-violet-950/40 via-purple-900/20 to-neutral-900/40 p-6 backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-violet-500/10 px-2 py-0.5 text-xs font-semibold text-violet-400 border border-violet-500/30">
                Capability 75
              </span>
              <span className="text-xs text-neutral-400">Wave 18 Subsurface Tomography</span>
            </div>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Mountain className="h-6 w-6 text-violet-400" />
              Deep Subsurface Cosmic Muon Radiographic Tomography Mesh
            </h2>
            <p className="mt-1 text-sm text-neutral-300">
              Atmospheric cosmic-ray muon penetration (E &gt; 100 GeV) and Resistive Plate Chamber (RPC) telescopes for 3D density contrast imaging of clandestine voids and shielded high-Z bunkers.
            </p>
          </div>
          <button
            onClick={fetchStations}
            className="flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-800/80 px-4 py-2 text-sm font-medium text-neutral-200 transition hover:bg-neutral-700"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh Telescopes
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
          <div className="flex items-center gap-2 text-neutral-400 text-xs">
            <Layers className="h-4 w-4 text-violet-400" />
            Max Penetration Depth
          </div>
          <div className="mt-2 text-2xl font-bold text-white">1,200 m</div>
          <div className="mt-1 text-xs text-violet-400">Sub-Crustal Overburden</div>
        </div>

        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
          <div className="flex items-center gap-2 text-neutral-400 text-xs">
            <Compass className="h-4 w-4 text-purple-400" />
            Angular Resolution
          </div>
          <div className="mt-2 text-2xl font-bold text-white">1.2 mrad</div>
          <div className="mt-1 text-xs text-purple-400">RPC Tracking Planes</div>
        </div>

        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
          <div className="flex items-center gap-2 text-neutral-400 text-xs">
            <Search className="h-4 w-4 text-amber-400" />
            Void Detection Confidence
          </div>
          <div className="mt-2 text-2xl font-bold text-white">98.4%</div>
          <div className="mt-1 text-xs text-amber-400">&Delta;&rho; = -96.9% Void Contrast</div>
        </div>

        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
          <div className="flex items-center gap-2 text-neutral-400 text-xs">
            <ShieldAlert className="h-4 w-4 text-red-400" />
            High-Z Shielding Match
          </div>
          <div className="mt-2 text-2xl font-bold text-white">9.45 g/cm³</div>
          <div className="mt-1 text-xs text-red-400">Dense Fissile / Lead Core</div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Telescopes & Scan Config */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Eye className="h-4 w-4 text-violet-400" />
                Active Cosmic Muon Telescopes
              </h3>
              <span className="text-xs text-neutral-400">{stations.length} Array Stations</span>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              {stations.map((st) => (
                <div
                  key={st.station_id}
                  className="rounded-lg border border-neutral-800 bg-neutral-950/60 p-3.5 hover:border-violet-500/40 transition"
                >
                  <div className="font-semibold text-white text-xs">{st.station_id}</div>
                  <div className="text-[11px] text-violet-300 font-mono mt-0.5">{st.location_name}</div>
                  <div className="mt-2 space-y-1 text-[11px] text-neutral-400">
                    <div>Type: <span className="text-neutral-200">{st.detector_type}</span></div>
                    <div>Area: <span className="text-neutral-200">{st.effective_area_m2} m²</span></div>
                    <div>Rate: <span className="text-neutral-200">{st.muon_count_rate_hz} Hz</span></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Scan Initiation Form */}
            <div className="mt-6 rounded-lg border border-violet-500/20 bg-violet-950/20 p-4">
              <h4 className="text-xs font-semibold text-violet-300 uppercase tracking-wider">
                Initiate Subterranean Tomographic Inversion
              </h4>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-neutral-400">Telescope Station</label>
                  <select
                    value={selectedStation}
                    onChange={(e) => setSelectedStation(e.target.value)}
                    className="mt-1 w-full rounded border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs text-white"
                  >
                    {stations.map((s) => (
                      <option key={s.station_id} value={s.station_id}>
                        {s.station_id}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-neutral-400">Target Geological Zone</label>
                  <input
                    type="text"
                    value={targetZone}
                    onChange={(e) => setTargetZone(e.target.value)}
                    className="mt-1 w-full rounded border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-400">Target Depth (Meters)</label>
                  <input
                    type="number"
                    value={targetDepth}
                    onChange={(e) => setTargetDepth(parseFloat(e.target.value) || 450)}
                    className="mt-1 w-full rounded border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <button
                onClick={handleExecuteScan}
                disabled={scanning}
                className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs py-2 transition disabled:opacity-50"
              >
                <Zap className="h-4 w-4" />
                {scanning ? "Tracking Zenith Flux & Reconstructing 3D Density..." : "Execute 3D Bayesian Muon Inversion"}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Scan Findings & Anomalies */}
        <div className="space-y-4">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-neutral-800 pb-3">
              <Search className="h-4 w-4 text-violet-400" />
              Subterranean Inversion Findings
            </h3>

            {lastScan ? (
              <div className="mt-4 space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Scan ID:</span>
                  <span className="font-mono text-violet-400">{lastScan.scan_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Target Zone:</span>
                  <span className="text-white font-semibold">{lastScan.target_geological_zone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Depth / Resolution:</span>
                  <span className="text-white">{lastScan.depth_meters}m (Pitch: {lastScan.spatial_resolution_meters}m)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Integrated Muons:</span>
                  <span className="text-violet-300 font-mono">{lastScan.integrated_muon_events.toLocaleString()} events</span>
                </div>

                <div className="mt-3 pt-3 border-t border-neutral-800 space-y-2">
                  <div className="text-[11px] font-semibold text-neutral-300">Detected Density Anomalies:</div>
                  {lastScan.detected_density_anomalies.map((anom) => (
                    <div
                      key={anom.anomaly_id}
                      className="rounded border border-neutral-800 bg-neutral-950/80 p-2.5 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-violet-400 font-semibold">{anom.anomaly_id}</span>
                        <span className="text-[10px] text-amber-400 font-semibold">{(anom.confidence_score * 100).toFixed(1)}% Conf</span>
                      </div>
                      <div className="text-white font-medium">{anom.classification}</div>
                      <div className="flex justify-between text-[11px] text-neutral-400">
                        <span>Density: {anom.estimated_density_g_cm3} g/cm³</span>
                        <span>Contrast: {anom.density_contrast_pct}%</span>
                      </div>
                      <div className="text-[11px] text-neutral-400">
                        Volume: {anom.estimated_volume_m3.toLocaleString()} m³ @ depth {anom.relative_depth_m}m
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-6 text-center text-xs text-neutral-500 py-6">
                Click &quot;Execute 3D Bayesian Muon Inversion&quot; to inspect subterranean geological voids.
              </div>
            )}
          </div>

          {/* Console Log */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400 border-b border-neutral-800/80 pb-2">
              <Terminal className="h-3.5 w-3.5 text-violet-400" />
              Muon Telescope Inversion Stream
            </div>
            <div className="mt-3 h-44 overflow-y-auto space-y-1.5 font-mono text-[11px] text-neutral-400">
              {logs.length > 0 ? (
                logs.map((log, i) => <div key={i}>{log}</div>)
              ) : (
                <div className="text-neutral-600">Telescope array online. Awaiting tomographic scan trigger...</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
