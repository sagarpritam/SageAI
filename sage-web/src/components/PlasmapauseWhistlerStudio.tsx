"use client";

import React, { useEffect, useState } from "react";
import { Atom, RefreshCw, Zap, Activity } from "lucide-react";

interface WaveguideRecord {
  waveguide_id: string;
  l_shell_boundary: string;
  whistler_freq_khz: number;
  nominal_baseload_gw: number;
  waveguide_state: string;
}

interface PlasmapauseMetrics {
  active_waveguides_count: number;
  harvest_events_total: number;
  total_baseload_dispatch_gw: number;
  mean_waveguide_efficiency_pct: number;
  whistler_coupling_status: string;
}

interface PlasmapauseDispatchResult {
  waveguide_id: string;
  status: string;
  whistler_coupling_state: string;
  harvested_power_gw: number;
  chorus_flux_mw: number;
  grid_stability_pct: number;
}

export function PlasmapauseWhistlerStudio() {
  const [waveguides, setWaveguides] = useState<WaveguideRecord[]>([]);
  const [metrics, setMetrics] = useState<PlasmapauseMetrics | null>(null);
  const [selectedId, setSelectedId] = useState("PLASMAPAUSE-CHORUS-01");
  const [whistlerMultiplier, setWhistlerMultiplier] = useState(1.05);
  const [waveguideEfficiency, setWaveguideEfficiency] = useState(0.996);
  const [dispatchDuration, setDispatchDuration] = useState(60.0);
  const [result, setResult] = useState<PlasmapauseDispatchResult | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [wRes, mRes] = await Promise.all([
        fetch("/api/planetary-plasmapause/waveguides"),
        fetch("/api/planetary-plasmapause/metrics"),
      ]);
      if (wRes.ok) {
        const wData = await wRes.json();
        setWaveguides(wData.waveguides || []);
      }
      if (mRes.ok) {
        setMetrics(await mRes.json());
      }
    } catch (err) {
      console.error("Failed to load Plasmapause Supergrid telemetry", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleHarvest = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/planetary-plasmapause/harvest-plasmapause-power", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          waveguide_id: selectedId,
          whistler_multiplier: whistlerMultiplier,
          waveguide_efficiency: waveguideEfficiency,
          dispatch_duration_s: dispatchDuration,
        }),
      });
      if (res.ok) {
        setResult(await res.json());
        await loadData();
      }
    } catch (err) {
      console.error("Plasmapause power dispatch failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 rounded-xl border border-cyan-500/30 bg-slate-950/80 p-6 text-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-cyan-500/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-cyan-500/20 p-2.5 text-cyan-400">
            <Atom className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              Planetary Magnetospheric Plasmapause &amp; Whistler-Mode Chorus Supergrid
            </h2>
            <p className="text-xs text-slate-400">
              Option B Wave 77 · Plasmapause L = 2.8–6.8 Whistler Waveguide Tap (11.960 GW Baseload)
            </p>
          </div>
        </div>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-300 hover:bg-cyan-500/20"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh Waveguides
        </button>
      </div>

      {metrics && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="text-xs text-slate-400">Active Waveguides</div>
            <div className="mt-1 text-xl font-bold text-cyan-300">{metrics.active_waveguides_count}</div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="text-xs text-slate-400">Nominal Baseload</div>
            <div className="mt-1 text-xl font-bold text-emerald-400">
              {metrics.total_baseload_dispatch_gw.toFixed(3)} GW
            </div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="text-xs text-slate-400">Harvest Events</div>
            <div className="mt-1 text-xl font-bold text-white">{metrics.harvest_events_total}</div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="text-xs text-slate-400">Whistler Coupling</div>
            <div className="mt-1 text-sm font-semibold text-cyan-300">{metrics.whistler_coupling_status}</div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-cyan-300">
            <Zap className="h-4 w-4" /> Dispatch Plasmapause Whistler Power
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-slate-400">Plasmapause Waveguide</label>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              >
                {waveguides.map((w) => (
                  <option key={w.waveguide_id} value={w.waveguide_id}>
                    {w.waveguide_id} ({w.l_shell_boundary})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">Whistler Multiplier</label>
              <input
                type="number"
                step="0.01"
                value={whistlerMultiplier}
                onChange={(e) => setWhistlerMultiplier(Number(e.target.value))}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">Waveguide Efficiency</label>
              <input
                type="number"
                step="0.001"
                value={waveguideEfficiency}
                onChange={(e) => setWaveguideEfficiency(Number(e.target.value))}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">Duration (s)</label>
              <input
                type="number"
                value={dispatchDuration}
                onChange={(e) => setDispatchDuration(Number(e.target.value))}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              />
            </div>
          </div>
          <button
            onClick={handleHarvest}
            disabled={loading}
            className="w-full rounded-lg bg-cyan-600 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-500 disabled:opacity-50"
          >
            {loading ? "Harvesting Whistler Chorus..." : "Harvest Plasmapause Whistler Baseload"}
          </button>

          {result && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/30 p-3 text-xs">
              <div className="flex items-center gap-2 font-semibold text-emerald-300">
                <Activity className="h-4 w-4" /> {result.status} ({result.whistler_coupling_state})
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] text-slate-400">
                <span>Dispatch: {result.harvested_power_gw.toFixed(3)} GW</span>
                <span>Flux: {result.chorus_flux_mw.toFixed(1)} MW</span>
                <span>Stability: {result.grid_stability_pct.toFixed(3)}%</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <h3 className="text-sm font-semibold text-cyan-300">Plasmapause Whistler Waveguides</h3>
          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {waveguides.map((w) => (
              <div
                key={w.waveguide_id}
                className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs"
              >
                <div>
                  <div className="font-semibold text-white">{w.waveguide_id}</div>
                  <div className="text-[11px] text-slate-400">
                    {w.l_shell_boundary} · {w.whistler_freq_khz} kHz · {w.nominal_baseload_gw.toFixed(2)} GW
                  </div>
                </div>
                <span className="rounded bg-cyan-500/20 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">
                  {w.waveguide_state}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
