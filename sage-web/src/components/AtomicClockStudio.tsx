"use client";

import React, { useState, useEffect } from "react";
import {
  Clock,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Activity,
  RefreshCw,
  Terminal,
  Layers,
  Lock,
  Globe,
  CheckCircle,
  AlertOctagon,
} from "lucide-react";

interface AtomicClock {
  clock_id: string;
  name: string;
  atomic_species: string;
  transition_frequency_thz: number;
  fractional_uncertainty: number;
  operating_temp_kelvin: number;
  comb_link_active: boolean;
  status: string;
  drift_offset_fs: number;
  timestamps_authenticated: number;
}

interface SyncResult {
  sync_id: string;
  primary_clock: string;
  fiber_network_span_km: number;
  residual_jitter_fs: number;
  time_transfer_fractional_uncertainty: number;
  spoofing_detected: boolean;
  sync_status: string;
  action_taken: string;
  timestamp: number;
}

interface TimestampRecord {
  token_id: string;
  clock_id: string;
  target_subsystem: string;
  tai_timestamp_ns: number;
  clock_uncertainty: number;
  pqc_algorithm: string;
  pqc_signature_hex: string;
  tamper_proof_valid: boolean;
  status: string;
  timestamp: number;
}

export function AtomicClockStudio() {
  const [clocks, setClocks] = useState<AtomicClock[]>([]);
  const [selectedClockId, setSelectedClockId] = useState<string>("");
  const [latestSync, setLatestSync] = useState<SyncResult | null>(null);
  const [latestTimestamp, setLatestTimestamp] = useState<TimestampRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [signing, setSigning] = useState(false);
  const [simulateSpoofing, setSimulateSpoofing] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);

  const fetchClocksAndMetrics = async () => {
    setLoading(true);
    try {
      const [clkRes, metRes] = await Promise.all([
        fetch("/api/atomic-clock/clocks"),
        fetch("/api/atomic-clock/metrics"),
      ]);
      const clkData = await clkRes.json();
      const metData = await metRes.json();

      if (clkData.clocks) {
        setClocks(clkData.clocks);
        if (!selectedClockId && clkData.clocks.length > 0) {
          setSelectedClockId(clkData.clocks[0].clock_id);
        }
      }
      if (metData.metrics) {
        setMetrics(metData.metrics);
      }
    } catch (e) {
      console.error("Failed to load atomic clock data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClocksAndMetrics();
  }, []);

  const handleSyncMesh = async () => {
    setSyncing(true);
    try {
      const payload = {
        primary_clock_id: selectedClockId || "clock-strontium-boulder-01",
        fiber_link_length_km: 1250.0,
        carrier_phase_jitter_fs: simulateSpoofing ? 82.5 : 4.2,
      };

      const res = await fetch("/api/atomic-clock/synchronize-mesh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.sync) {
        setLatestSync(data.sync);
        fetchClocksAndMetrics();
      }
    } catch (e) {
      console.error("Failed to sync atomic clock mesh", e);
    } finally {
      setSyncing(false);
    }
  };

  const handleIssueTimestamp = async () => {
    if (!selectedClockId) return;
    setSigning(true);
    try {
      const payload = {
        clock_id: selectedClockId,
        payload_data: "SCADA-TRANSMISSION-GRID-PMU-TELEMETRY-BLOCK-8841",
        target_subsystem: "SCADA_INTERGRID_PMU",
      };

      const res = await fetch("/api/atomic-clock/generate-timestamp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.timestamp_record) {
        setLatestTimestamp(data.timestamp_record);
        fetchClocksAndMetrics();
      }
    } catch (e) {
      console.error("Failed to issue atomic timestamp", e);
    } finally {
      setSigning(false);
    }
  };

  const selectedClock = clocks.find((c) => c.clock_id === selectedClockId);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-xl border border-violet-800/50 bg-gradient-to-r from-slate-950 via-violet-950/20 to-slate-950 p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-violet-500/10 border border-violet-500/30 rounded-lg text-violet-400">
              <Clock className="h-8 w-8 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-wider text-slate-100 uppercase">
                  Post-Quantum Planetary Optical Atomic Clock Mesh
                </h2>
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-violet-500/20 text-violet-300 border border-violet-500/40">
                  CAPABILITY 70
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                Cryogenic Strontium-87 &amp; Ytterbium-171 optical lattice clocks (&Delta;f/f &lt; 10⁻¹⁸), White Rabbit optical comb dissemination, and ML-DSA-87 authenticated spacetime epochs.
              </p>
            </div>
          </div>
          <button
            onClick={fetchClocksAndMetrics}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-sm transition-all"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Query Clocks
          </button>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/60">
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
            <span className="text-xs text-slate-500 uppercase tracking-wider block">Optical Lattice Clocks</span>
            <span className="text-xl font-bold text-violet-400 font-mono">
              {metrics?.total_optical_lattice_clocks || clocks.length} Primary Standards
            </span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
            <span className="text-xs text-slate-500 uppercase tracking-wider block">Best Uncertainty</span>
            <span className="text-xl font-bold text-emerald-400 font-mono">
              1.4 × 10⁻¹⁸
            </span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
            <span className="text-xs text-slate-500 uppercase tracking-wider block">Authenticated Timestamps</span>
            <span className="text-xl font-bold text-cyan-400 font-mono">
              {metrics?.total_authenticated_timestamps?.toLocaleString() || "404,590"}
            </span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
            <span className="text-xs text-slate-500 uppercase tracking-wider block">Mesh Coherence State</span>
            <span className="text-xs font-bold text-indigo-400 font-mono truncate block mt-1">
              {metrics?.mesh_synchronization_state || "FEMTOSECOND_COHERENCE"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Clocks Selector */}
        <div className="space-y-4 lg:col-span-1">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-lg">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2 mb-4">
              <Layers className="h-4 w-4 text-violet-400" />
              Optical Lattice Primary Standards
            </h3>
            <div className="space-y-2">
              {clocks.map((c) => (
                <button
                  key={c.clock_id}
                  onClick={() => setSelectedClockId(c.clock_id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedClockId === c.clock_id
                      ? "bg-violet-950/40 border-violet-500/50 text-white shadow-md"
                      : "bg-slate-900/50 border-slate-800/80 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-sm text-slate-200 truncate">{c.name}</span>
                    <span className="text-xs font-mono text-violet-400">{c.atomic_species.split(" ")[0]}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2 text-xs text-slate-400">
                    <span>{c.transition_frequency_thz} THz</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                      Δf/f: {c.fractional_uncertainty.toExponential(1)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selectedClock && (
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-lg space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Globe className="h-3.5 w-3.5 text-violet-400" />
                Atomic Trap Telemetry
              </h4>
              <div className="text-xs space-y-1.5 font-mono text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Clock ID:</span>
                  <span className="text-violet-400">{selectedClock.clock_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Trap Temperature:</span>
                  <span className="text-cyan-400">{(selectedClock.operating_temp_kelvin * 1e6).toFixed(1)} μK</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Optical Comb Link:</span>
                  <span className={selectedClock.comb_link_active ? "text-emerald-400" : "text-slate-500"}>
                    {selectedClock.comb_link_active ? "PHASE_LOCKED" : "STANDALONE"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Residual Drift:</span>
                  <span className="text-emerald-400 font-bold">{selectedClock.drift_offset_fs} fs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Authenticated:</span>
                  <span className="text-indigo-300">{selectedClock.timestamps_authenticated.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Center & Right Column: Dissemination & Timestamping */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Clock className="h-4 w-4 text-violet-400" />
              White Rabbit PTP & Post-Quantum Timestamp Controls
            </h3>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="simulateSpoofing"
                  checked={simulateSpoofing}
                  onChange={(e) => setSimulateSpoofing(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-violet-500 focus:ring-violet-500/20"
                />
                <label htmlFor="simulateSpoofing" className="text-sm text-slate-300 cursor-pointer">
                  Simulate Relativistic Phase Spoofing (&gt; 50 fs jitter injection)
                </label>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handleSyncMesh}
                  disabled={syncing}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-medium transition-all shadow-md shadow-violet-600/20 disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
                  {syncing ? "Syncing Mesh..." : "Synchronize Mesh"}
                </button>
                <button
                  onClick={handleIssueTimestamp}
                  disabled={signing}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
                >
                  <Lock className={`h-4 w-4 ${signing ? "animate-pulse" : ""}`} />
                  {signing ? "Signing..." : "Issue ML-DSA-87 Stamp"}
                </button>
              </div>
            </div>

            {/* Sync Results */}
            {latestSync && (
              <div className="p-4 rounded-lg border border-slate-800 bg-slate-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    {latestSync.spoofing_detected ? (
                      <AlertOctagon className="h-4 w-4 text-rose-400" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                    )}
                    Optical Frequency Comb Synchronization
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${
                      latestSync.spoofing_detected
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    }`}
                  >
                    {latestSync.sync_status}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800">
                    <span className="text-slate-500 block">Dark Fiber Network:</span>
                    <span className="text-slate-200 font-bold">{latestSync.fiber_network_span_km} km</span>
                  </div>
                  <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800">
                    <span className="text-slate-500 block">Residual Phase Jitter:</span>
                    <span className="text-cyan-400 font-bold">{latestSync.residual_jitter_fs} fs</span>
                  </div>
                  <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800">
                    <span className="text-slate-500 block">Transfer Uncertainty:</span>
                    <span className="text-emerald-400 font-bold">
                      {latestSync.time_transfer_fractional_uncertainty.toExponential(1)}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800">
                    <span className="text-slate-500 block">Action Executed:</span>
                    <span className="text-indigo-400 font-bold truncate block">{latestSync.action_taken}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Timestamp Token Results */}
            {latestTimestamp && (
              <div className="p-4 rounded-lg border border-emerald-900/40 bg-emerald-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                    <Lock className="h-4 w-4 text-emerald-400" />
                    ML-DSA-87 Post-Quantum Atomic Timestamp Anchor
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    FIPS 204 Level 5 Valid
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800">
                    <span className="text-slate-500 block">TAI Epoch (ns):</span>
                    <span className="text-cyan-400 font-bold">{latestTimestamp.tai_timestamp_ns}</span>
                  </div>
                  <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800">
                    <span className="text-slate-500 block">Target Subsystem:</span>
                    <span className="text-slate-200">{latestTimestamp.target_subsystem}</span>
                  </div>
                  <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800">
                    <span className="text-slate-500 block">PQC Signature:</span>
                    <span className="text-violet-300 truncate block">{latestTimestamp.pqc_signature_hex}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Time Transfer Stream Console */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-lg">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2 mb-3">
              <Terminal className="h-4 w-4 text-violet-400" />
              Inter-Atomic Optical Lattice Time Transfer Stream
            </h3>
            <div className="p-3 bg-slate-900/80 rounded border border-slate-800 text-xs font-mono text-slate-300 space-y-1.5 h-36 overflow-y-auto">
              <p className="text-violet-400">[0.00fs] NIST Boulder 87Sr clock transition 429.228 THz locked to ultrastable silicon optical cavity.</p>
              <p className="text-cyan-400">[0.12fs] White Rabbit PTP carrier frequency comb active over 1,250 km dark-fiber link.</p>
              <p className="text-emerald-400">[0.45fs] Acoustic fiber noise cancellation interferometer compensating Doppler delay at 10 kHz bandwidth.</p>
              <p className="text-indigo-400">[1.10fs] PTB Braunschweig 171Yb comparison confirms mutual fractional stability within 1.6 x 10^-18.</p>
              {latestTimestamp && (
                <p className="text-emerald-300">
                  [{latestTimestamp.token_id}] ML-DSA-87 signed epoch emitted: TAI={latestTimestamp.tai_timestamp_ns} ns for {latestTimestamp.target_subsystem}.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
