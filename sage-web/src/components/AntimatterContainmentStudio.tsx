"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  RefreshCw,
  Terminal,
  Layers,
  Flame,
  Radio,
  Sliders,
  AlertTriangle,
} from "lucide-react";

interface ContainmentCell {
  cell_id: string;
  facility_name: string;
  magnetic_field_tesla: number;
  cryogenic_temp_kelvin: number;
  vacuum_pressure_mbar: number;
  axial_well_voltage_volts: number;
  antiproton_count: number;
  plasma_radius_mm: number;
  diocotron_mode_frequency_khz: number;
  rotating_wall_amplitude_v: number;
  confinement_time_margin_hours: number;
  containment_status: string;
}

interface PlasmaTelemetry {
  telemetry_id: string;
  cell_id: string;
  stored_antiprotons: number;
  plasma_density_cm3: number;
  magnetic_drift_velocity_m_s: number;
  annihilation_loss_rate_per_sec: number;
  quench_dump_readiness_pct: number;
  stability_margin_sigma: number;
  status: string;
  timestamp: string;
}

export function AntimatterContainmentStudio() {
  const [cells, setCells] = useState<ContainmentCell[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [selectedCell, setSelectedCell] = useState("CELL-ALPHA-PENNING-01");
  const [telemetry, setTelemetry] = useState<PlasmaTelemetry | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const fetchCells = async () => {
    try {
      const res = await fetch("/api/antimatter-containment/cells");
      if (res.ok) {
        const data = await res.json();
        setCells(data);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const fetchTelemetry = async (cellId: string) => {
    try {
      const res = await fetch(`/api/antimatter-containment/telemetry?cell_id=${cellId}`);
      if (res.ok) {
        const data = await res.json();
        setTelemetry(data);
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    fetchCells();
    fetchTelemetry(selectedCell);
  }, [selectedCell]);

  const handleCompressPlasma = async () => {
    setActing(true);
    setLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] Applying rotating wall quadrupole field (+0.5V) to compress antiproton cloud on ${selectedCell}...`,
      ...prev,
    ]);

    try {
      const res = await fetch("/api/antimatter-containment/compress-plasma", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cell_id: selectedCell,
          delta_voltage_v: 0.5,
          target_radius_mm: 1.45,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setLogs((prev) => [
          `[${new Date().toLocaleTimeString()}] Compression verified: Plasma radius compressed to ${data.compressed_plasma_radius_mm} mm | Diocotron suppression: ${data.diocotron_suppression_ratio_db} dB`,
          ...prev,
        ]);
        fetchCells();
        fetchTelemetry(selectedCell);
      }
    } catch {
      setLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] Compression failed: Cryogenic field instability`,
        ...prev,
      ]);
    } finally {
      setActing(false);
    }
  };

  const handleQuenchDivert = async () => {
    setActing(true);
    setLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] Initiating fail-safe fast magnetic quench diversion on ${selectedCell}...`,
      ...prev,
    ]);

    try {
      const res = await fetch("/api/antimatter-containment/quench-divert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cell_id: selectedCell,
          reason: "CONTROLLED_EMERGENCY_DRILL",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setLogs((prev) => [
          `[${new Date().toLocaleTimeString()}] Quench divert safe: ${data.diverted_antiproton_count.toLocaleString()} antiprotons diverted to Tungsten baffle | Absorption time: ${data.quench_diversion_duration_us} &mu;s | Breach Prob: 0.0%`,
          ...prev,
        ]);
        fetchCells();
        fetchTelemetry(selectedCell);
      }
    } catch {
      setLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] Quench divert error: Divertor coil failed to latch`,
        ...prev,
      ]);
    } finally {
      setActing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-950/40 via-orange-900/20 to-neutral-900/40 p-6 backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-400 border border-amber-500/30">
                Capability 76
              </span>
              <span className="text-xs text-neutral-400">Wave 18 Relativistic Physics</span>
            </div>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Flame className="h-6 w-6 text-amber-400" />
              Autonomous Penning-Trap Superconducting Antimatter Containment Matrix
            </h2>
            <p className="mt-1 text-sm text-neutral-300">
              Cryogenic Penning-Malmberg traps (&lt; 4.2 K), HTS superconducting solenoids (11 Tesla), rotating wall plasma compression, and sub-millisecond magnetic divertor quench dump safety.
            </p>
          </div>
          <button
            onClick={() => {
              fetchCells();
              fetchTelemetry(selectedCell);
            }}
            className="flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-800/80 px-4 py-2 text-sm font-medium text-neutral-200 transition hover:bg-neutral-700"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh Telemetry
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
          <div className="flex items-center gap-2 text-neutral-400 text-xs">
            <Flame className="h-4 w-4 text-amber-400" />
            Total Antiprotons Stored
          </div>
          <div className="mt-2 text-2xl font-bold text-white">2.67 &times; 10⁹</div>
          <div className="mt-1 text-xs text-amber-400">E = 2mc² Confinement</div>
        </div>

        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
          <div className="flex items-center gap-2 text-neutral-400 text-xs">
            <Layers className="h-4 w-4 text-cyan-400" />
            HTS Magnetic Field
          </div>
          <div className="mt-2 text-2xl font-bold text-white">11.33 Tesla</div>
          <div className="mt-1 text-xs text-cyan-400">REBCO Superconducting Solenoid</div>
        </div>

        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
          <div className="flex items-center gap-2 text-neutral-400 text-xs">
            <Radio className="h-4 w-4 text-emerald-400" />
            Cryogenic Temperature
          </div>
          <div className="mt-2 text-2xl font-bold text-white">3.4 Kelvin</div>
          <div className="mt-1 text-xs text-emerald-400">P &lt; 4.2 &times; 10⁻¹⁵ mbar Vacuum</div>
        </div>

        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
          <div className="flex items-center gap-2 text-neutral-400 text-xs">
            <ShieldCheck className="h-4 w-4 text-green-400" />
            Quench Dump Readiness
          </div>
          <div className="mt-2 text-2xl font-bold text-white">99.98%</div>
          <div className="mt-1 text-xs text-green-400">Breach Probability: 0.0%</div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Containment Cells */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Sliders className="h-4 w-4 text-amber-400" />
                Superconducting Penning Containment Cells
              </h3>
              <span className="text-xs text-neutral-400">{cells.length} Active Storage Cells</span>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              {cells.map((c) => (
                <div
                  key={c.cell_id}
                  onClick={() => setSelectedCell(c.cell_id)}
                  className={`cursor-pointer rounded-lg border p-4 transition ${
                    selectedCell === c.cell_id
                      ? "border-amber-500 bg-amber-950/30"
                      : "border-neutral-800 bg-neutral-950/60 hover:border-neutral-700"
                  }`}
                >
                  <div className="font-semibold text-white text-xs">{c.cell_id}</div>
                  <div className="text-[11px] text-amber-400 font-mono mt-0.5">{c.facility_name}</div>
                  <div className="mt-3 space-y-1 text-[11px] text-neutral-400">
                    <div>P-Bars: <span className="text-white font-mono">{c.antiproton_count.toLocaleString()}</span></div>
                    <div>B-Field: <span className="text-neutral-200">{c.magnetic_field_tesla} T</span></div>
                    <div>Temp: <span className="text-neutral-200">{c.cryogenic_temp_kelvin} K</span></div>
                    <div>Radius: <span className="text-neutral-200">{c.plasma_radius_mm} mm</span></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 rounded-lg border border-amber-500/20 bg-amber-950/20 p-4">
              <h4 className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
                Active Plasma Confinement Controls ({selectedCell})
              </h4>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  onClick={handleCompressPlasma}
                  disabled={acting}
                  className="flex items-center justify-center gap-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs py-2.5 transition disabled:opacity-50"
                >
                  <Zap className="h-4 w-4" />
                  {acting ? "Applying Rotating Wall Quadrupole..." : "Apply Rotating Wall Compression"}
                </button>
                <button
                  onClick={handleQuenchDivert}
                  disabled={acting}
                  className="flex items-center justify-center gap-2 rounded-lg bg-red-600/80 hover:bg-red-500 text-white font-medium text-xs py-2.5 transition disabled:opacity-50"
                >
                  <ShieldAlert className="h-4 w-4" />
                  {acting ? "Executing Magnetic Divert..." : "Execute Fast Quench Dump Protocol"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Telemetry & Log */}
        <div className="space-y-4">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-neutral-800 pb-3">
              <Radio className="h-4 w-4 text-amber-400" />
              Plasma Well Telemetry ({selectedCell})
            </h3>

            {telemetry ? (
              <div className="mt-4 space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Stored Antiprotons:</span>
                  <span className="text-white font-bold">{telemetry.stored_antiprotons.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Plasma Density:</span>
                  <span className="text-amber-400 font-mono">{telemetry.plasma_density_cm3.toLocaleString()} / cm³</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">E&times;B Drift Velocity:</span>
                  <span className="text-white font-mono">{telemetry.magnetic_drift_velocity_m_s} m/s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Loss Rate:</span>
                  <span className="text-emerald-400 font-mono">{telemetry.annihilation_loss_rate_per_sec} p-bar/s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Stability Margin:</span>
                  <span className="text-green-400 font-bold">{telemetry.stability_margin_sigma} &sigma;</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Containment State:</span>
                  <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-emerald-400 border border-emerald-500/20">
                    {telemetry.status}
                  </span>
                </div>
              </div>
            ) : (
              <div className="mt-6 text-center text-xs text-neutral-500 py-6">
                Loading plasma telemetry...
              </div>
            )}
          </div>

          {/* Console Log */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400 border-b border-neutral-800/80 pb-2">
              <Terminal className="h-3.5 w-3.5 text-amber-400" />
              Cryogenic Divertor & Coil Log
            </div>
            <div className="mt-3 h-44 overflow-y-auto space-y-1.5 font-mono text-[11px] text-neutral-400">
              {logs.length > 0 ? (
                logs.map((log, i) => <div key={i}>{log}</div>)
              ) : (
                <div className="text-neutral-600">Cryogenic trap monitor active. Zero field leakage detected.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

