"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  RefreshCw,
  Terminal,
  Activity,
  Globe,
  Radio,
  Sliders,
  AlertTriangle,
} from "lucide-react";

interface DynamoStation {
  station_id: string;
  station_type: string;
  latitude: number;
  longitude: number;
  altitude_km: number;
  magnetic_moment_am2: number;
  hts_field_tesla: number;
  alfven_resonance_freq_hz: number;
  hemp_e1_clamping_speed_ps: number;
  status: string;
}

interface DecouplingResponse {
  decoupling_id: string;
  station_id: string;
  threat_type: string;
  peak_electric_field_kv_m: number;
  rise_time_ns: number;
  clamped_e1_voltage_volts: number;
  attenuation_ratio_db: number;
  substation_gic_reduced_pct: number;
  alfven_wave_injected_amplitude_t: number;
  mitigation_latency_ns: number;
  verdict: string;
  timestamp: string;
}

export function MagnetosphereDynamoStudio() {
  const [stations, setStations] = useState<DynamoStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [decoupling, setDecoupling] = useState(false);
  const [selectedStation, setSelectedStation] = useState("DYNAMO-ORBITAL-COIL-01");
  const [threatType, setThreatType] = useState("HEMP_NUCLEAR_BURST");
  const [simulatedE1, setSimulatedE1] = useState(55.0);
  const [lastResponse, setLastResponse] = useState<DecouplingResponse | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const fetchStations = async () => {
    try {
      const res = await fetch("/api/magnetosphere-dynamo/stations");
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

  const handleTriggerDecoupling = async () => {
    setDecoupling(true);
    setLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] Injecting ULF Alfv&eacute;n resonance wave & engaging picosecond HEMP diverter at ${selectedStation} (${simulatedE1} kV/m E1 pulse)...`,
      ...prev,
    ]);

    try {
      const res = await fetch("/api/magnetosphere-dynamo/trigger-decoupling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          station_id: selectedStation,
          threat_type: threatType,
          simulated_e1_kv_m: simulatedE1,
          simulated_rise_time_ns: 2.1,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setLastResponse(data);
        setLogs((prev) => [
          `[${new Date().toLocaleTimeString()}] HEMP Decoupled: E1 clamped to ${data.clamped_e1_voltage_volts} V (${data.attenuation_ratio_db} dB attenuation) | GIC reduced: ${data.substation_gic_reduced_pct}% | Response: ${data.mitigation_latency_ns} ns`,
          ...prev,
        ]);
      }
    } catch {
      setLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] Decoupling error: HTS coil flux pinning breached`,
        ...prev,
      ]);
    } finally {
      setDecoupling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl border border-blue-500/20 bg-gradient-to-r from-blue-950/40 via-indigo-900/20 to-neutral-900/40 p-6 backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-400 border border-blue-500/30">
                Capability 78
              </span>
              <span className="text-xs text-neutral-400">Wave 19 Planetary Electrodynamics</span>
            </div>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Globe className="h-6 w-6 text-blue-400" />
              Planetary Magnetosphere Dynamo &amp; High-Altitude EMP (HEMP) Decoupler
            </h2>
            <p className="mt-1 text-sm text-neutral-300">
              Superconducting orbital coils (15 Tesla) and ultra-low frequency (ULF) Alfv&eacute;n wave resonance injection (0.1–5.0 Hz) decoupling E1/E2/E3 nuclear EMP surges and CME solar storm compression.
            </p>
          </div>
          <button
            onClick={fetchStations}
            className="flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-800/80 px-4 py-2 text-sm font-medium text-neutral-200 transition hover:bg-neutral-700"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Sync Dynamo Grid
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
          <div className="flex items-center gap-2 text-neutral-400 text-xs">
            <Zap className="h-4 w-4 text-blue-400" />
            E1 Pulse Clamping Speed
          </div>
          <div className="mt-2 text-2xl font-bold text-white">&lt; 380 ps</div>
          <div className="mt-1 text-xs text-blue-400">Solid-State Superconducting Shunt</div>
        </div>

        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
          <div className="flex items-center gap-2 text-neutral-400 text-xs">
            <Activity className="h-4 w-4 text-indigo-400" />
            Alfv&eacute;n Resonance Mode
          </div>
          <div className="mt-2 text-2xl font-bold text-white">1.25 Hz ULF</div>
          <div className="mt-1 text-xs text-indigo-400">Ionospheric Wave Injection</div>
        </div>

        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
          <div className="flex items-center gap-2 text-neutral-400 text-xs">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            HEMP Pulse Attenuation
          </div>
          <div className="mt-2 text-2xl font-bold text-white">49.5 dB</div>
          <div className="mt-1 text-xs text-emerald-400">55 kV/m &rarr; 24.7 V Clamped</div>
        </div>

        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
          <div className="flex items-center gap-2 text-neutral-400 text-xs">
            <ShieldAlert className="h-4 w-4 text-cyan-400" />
            Substation GIC Suppression
          </div>
          <div className="mt-2 text-2xl font-bold text-white">99.8%</div>
          <div className="mt-1 text-xs text-cyan-400">Transformer Burnout Quenched</div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Dynamo Stations */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Sliders className="h-4 w-4 text-blue-400" />
                Planetary Magnetosphere Modulator Stations
              </h3>
              <span className="text-xs text-neutral-400">{stations.length} Active Nodes</span>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              {stations.map((st) => (
                <div
                  key={st.station_id}
                  className="rounded-lg border border-neutral-800 bg-neutral-950/60 p-3.5 hover:border-blue-500/40 transition"
                >
                  <div className="font-semibold text-white text-xs">{st.station_id}</div>
                  <div className="text-[11px] text-blue-400 font-mono mt-0.5">{st.station_type}</div>
                  <div className="mt-3 space-y-1 text-[11px] text-neutral-400">
                    <div>HTS Coil: <span className="text-white font-bold">{st.hts_field_tesla} T</span></div>
                    <div>Alfv&eacute;n: <span className="text-neutral-200">{st.alfven_resonance_freq_hz} Hz</span></div>
                    <div>Clamp: <span className="text-neutral-200">{st.hemp_e1_clamping_speed_ps} ps</span></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Test Trigger Console */}
            <div className="mt-6 rounded-lg border border-blue-500/20 bg-blue-950/20 p-4">
              <h4 className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
                Simulate HEMP Nuclear Pulse &amp; Magnetopause Compression
              </h4>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-neutral-400">Station</label>
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
                  <label className="text-xs text-neutral-400">Threat Type</label>
                  <select
                    value={threatType}
                    onChange={(e) => setThreatType(e.target.value)}
                    className="mt-1 w-full rounded border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs text-white"
                  >
                    <option value="HEMP_NUCLEAR_BURST">High-Altitude Nuclear EMP (HEMP)</option>
                    <option value="SOLAR_CME_COMPRESSION">Extreme Solar CME Shock Compression</option>
                    <option value="GEOMAGNETIC_HEAVE">Late-Time Magnetospheric Heave (E3)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-neutral-400">E1 Peak: {simulatedE1} kV/m</label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={simulatedE1}
                    onChange={(e) => setSimulatedE1(parseFloat(e.target.value))}
                    className="mt-1 w-full accent-blue-500"
                  />
                </div>
              </div>

              <button
                onClick={handleTriggerDecoupling}
                disabled={decoupling}
                className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs py-2.5 transition disabled:opacity-50"
              >
                <Zap className="h-4 w-4" />
                {decoupling ? "Injecting Alfv&eacute;n Resonance & Decoupling Pulse..." : "Engage HEMP Decoupler & Quench Pulse Surge"}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Decoupling Telemetry */}
        <div className="space-y-4">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-neutral-800 pb-3">
              <Radio className="h-4 w-4 text-blue-400" />
              Decoupling Response Telemetry
            </h3>

            {lastResponse ? (
              <div className="mt-4 space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Decoupling ID:</span>
                  <span className="font-mono text-blue-400">{lastResponse.decoupling_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">E1 Peak Ingress:</span>
                  <span className="text-white font-bold">{lastResponse.peak_electric_field_kv_m} kV/m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Clamped Voltage:</span>
                  <span className="text-emerald-400 font-bold">{lastResponse.clamped_e1_voltage_volts} V</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Attenuation Ratio:</span>
                  <span className="text-blue-300 font-bold">{lastResponse.attenuation_ratio_db} dB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">GIC Suppressed:</span>
                  <span className="text-green-400 font-bold">{lastResponse.substation_gic_reduced_pct}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Response Speed:</span>
                  <span className="text-cyan-400 font-mono">{lastResponse.mitigation_latency_ns} ns</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Verdict:</span>
                  <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-emerald-400 border border-emerald-500/20">
                    {lastResponse.verdict}
                  </span>
                </div>
              </div>
            ) : (
              <div className="mt-6 text-center text-xs text-neutral-500 py-6">
                Click &quot;Engage HEMP Decoupler&quot; to test geomagnetic field stabilization.
              </div>
            )}
          </div>

          {/* Console Log */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400 border-b border-neutral-800/80 pb-2">
              <Terminal className="h-3.5 w-3.5 text-blue-400" />
              MHD Dynamo Stream
            </div>
            <div className="mt-3 h-44 overflow-y-auto space-y-1.5 font-mono text-[11px] text-neutral-400">
              {logs.length > 0 ? (
                logs.map((log, i) => <div key={i}>{log}</div>)
              ) : (
                <div className="text-neutral-600">Dynamo coils superconducting. Magnetopause standoff stable.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
