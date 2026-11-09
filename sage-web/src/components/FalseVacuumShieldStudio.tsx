"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Zap,
  Activity,
  Terminal,
  RefreshCw,
  Shield,
  Sparkles,
  Flame,
  Radio,
} from "lucide-react";

interface VacuumChamberNode {
  chamber_id: string;
  facility_name: string;
  higgs_field_vev_gev: number;
  tunneling_barrier_height_gev4: number;
  coleman_de_luccia_bounce_action_b: number;
  critical_bubble_radius_am: number;
  vacuum_decay_rate_log10: number;
  counter_bias_pulse_power_tw: number;
  status: string;
}

interface VacuumQuenchEvent {
  event_id: string;
  chamber_id: string;
  simulated_instanton_perturbation: string;
  applied_counter_bias_tw: number;
  effective_bounce_action_boost: number;
  nucleation_suppression_orders_of_mag: number;
  nucleation_probability_remaining: number;
  bubble_collapse_confirmed: boolean;
  status: string;
  timestamp: string;
}

export function FalseVacuumShieldStudio() {
  const [chambers, setChambers] = useState<VacuumChamberNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [quenching, setQuenching] = useState(false);
  const [selectedChamber, setSelectedChamber] = useState("VACUUM-SHIELD-GENEVA-01");
  const [perturbation, setPerturbation] = useState("MICROSCOPIC_BLACK_HOLE_CATALYZED_TUNNELING");
  const [counterBiasTW, setCounterBiasTW] = useState(48.0);
  const [lastEvent, setLastEvent] = useState<VacuumQuenchEvent | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const fetchChambers = async () => {
    try {
      const res = await fetch("/api/false-vacuum/chambers");
      if (res.ok) {
        const data = await res.json();
        setChambers(data);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChambers();
    setLogs([
      "[" + new Date().toLocaleTimeString() + "] Quantum Vacuum False Decay Bubble Nucleation Shield armed.",
      "[" + new Date().toLocaleTimeString() + "] Coleman-De Luccia instanton bounce action baseline verified: B ~ 1865.",
      "[" + new Date().toLocaleTimeString() + "] Electroweak Higgs potential VEV locked at 246.22 GeV.",
    ]);
  }, []);

  const handleQuench = async () => {
    setQuenching(true);
    setLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] Triggering counter-bias quench at ${selectedChamber} (${counterBiasTW} TW against ${perturbation})...`,
      ...prev,
    ]);

    try {
      const res = await fetch("/api/false-vacuum/quench-nucleation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chamber_id: selectedChamber,
          simulated_instanton_perturbation: perturbation,
          counter_bias_power_tw: counterBiasTW,
        }),
      });

      if (res.ok) {
        const data: VacuumQuenchEvent = await res.json();
        setLastEvent(data);
        setLogs((prev) => [
          `[${new Date().toLocaleTimeString()}] NUCLEATION QUENCH SUCCESS: ${data.event_id}`,
          `[${new Date().toLocaleTimeString()}] Suppression: 10^${data.nucleation_suppression_orders_of_mag.toFixed(1)} orders of magnitude | Delta B: +${data.effective_bounce_action_boost.toFixed(1)}`,
          `[${new Date().toLocaleTimeString()}] Bubble Collapse Confirmed: ${data.bubble_collapse_confirmed ? "YES" : "NO"}`,
          `[${new Date().toLocaleTimeString()}] Residual Nucleation Prob: ${data.nucleation_probability_remaining.toExponential(1)}`,
          ...prev,
        ]);
      }
    } catch {
      setLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] QUENCH ERROR: Bounce barrier collapse detected.`,
        ...prev,
      ]);
    } finally {
      setQuenching(false);
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
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  Quantum Vacuum False Decay Bubble Nucleation Shield
                  <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 font-mono">
                    Capability 91
                  </span>
                </h1>
                <p className="text-sm text-slate-400">
                  Coleman-De Luccia Instanton Quenching, Higgs Metastability Protection & Counter-Bias Decoupler
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchChambers}
              disabled={loading}
              className="px-3 py-1.5 text-xs font-mono rounded-lg border border-rose-500/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Sync Vacuum Chambers
            </button>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-900/40 border border-rose-500/30 text-rose-300 text-xs font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse" />
              METASTABILITY ARMED
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Chamber Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {chambers.map((c) => (
          <div
            key={c.chamber_id}
            onClick={() => setSelectedChamber(c.chamber_id)}
            className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 ${
              selectedChamber === c.chamber_id
                ? "border-rose-500 bg-rose-950/30 shadow-lg shadow-rose-950/50"
                : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-semibold text-rose-400 truncate">
                {c.chamber_id}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border bg-rose-500/20 text-rose-300 border-rose-500/40">
                {c.status}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-white truncate mb-2">
              {c.facility_name}
            </h3>

            <div className="space-y-1.5 text-xs text-slate-400 font-mono">
              <div className="flex justify-between">
                <span>Higgs VEV:</span>
                <span className="text-slate-200">{c.higgs_field_vev_gev} GeV</span>
              </div>
              <div className="flex justify-between">
                <span>CDL Bounce Action B:</span>
                <span className="text-emerald-400 font-bold">{c.coleman_de_luccia_bounce_action_b}</span>
              </div>
              <div className="flex justify-between">
                <span>Critical Radius:</span>
                <span className="text-slate-200">{c.critical_bubble_radius_am} am</span>
              </div>
              <div className="flex justify-between">
                <span>Decay Rate log10:</span>
                <span className="text-amber-400">{c.vacuum_decay_rate_log10}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Control Panel & Quench Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Zap className="h-4 w-4 text-rose-400" />
            Instanton Quench Injector
          </h2>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1 font-mono">
                Target Shield Chamber
              </label>
              <select
                value={selectedChamber}
                onChange={(e) => setSelectedChamber(e.target.value)}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-slate-200 font-mono focus:border-rose-500 focus:outline-none"
              >
                {chambers.map((c) => (
                  <option key={c.chamber_id} value={c.chamber_id}>
                    {c.chamber_id} (B = {c.coleman_de_luccia_bounce_action_b})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1 font-mono">
                Instanton Perturbation Mode
              </label>
              <select
                value={perturbation}
                onChange={(e) => setPerturbation(e.target.value)}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-slate-200 font-mono focus:border-rose-500 focus:outline-none"
              >
                <option value="MICROSCOPIC_BLACK_HOLE_CATALYZED_TUNNELING">Micro-Black Hole Catalyzed Tunneling</option>
                <option value="ULTRA_HIGH_ENERGY_COSMIC_RAY_COLLISION">UHE Cosmic Ray Collision Instanton</option>
                <option value="ELECTROWEAK_MONOPOLE_INSTANTON">Electroweak Monopole Instanton Seed</option>
                <option value="SPACETIME_METRIC_FLUCTUATION_SURGE">Spacetime Metric Fluctuation Surge</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                <span>Counter-Bias Pulse Power:</span>
                <span className="text-rose-300 font-bold">{counterBiasTW.toFixed(1)} TW</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="2"
                value={counterBiasTW}
                onChange={(e) => setCounterBiasTW(parseFloat(e.target.value))}
                className="w-full accent-rose-500"
              />
            </div>

            <button
              onClick={handleQuench}
              disabled={quenching}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-semibold text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-rose-900/30"
            >
              <Sparkles className={`h-4 w-4 ${quenching ? "animate-spin" : ""}`} />
              {quenching ? "Quenching Nucleation..." : "Quench Bubble Nucleation"}
            </button>
          </div>
        </div>

        {/* Telemetry Display */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Activity className="h-4 w-4 text-rose-400" />
            Decay Suppression Telemetry
          </h2>

          {lastEvent ? (
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/30 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Event ID:</span>
                  <span className="text-rose-300 font-bold">{lastEvent.event_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Suppression Factor:</span>
                  <span className="text-emerald-400 font-bold">10^{lastEvent.nucleation_suppression_orders_of_mag.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Bounce Action Boost:</span>
                  <span className="text-white font-bold">+{lastEvent.effective_bounce_action_boost.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Bubble Collapsed:</span>
                  <span className="text-emerald-400 font-bold">{lastEvent.bubble_collapse_confirmed ? "CONFIRMED" : "FAILED"}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Residual Probability:</span>
                  <span className="text-indigo-300">{lastEvent.nucleation_probability_remaining.toExponential(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className="text-emerald-400 font-bold">{lastEvent.status}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-40 flex flex-col items-center justify-center text-slate-500 text-xs font-mono space-y-2">
              <ShieldAlert className="h-8 w-8 text-slate-700" />
              <span>Ready for Coleman-De Luccia instanton quench cycle.</span>
            </div>
          )}
        </div>

        {/* Live Execution Terminal */}
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs flex flex-col h-[280px]">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400">
            <span className="flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5 text-rose-400" />
              Vacuum Shield Console
            </span>
            <span className="text-[10px] text-rose-400/80">ONLINE</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 text-slate-300 pr-1 select-text">
            {logs.map((log, index) => (
              <div key={index} className="leading-relaxed">
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

