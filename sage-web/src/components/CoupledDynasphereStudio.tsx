"use client";

import React, { useState, useEffect } from "react";
import { Zap, Activity, RefreshCw, Radio, Globe, ShieldCheck, Flame } from "lucide-react";

interface DynasphereNode {
  node_id: string;
  name: string;
  standing_wave_mode: string;
  depth_km: number;
  pressure_gpa: number;
  temperature_k: number;
  resonant_frequency_mhz: number;
  nominal_capacity_gw: number;
  standing_wave_flux_mw: number;
  dynasphere_resonance_state: string;
  telluric_waveguide_efficiency_pct: number;
}

interface DynasphereTelemetry {
  node_id: string;
  status: string;
  harvested_power_gw: number;
  standing_wave_flux_mw: number;
  resonant_frequency_mhz: number;
  standing_wave_mode: string;
  core_depth_span_km: number;
  central_pressure_gpa: number;
  telluric_waveguide_efficiency_pct: number;
  grid_stability_pct: number;
  dispatch_duration_s: number;
  dynasphere_resonance_state: string;
  timestamp: number;
}

export function CoupledDynasphereStudio() {
  const [nodes, setNodes] = useState<DynasphereNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<string>("");
  const [resonanceMultiplier, setResonanceMultiplier] = useState<number>(1.05);
  const [waveguideEfficiency, setWaveguideEfficiency] = useState<number>(0.96);
  const [dispatchDuration, setDispatchDuration] = useState<number>(60.0);
  const [telemetry, setTelemetry] = useState<DynasphereTelemetry | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNodes = async () => {
    try {
      const res = await fetch("/api/planetary-coupled-dynasphere-resonance/nodes");
      if (!res.ok) throw new Error("Failed to fetch dynasphere nodes");
      const data = await res.json();
      setNodes(data.nodes || []);
      if (data.nodes?.length > 0 && !selectedNode) {
        setSelectedNode(data.nodes[0].node_id);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error fetching nodes");
    }
  };

  useEffect(() => {
    fetchNodes();
  }, []);

  const harvestPower = async () => {
    if (!selectedNode) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/planetary-coupled-dynasphere-resonance/harvest-dynasphere-resonance-power", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          node_id: selectedNode,
          resonance_multiplier_override: resonanceMultiplier,
          telluric_waveguide_efficiency: waveguideEfficiency,
          dispatch_duration_s: dispatchDuration,
        }),
      });
      if (!res.ok) throw new Error("Dynasphere resonance power dispatch failed");
      const data = await res.json();
      setTelemetry(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error harvesting dynasphere power");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 shadow-2xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 text-orange-400 rounded-lg border border-orange-500/20">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Planetary Coupled Dynasphere Resonance Supergrid
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                Option B Wave 60
              </span>
            </h2>
            <p className="text-sm text-slate-400">
              Whole-Earth core-column harmonic standing wave resonance (0.1–10 mHz Bullen modes 0S2 / 0T2) &amp; telluric waveguide baseload dispatch (8.000 GW)
            </p>
          </div>
        </div>
        <button
          onClick={fetchNodes}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm border border-slate-700 transition"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 flex items-center gap-3">
          <Radio className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Dynasphere Core Coupler Node
            </label>
            <select
              value={selectedNode}
              onChange={(e) => setSelectedNode(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {nodes.map((n) => (
                <option key={n.node_id} value={n.node_id}>
                  {n.name} ({n.standing_wave_mode})
                </option>
              ))}
            </select>
          </div>

          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Resonance Multiplier: {resonanceMultiplier.toFixed(2)}x
              </label>
              <input
                type="range"
                min="0.90"
                max="1.50"
                step="0.01"
                value={resonanceMultiplier}
                onChange={(e) => setResonanceMultiplier(parseFloat(e.target.value))}
                className="w-full accent-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Telluric Waveguide Efficiency: {(waveguideEfficiency * 100).toFixed(1)}%
              </label>
              <input
                type="range"
                min="0.80"
                max="0.99"
                step="0.01"
                value={waveguideEfficiency}
                onChange={(e) => setWaveguideEfficiency(parseFloat(e.target.value))}
                className="w-full accent-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Dispatch Duration: {dispatchDuration.toFixed(0)} s
              </label>
              <input
                type="range"
                min="10"
                max="300"
                step="10"
                value={dispatchDuration}
                onChange={(e) => setDispatchDuration(parseFloat(e.target.value))}
                className="w-full accent-orange-500"
              />
            </div>
          </div>

          <button
            onClick={harvestPower}
            disabled={loading || !selectedNode}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 disabled:opacity-50 text-white font-medium rounded-lg shadow-lg shadow-orange-900/30 transition"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" /> Coupler Synchronizing...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" /> Dispatch 8.000 GW Baseload
              </>
            )}
          </button>
        </div>

        <div className="lg:col-span-2">
          {telemetry ? (
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-5 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Resonance Telemetry
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  <Flame className="w-3.5 h-3.5" /> {telemetry.status}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-xs text-slate-400 block mb-1">Harvested Power</span>
                  <span className="text-lg font-bold text-orange-400">
                    {telemetry.harvested_power_gw.toFixed(3)} GW
                  </span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-xs text-slate-400 block mb-1">Standing Wave Flux</span>
                  <span className="text-lg font-bold text-amber-400">
                    {telemetry.standing_wave_flux_mw.toFixed(1)} MW
                  </span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-xs text-slate-400 block mb-1">Bullen Resonant Freq</span>
                  <span className="text-lg font-bold text-emerald-400">
                    {telemetry.resonant_frequency_mhz.toFixed(2)} mHz
                  </span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-xs text-slate-400 block mb-1">Grid Stability</span>
                  <span className="text-lg font-bold text-cyan-400">
                    {telemetry.grid_stability_pct.toFixed(2)}%
                  </span>
                </div>
              </div>

              <div className="space-y-3 bg-slate-900/60 p-4 rounded-lg border border-slate-800">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-orange-400" />
                  Whole-Earth Dynasphere Coupler Core Parameters
                </h4>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div className="text-slate-400">Harmonic Mode:</div>
                  <div className="text-slate-200 font-mono text-right">{telemetry.standing_wave_mode}</div>

                  <div className="text-slate-400">Core Depth Span:</div>
                  <div className="text-slate-200 font-mono text-right">{telemetry.core_depth_span_km} km</div>

                  <div className="text-slate-400">Central Pressure:</div>
                  <div className="text-slate-200 font-mono text-right">{telemetry.central_pressure_gpa} GPa</div>

                  <div className="text-slate-400">Telluric Waveguide Efficiency:</div>
                  <div className="text-orange-400 font-semibold text-right">
                    {telemetry.telluric_waveguide_efficiency_pct.toFixed(1)}%
                  </div>

                  <div className="text-slate-400">Dynasphere Harmonic State:</div>
                  <div className="text-emerald-400 font-semibold text-right flex items-center justify-end gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> {telemetry.dynasphere_resonance_state}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-slate-800/20 border border-dashed border-slate-700/50 rounded-lg p-12 text-center text-slate-500">
              <Globe className="w-12 h-12 mb-3 text-slate-600" />
              <p className="text-base font-medium text-slate-400">No Dynasphere Node Dispatched</p>
              <p className="text-sm">Select a Whole-Earth node and initiate 8.000 GW harmonic resonance dispatch</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
