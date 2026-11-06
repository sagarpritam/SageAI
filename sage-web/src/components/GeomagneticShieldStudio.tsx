"use client";

import React, { useState, useEffect } from "react";
import {
  Sun,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Activity,
  RefreshCw,
  Sliders,
  Terminal,
  Layers,
  Flame,
  Radio,
  Gauge,
} from "lucide-react";

interface Substation {
  substation_id: string;
  name: string;
  voltage_class_kv: number;
  latitude: number;
  geology_ground_resistivity_ohm_m: number;
  neutral_blocking_capacitor_installed: boolean;
  current_gic_amps: number;
  status: string;
  transformers_protected: number;
  cme_shield_tripped: boolean;
}

interface StormEvaluation {
  evaluation_id: string;
  substation_id: string;
  threat_detected: boolean;
  threat_type: string;
  threat_level: string;
  kp_index: number;
  db_dt_nt_per_min: number;
  measured_gic_amps: number;
  reactive_power_loss_mvar: number;
  action_recommended: string;
  timestamp: number;
}

interface BlockingEvent {
  blocking_event_id: string;
  substation_id: string;
  tripping_speed_ms: number;
  damping_resistance_ohms: number;
  quenched_gic_reduction_pct: number;
  residual_gic_amps: number;
  transformer_core_burnout_prevented: boolean;
  voltage_stability_preserved: boolean;
  new_substation_status: string;
  timestamp: number;
}

export function GeomagneticShieldStudio() {
  const [substations, setSubstations] = useState<Substation[]>([]);
  const [selectedSubstation, setSelectedSubstation] = useState<Substation | null>(null);
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [tripping, setTripping] = useState(false);
  const [kpIndex, setKpIndex] = useState<number>(3.5);
  const [dbDt, setDbDt] = useState<number>(45.0);
  const [gicAmps, setGicAmps] = useState<number>(6.5);
  const [evaluation, setEvaluation] = useState<StormEvaluation | null>(null);
  const [blockingEvent, setBlockingEvent] = useState<BlockingEvent | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 19)]);
  };

  const fetchSubstations = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/geomagnetic-shield/substations");
      const data = await res.json();
      if (data.status === "success" && data.substations) {
        setSubstations(data.substations);
        if (!selectedSubstation && data.substations.length > 0) {
          setSelectedSubstation(data.substations[0]);
        }
        addLog(`Loaded ${data.substations.length} EHV transmission power grid substations.`);
      }
    } catch {
      addLog("Failed to fetch substations; using fallback space weather telemetry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubstations();
  }, []);

  const handleEvaluateStorm = async (simulateCME = false) => {
    if (!selectedSubstation) return;
    setEvaluating(true);
    const testKp = simulateCME ? 9.0 : kpIndex;
    const testRate = simulateCME ? 1250.0 : dbDt;
    const testGic = simulateCME ? 148.0 : gicAmps;

    try {
      addLog(`Evaluating magnetosphere perturbation at ${selectedSubstation.name} (Kp=${testKp}, dB/dt=${testRate} nT/min, GIC=${testGic}A)...`);
      const res = await fetch("/api/geomagnetic-shield/evaluate-storm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          substation_id: selectedSubstation.substation_id,
          kp_index: testKp,
          db_dt_nt_per_min: testRate,
          measured_gic_amps: testGic,
        }),
      });
      const data = await res.json();
      if (data.evaluation) {
        setEvaluation(data.evaluation);
        if (data.evaluation.threat_detected) {
          addLog(`⚠️ CRITICAL CME: ${data.evaluation.threat_type} (Loss: ${data.evaluation.reactive_power_loss_mvar} MVAR)! Recommendation: ${data.evaluation.action_recommended}`);
        } else {
          addLog(`✓ Magnetosphere field nominal: ${data.evaluation.action_recommended}`);
        }
      }
    } catch {
      addLog("Geomagnetic space weather evaluation failed.");
    } finally {
      setEvaluating(false);
    }
  };

  const handleTriggerBlocking = async () => {
    if (!selectedSubstation) return;
    setTripping(true);
    try {
      addLog(`Tripping sub-12ms series blocking capacitor & NGR on ${selectedSubstation.substation_id}...`);
      const res = await fetch("/api/geomagnetic-shield/trigger-blocking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          substation_id: selectedSubstation.substation_id,
          damping_resistance_ohms: 12.5,
          tripping_latency_ms: 9.4,
        }),
      });
      const data = await res.json();
      if (data.blocking_event) {
        setBlockingEvent(data.blocking_event);
        addLog(`🛡️ GIC Series Capacitor Tripped in ${data.blocking_event.tripping_speed_ms} ms! GIC quenched: ${data.blocking_event.quenched_gic_reduction_pct}%. Residual: ${data.blocking_event.residual_gic_amps} A.`);
      }
    } catch {
      addLog("Failed to trip series capacitor shield.");
    } finally {
      setTripping(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-950/40 via-orange-900/20 to-neutral-900/60 p-6 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30">
                <Sun className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  Autonomous Geomagnetic Solar Storm (CME) Induced GIC Power Grid Shield
                  <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-400">
                    Cap 63 · v4.7.0
                  </span>
                </h2>
                <p className="text-xs text-neutral-400">
                  Planetary Space Weather Telemetry (Kp 1–9, dB/dt), Quasi-DC GIC Induction & Sub-12ms Neutral Ground Damping
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={fetchSubstations}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-800/80 px-3.5 py-1.5 text-xs font-medium text-neutral-200 transition hover:bg-neutral-700/80"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh Grid
          </button>
        </div>
      </div>

      {/* Grid of EHV Power Grid Substations */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {substations.map((s) => (
          <div
            key={s.substation_id}
            onClick={() => setSelectedSubstation(s)}
            className={`cursor-pointer rounded-xl border p-4 transition ${
              selectedSubstation?.substation_id === s.substation_id
                ? "border-amber-500 bg-amber-950/20 ring-1 ring-amber-500/40"
                : "border-neutral-800 bg-neutral-900/60 hover:border-neutral-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white">{s.name}</span>
              <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-mono text-amber-300">
                {s.voltage_class_kv} kV EHV
              </span>
            </div>
            <p className="mt-1 text-xs text-neutral-400">
              {s.transformers_protected} Transformers · Latitude: {s.latitude}°N
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-neutral-300">
              <div className="rounded bg-neutral-800/50 p-1.5">
                <span className="text-neutral-500">Current GIC:</span> {s.current_gic_amps} A
              </div>
              <div className="rounded bg-neutral-800/50 p-1.5">
                <span className="text-neutral-500">Status:</span> {s.status.replace(/_/g, " ")}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Controls & Real-Time Defense Evaluation */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 lg:col-span-6">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
            <Sliders className="h-4 w-4 text-amber-400" />
            Planetary Space Weather Simulation Parameters
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-neutral-300">
                <span>Planetary Geomagnetic Kp Index (0.0 - 9.0):</span>
                <span className="font-mono text-amber-400">{kpIndex.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="9.0"
                step="0.5"
                value={kpIndex}
                onChange={(e) => setKpIndex(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs text-neutral-300">
                <span>Rate of Change dB/dt (nT/min):</span>
                <span className="font-mono text-amber-400">{dbDt.toFixed(0)} nT/min</span>
              </div>
              <input
                type="range"
                min="10.0"
                max="1500.0"
                step="50.0"
                value={dbDt}
                onChange={(e) => setDbDt(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs text-neutral-300">
                <span>Induced Quasi-DC Current (GIC Amperes):</span>
                <span className="font-mono text-amber-400">{gicAmps.toFixed(1)} A</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="200.0"
                step="5.0"
                value={gicAmps}
                onChange={(e) => setGicAmps(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              onClick={() => handleEvaluateStorm(false)}
              disabled={evaluating}
              className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow hover:bg-amber-500"
            >
              <Activity className="h-3.5 w-3.5" />
              Evaluate Space Weather
            </button>
            <button
              onClick={() => handleEvaluateStorm(true)}
              disabled={evaluating}
              className="flex items-center gap-1.5 rounded-lg border border-red-500/40 bg-red-950/30 px-3.5 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-900/40"
            >
              <Flame className="h-3.5 w-3.5 text-red-400" />
              Simulate Severe CME Incursion
            </button>
            <button
              onClick={handleTriggerBlocking}
              disabled={tripping}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/30 px-3.5 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/40"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              Trip Sub-12ms Neutral Blocking
            </button>
          </div>
        </div>

        {/* Evaluation Verdict & Telemetry Console */}
        <div className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 lg:col-span-6">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
            <Gauge className="h-4 w-4 text-amber-400" />
            Transformer Core Saturation & GIC Telemetry
          </h3>
          {evaluation ? (
            <div
              className={`rounded-lg border p-4 text-xs ${
                evaluation.threat_detected
                  ? "border-red-500/50 bg-red-950/20 text-red-200"
                  : "border-emerald-500/50 bg-emerald-950/20 text-emerald-200"
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span>{evaluation.threat_type}</span>
                <span className="font-mono">Loss: {evaluation.reactive_power_loss_mvar} MVAR</span>
              </div>
              <p className="mt-1 text-[11px] opacity-80">{evaluation.action_recommended}</p>
              <div className="mt-2 text-[10px] opacity-70">
                Kp: {evaluation.kp_index} · dB/dt: {evaluation.db_dt_nt_per_min} nT/min · GIC: {evaluation.measured_gic_amps} A
              </div>
            </div>
          ) : (
            <div className="flex h-20 items-center justify-center rounded-lg border border-dashed border-neutral-800 text-xs text-neutral-500">
              No active space weather evaluation. Run a storm analysis.
            </div>
          )}

          {/* Console Logs */}
          <div className="rounded-lg border border-neutral-800 bg-black/60 p-3 font-mono text-[11px] text-neutral-400 h-32 overflow-y-auto space-y-1">
            {logs.length === 0 ? (
              <span className="text-neutral-600">// Space weather PMU telemetry standby...</span>
            ) : (
              logs.map((l, i) => (
                <div key={i} className="leading-tight">
                  {l}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

