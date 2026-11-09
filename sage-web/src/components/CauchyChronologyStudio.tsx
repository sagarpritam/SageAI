"use client";

import React, { useState, useEffect } from "react";
import {
  Clock,
  ShieldAlert,
  Zap,
  Activity,
  Terminal,
  RefreshCw,
  Lock,
  AlertTriangle,
  Compass,
} from "lucide-react";

interface CauchyHorizon {
  horizon_id: string;
  spacetime_metric_type: string;
  facility_name: string;
  cauchy_surface_radius_m: number;
  angular_momentum_spin_a: number;
  divergence_growth_rate_exponent: number;
  chronology_protection_margin_db: number;
  backreaction_clamp_latency_as: number;
  status: string;
}

interface ChronoResult {
  action_id: string;
  horizon_id: string;
  spacetime_metric: string;
  renormalized_stress_energy_gev_m3: number;
  divergence_suppression_ratio_db: number;
  ctc_phase_slip_femtoseconds: number;
  quantum_backreaction_counter_pulse_joules: number;
  chronology_preservation_fidelity_pct: number;
  closed_timelike_loop_prevented: boolean;
  status: string;
  timestamp: string;
}

export function CauchyChronologyStudio() {
  const [horizons, setHorizons] = useState<CauchyHorizon[]>([]);
  const [loading, setLoading] = useState(true);
  const [clamping, setClamping] = useState(false);
  const [selectedHorizon, setSelectedHorizon] = useState("CAUCHY-HORIZON-KERR-01");
  const [blueshiftFactor, setBlueshiftFactor] = useState(1.0e12);
  const [lastAction, setLastAction] = useState<ChronoResult | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const fetchHorizons = async () => {
    try {
      const res = await fetch("/api/cauchy-chronology/horizons");
      if (res.ok) {
        const data = await res.json();
        setHorizons(data);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHorizons();
    setLogs([
      "[" + new Date().toLocaleTimeString() + "] Hawking Chronology Protection Sentinel online.",
      "[" + new Date().toLocaleTimeString() + "] Renormalized stress-energy tensor <T_mu_nu>_ren monitor armed across Cauchy null generators.",
      "[" + new Date().toLocaleTimeString() + "] Sub-femtosecond quantum vacuum backreaction counter-pulse primed.",
    ]);
  }, []);

  const handleClamp = async () => {
    setClamping(true);
    setLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] Blue-sheet divergence detected at ${selectedHorizon}. Activating quantum vacuum backreaction clamp...`,
      ...prev,
    ]);

    try {
      const res = await fetch("/api/cauchy-chronology/clamp-ctc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          horizon_id: selectedHorizon,
          simulated_blueshift_factor: blueshiftFactor,
        }),
      });

      if (res.ok) {
        const data: ChronoResult = await res.json();
        setLastAction(data);
        setLogs((prev) => [
          `[${new Date().toLocaleTimeString()}] CLAMP DISCHARGED: ${data.action_id}`,
          `[${new Date().toLocaleTimeString()}] Divergence Suppression: ${data.divergence_suppression_ratio_db.toFixed(1)} dB | Counter-Pulse: ${data.quantum_backreaction_counter_pulse_joules.toExponential(3)} J`,
          `[${new Date().toLocaleTimeString()}] CTC Phase Slip: ${data.ctc_phase_slip_femtoseconds.toFixed(6)} fs | Causality Fidelity: ${data.chronology_preservation_fidelity_pct.toFixed(5)}%`,
          `[${new Date().toLocaleTimeString()}] Closed Timelike Loop Prevented: ${data.closed_timelike_loop_prevented ? "TRUE" : "FALSE"}`,
          ...prev,
        ]);
      }
    } catch {
      setLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] CLAMP FAULT: Acausal chronology rupture detected.`,
        ...prev,
      ]);
    } finally {
      setClamping(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl border border-rose-500/30 bg-gradient-to-r from-rose-950/40 via-slate-900 to-amber-950/40 p-6 backdrop-blur">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  Cauchy Horizon Quantum Chronology Protector
                  <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 font-mono">
                    Capability 88
                  </span>
                </h1>
                <p className="text-sm text-slate-400">
                  Hawking Chronology Protection Conjecture & Closed Timelike Curve (CTC) Vacuum Backreaction Clamp
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchHorizons}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-xs transition"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh Horizons
            </button>
          </div>
        </div>
      </div>

      {/* Metric Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg border border-rose-500/20 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Divergence Suppression</span>
            <ShieldAlert className="h-4 w-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-300">
            {lastAction ? `${lastAction.divergence_suppression_ratio_db.toFixed(1)} dB` : "96.2 dB"}
          </div>
          <div className="text-xs text-slate-500 mt-1">&lt;T_&mu;&nu;&gt; Blueshift Quenched</div>
        </div>

        <div className="rounded-lg border border-amber-500/20 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>CTC Phase Slip</span>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-300">
            {lastAction ? `${lastAction.ctc_phase_slip_femtoseconds.toFixed(6)} fs` : "0.000420 fs"}
          </div>
          <div className="text-xs text-slate-500 mt-1">Closed Timelike Curve Disrupted</div>
        </div>

        <div className="rounded-lg border border-cyan-500/20 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Backreaction Latency</span>
            <Zap className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-300">
            780 as
          </div>
          <div className="text-xs text-slate-500 mt-1">Sub-Attosecond Reaction Time</div>
        </div>

        <div className="rounded-lg border border-emerald-500/20 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Causality Violation</span>
            <Lock className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-300">
            0.00%
          </div>
          <div className="text-xs text-slate-500 mt-1">Hawking Conjecture Enforced</div>
        </div>
      </div>

      {/* Main Grid: Control Panel + Active Horizons */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Compass className="h-4 w-4 text-rose-400" />
              Chronology Violation Clamp
            </h2>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Cauchy Spacetime Horizon</label>
                <select
                  value={selectedHorizon}
                  onChange={(e) => setSelectedHorizon(e.target.value)}
                  className="w-full text-xs font-mono rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500"
                >
                  {horizons.map((h) => (
                    <option key={h.horizon_id} value={h.horizon_id}>
                      {h.facility_name} ({h.spacetime_metric_type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Blueshift Growth Factor</span>
                  <span className="font-mono text-rose-400">{blueshiftFactor.toExponential(1)}</span>
                </div>
                <input
                  type="range"
                  min="11"
                  max="14"
                  step="0.1"
                  value={Math.log10(blueshiftFactor)}
                  onChange={(e) => setBlueshiftFactor(Math.pow(10, parseFloat(e.target.value)))}
                  className="w-full accent-rose-500"
                />
              </div>
            </div>

            <button
              onClick={handleClamp}
              disabled={clamping}
              className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-medium text-xs transition disabled:opacity-50"
            >
              <Zap className={`h-4 w-4 ${clamping ? "animate-spin" : ""}`} />
              {clamping ? "Discharging Vacuum Backreaction..." : "Enforce Chronology Protection"}
            </button>
          </div>

          {/* Last Action Box */}
          {lastAction && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between text-rose-300 font-semibold">
                <span>Active Protection Status</span>
                <Lock className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="font-mono text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Action ID:</span>
                  <span className="text-white">{lastAction.action_id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Suppression:</span>
                  <span className="text-rose-400">{lastAction.divergence_suppression_ratio_db.toFixed(1)} dB</span>
                </div>
                <div className="flex justify-between">
                  <span>Phase Slip:</span>
                  <span className="text-amber-400">{lastAction.ctc_phase_slip_femtoseconds.toFixed(6)} fs</span>
                </div>
                <div className="flex justify-between">
                  <span>Preservation:</span>
                  <span className="text-emerald-400">{lastAction.chronology_preservation_fidelity_pct.toFixed(5)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Acausal Loops:</span>
                  <span className="text-emerald-400">QUENCHED</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Horizons Grid + Terminal */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-3">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-rose-400" />
                Monitored Cauchy Horizons ({horizons.length})
              </span>
              <span className="text-xs text-slate-400 font-mono">Null Generator Generator k&mu;k_&mu; = 0</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {horizons.map((h) => (
                <div
                  key={h.horizon_id}
                  className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 space-y-2 hover:border-rose-500/40 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white truncate">{h.facility_name}</span>
                  </div>

                  <div className="text-[11px] font-mono text-slate-400 space-y-1 pt-1 border-t border-slate-800/80">
                    <div>
                      <span className="text-slate-500">Metric:</span>{" "}
                      <span className="text-slate-300">{h.spacetime_metric_type}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Spin a = J/M:</span>{" "}
                      <span className="text-amber-400">{h.angular_momentum_spin_a}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Margin:</span>{" "}
                      <span className="text-rose-400">{h.chronology_protection_margin_db} dB</span>
                    </div>
                  </div>

                  <div className="text-[10px] text-emerald-400 flex items-center gap-1 pt-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    PROTECTION ARMED
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Terminal Console Stream */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-400 space-y-2">
            <div className="flex items-center justify-between text-slate-300 border-b border-slate-800 pb-2">
              <span className="flex items-center gap-2">
                <Terminal className="h-3.5 w-3.5 text-rose-400" />
                Hawking Chronology Protection Stream
              </span>
              <span className="text-[10px] text-slate-500">QUANTUM BACKREACTION MONITOR</span>
            </div>
            <div className="h-36 overflow-y-auto space-y-1 text-[11px]">
              {logs.map((log, idx) => (
                <div key={idx} className="leading-tight">
                  <span className="text-rose-500">&gt;</span> {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
