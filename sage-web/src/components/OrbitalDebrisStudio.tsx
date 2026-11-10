"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Orbit,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Activity,
  RefreshCw,
  Sliders,
  Terminal,
  Layers,
  Crosshair,
  Flame,
  Radio,
} from "lucide-react";

interface LaserPlatform {
  platform_id: string;
  name: string;
  orbit_class: string;
  laser_type: string;
  pulse_energy_kj: number;
  beam_divergence_urad: number;
  status: string;
  debris_deflected_count: number;
}

interface ConjunctionEvaluation {
  conjunction_id: string;
  platform_id: string;
  threat_detected: boolean;
  threat_type: string;
  threat_level: string;
  debris_size_cm: number;
  relative_velocity_km_s: number;
  miss_distance_meters: number;
  collision_probability: number;
  required_delta_v_cm_s: number;
  fire_control_latency_ms: number;
  action_recommended: string;
  timestamp: number;
}

interface DeflectionEvent {
  deflection_event_id: string;
  platform_id: string;
  target_debris_id: string;
  pulse_count: number;
  laser_fluence_j_cm2: number;
  fire_control_latency_ms: number;
  delta_v_achieved_cm_s: number;
  new_miss_distance_km: number;
  conjunction_deflected_verified: boolean;
  new_collision_probability: number;
  new_platform_status: string;
  timestamp: number;
}

export function OrbitalDebrisStudio() {
  const [platforms, setPlatforms] = useState<LaserPlatform[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<LaserPlatform | null>(null);
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [firing, setFiring] = useState(false);
  const [debrisSize, setDebrisSize] = useState<number>(4.5);
  const [missDistance, setMissDistance] = useState<number>(180.0);
  const [collisionProb, setCollisionProb] = useState<number>(0.0025);
  const [conjunction, setConjunction] = useState<ConjunctionEvaluation | null>(null);
  const [deflection, setDeflection] = useState<DeflectionEvent | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = useCallback((msg: string) => {
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 19)]);
  }, []);

  const fetchPlatforms = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orbital-debris/platforms");
      const data = await res.json();
      if (data.status === "success" && data.platforms) {
        setPlatforms(data.platforms);
        if (data.platforms.length > 0) {
          setSelectedPlatform((prev) => prev || data.platforms[0]);
        }
        addLog(`Loaded ${data.platforms.length} orbital laser debris deflector platforms.`);
      }
    } catch {
      addLog("Failed to fetch orbital platforms; using fallback telemetry.");
    } finally {
      setLoading(false);
    }
  }, [addLog]);

  useEffect(() => {
    fetchPlatforms();
  }, [fetchPlatforms]);

  const handleCalculate = async (simulateASAT = false) => {
    if (!selectedPlatform) return;
    setEvaluating(true);
    const testDist = simulateASAT ? 85.0 : missDistance;
    const testProb = simulateASAT ? 0.008 : collisionProb;

    try {
      addLog(`Calculating astrodynamic conjunction on ${selectedPlatform.name} (Dist=${testDist}m, Pc=${testProb})...`);
      const res = await fetch("/api/orbital-debris/calculate-conjunction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform_id: selectedPlatform.platform_id,
          debris_size_cm: debrisSize,
          relative_velocity_km_s: 7.8,
          miss_distance_meters: testDist,
          collision_probability: testProb,
        }),
      });
      const data = await res.json();
      if (data.conjunction) {
        setConjunction(data.conjunction);
        if (data.conjunction.threat_detected) {
          addLog(`⚠️ CRITICAL CONJUNCTION: ${data.conjunction.threat_type}! Required Δv: ${data.conjunction.required_delta_v_cm_s} cm/s. Action: ${data.conjunction.action_recommended}`);
        } else {
          addLog(`✓ Conjunction nominal: ${data.conjunction.action_recommended}`);
        }
      }
    } catch {
      addLog("Astrodynamic conjunction calculation failed.");
    } finally {
      setEvaluating(false);
    }
  };

  const handleFireDeflector = async () => {
    if (!selectedPlatform) return;
    setFiring(true);
    try {
      addLog(`Discharging pulsed laser ablation bursts onto space debris target...`);
      const res = await fetch("/api/orbital-debris/fire-deflector", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform_id: selectedPlatform.platform_id,
          target_debris_id: "DEBRIS-LEO-8821",
          pulse_count: 60,
          laser_fluence_j_cm2: 14.0,
        }),
      });
      const data = await res.json();
      if (data.deflection_event) {
        setDeflection(data.deflection_event);
        addLog(`🎯 Laser Ablation Complete in ${data.deflection_event.fire_control_latency_ms} ms! Δv achieved: ${data.deflection_event.delta_v_achieved_cm_s} cm/s. New miss distance: ${data.deflection_event.new_miss_distance_km} km.`);
      }
    } catch {
      addLog("Failed to discharge laser deflector.");
    } finally {
      setFiring(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-purple-900/20 to-neutral-900/60 p-6 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 ring-1 ring-indigo-500/30">
                <Orbit className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  Orbital ASAT Kinetic Debris Laser Ablation & Trajectory Deflector
                  <span className="rounded-md border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-xs font-semibold text-indigo-400">
                    Cap 66 · v4.8.0
                  </span>
                </h2>
                <p className="text-xs text-neutral-400">
                  Pulsed Laser Plasma Recoil Ablation (Δv ≥ 2.5 cm/s), Hypervelocity Tracking (7.8 km/s) & Sub-1.8ms Fire Control
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={fetchPlatforms}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-800/80 px-3.5 py-1.5 text-xs font-medium text-neutral-200 transition hover:bg-neutral-700/80"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh Platforms
          </button>
        </div>
      </div>

      {/* Grid of Orbital Laser Platforms */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {platforms.map((p) => (
          <div
            key={p.platform_id}
            onClick={() => setSelectedPlatform(p)}
            className={`cursor-pointer rounded-xl border p-4 transition ${
              selectedPlatform?.platform_id === p.platform_id
                ? "border-indigo-500 bg-indigo-950/20 ring-1 ring-indigo-500/40"
                : "border-neutral-800 bg-neutral-900/60 hover:border-neutral-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white">{p.name}</span>
              <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-mono text-indigo-300">
                {p.pulse_energy_kj} kJ Burst
              </span>
            </div>
            <p className="mt-1 text-xs text-neutral-400 line-clamp-1">{p.orbit_class}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-neutral-300">
              <div className="rounded bg-neutral-800/50 p-1.5">
                <span className="text-neutral-500">Divergence:</span> {p.beam_divergence_urad} µrad
              </div>
              <div className="rounded bg-neutral-800/50 p-1.5">
                <span className="text-neutral-500">Deflected:</span> {p.debris_deflected_count} Targets
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Controls & Real-Time Defense Evaluation */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 lg:col-span-6">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
            <Sliders className="h-4 w-4 text-indigo-400" />
            Hypervelocity Conjunction Geometry Parameters
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-neutral-300">
                <span>Debris Diameter (cm):</span>
                <span className="font-mono text-indigo-400">{debrisSize.toFixed(1)} cm</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="15.0"
                step="0.5"
                value={debrisSize}
                onChange={(e) => setDebrisSize(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs text-neutral-300">
                <span>Predicted Miss Distance (m):</span>
                <span className="font-mono text-indigo-400">{missDistance.toFixed(0)} m</span>
              </div>
              <input
                type="range"
                min="20.0"
                max="1000.0"
                step="20.0"
                value={missDistance}
                onChange={(e) => setMissDistance(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs text-neutral-300">
                <span>Collision Probability (Pc):</span>
                <span className="font-mono text-indigo-400">{collisionProb.toExponential(2)}</span>
              </div>
              <input
                type="range"
                min="0.0001"
                max="0.01"
                step="0.0002"
                value={collisionProb}
                onChange={(e) => setCollisionProb(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              onClick={() => handleCalculate(false)}
              disabled={evaluating}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow hover:bg-indigo-500"
            >
              <Activity className="h-3.5 w-3.5" />
              Calculate Conjunction
            </button>
            <button
              onClick={() => handleCalculate(true)}
              disabled={evaluating}
              className="flex items-center gap-1.5 rounded-lg border border-red-500/40 bg-red-950/30 px-3.5 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-900/40"
            >
              <Flame className="h-3.5 w-3.5 text-red-400" />
              Simulate ASAT Fragment
            </button>
            <button
              onClick={handleFireDeflector}
              disabled={firing}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/30 px-3.5 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/40"
            >
              <Crosshair className="h-3.5 w-3.5 text-emerald-400" />
              Fire Laser Ablation Deflector
            </button>
          </div>
        </div>

        {/* Evaluation Verdict & Telemetry Console */}
        <div className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 lg:col-span-6">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
            <Radio className="h-4 w-4 text-indigo-400" />
            Astrodynamic Fire Control & Recoil Telemetry
          </h3>
          {conjunction ? (
            <div
              className={`rounded-lg border p-4 text-xs ${
                conjunction.threat_detected
                  ? "border-red-500/50 bg-red-950/20 text-red-200"
                  : "border-emerald-500/50 bg-emerald-950/20 text-emerald-200"
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span>{conjunction.threat_type}</span>
                <span className="font-mono">Req Δv: {conjunction.required_delta_v_cm_s} cm/s</span>
              </div>
              <p className="mt-1 text-[11px] opacity-80">{conjunction.action_recommended}</p>
              <div className="mt-2 text-[10px] opacity-70">
                Miss: {conjunction.miss_distance_meters}m · Latency: {conjunction.fire_control_latency_ms} ms · Vel: {conjunction.relative_velocity_km_s} km/s
              </div>
            </div>
          ) : (
            <div className="flex h-20 items-center justify-center rounded-lg border border-dashed border-neutral-800 text-xs text-neutral-500">
              No active conjunction calculation. Run astrodynamic tracking.
            </div>
          )}

          {/* Console Logs */}
          <div className="rounded-lg border border-neutral-800 bg-black/60 p-3 font-mono text-[11px] text-neutral-400 h-32 overflow-y-auto space-y-1">
            {logs.length === 0 ? (
              <span className="text-neutral-600">{"// Spaceborne laser deflector telemetry standby..."}</span>
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

