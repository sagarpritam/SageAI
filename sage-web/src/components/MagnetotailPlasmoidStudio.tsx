"use client";

import React, { useEffect, useState } from "react";
import { Atom, RefreshCw, Zap, Activity } from "lucide-react";

interface MagnetotailLobe {
  lobe_id: string;
  tail_distance_re: string;
  reconnection_rate_mv_m: number;
  nominal_baseload_gw: number;
  plasmoid_state: string;
}

interface MagnetotailMetrics {
  active_lobes_count: number;
  harvest_events_total: number;
  total_baseload_dispatch_gw: number;
  mean_reconnection_efficiency_pct: number;
  plasmoid_coupling_status: string;
}

interface MagnetotailDispatchResult {
  lobe_id: string;
  status: string;
  plasmoid_coupling_state: string;
  harvested_power_gw: number;
  plasmoid_flux_mw: number;
  grid_stability_pct: number;
}

export function MagnetotailPlasmoidStudio() {
  const [lobes, setLobes] = useState<MagnetotailLobe[]>([]);
  const [metrics, setMetrics] = useState<MagnetotailMetrics | null>(null);
  const [selectedId, setSelectedId] = useState("MAGNETOTAIL-XLINE-01");
  const [plasmoidMultiplier, setPlasmoidMultiplier] = useState(1.05);
  const [reconnectionEfficiency, setReconnectionEfficiency] = useState(0.992);
  const [dispatchDuration, setDispatchDuration] = useState(60.0);
  const [result, setResult] = useState<MagnetotailDispatchResult | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [lRes, mRes] = await Promise.all([
        fetch("/api/planetary-magnetotail/lobes"),
        fetch("/api/planetary-magnetotail/metrics"),
      ]);
      if (lRes.ok) {
        const lData = await lRes.json();
        setLobes(lData.lobes || []);
      }
      if (mRes.ok) {
        setMetrics(await mRes.json());
      }
    } catch (err) {
      console.error("Failed to load Magnetotail Supergrid telemetry", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleHarvest = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/planetary-magnetotail/harvest-magnetotail-power", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lobe_id: selectedId,
          plasmoid_multiplier: plasmoidMultiplier,
          reconnection_efficiency: reconnectionEfficiency,
          dispatch_duration_s: dispatchDuration,
        }),
      });
      if (res.ok) {
        setResult(await res.json());
        await loadData();
      }
    } catch (err) {
      console.error("Magnetotail power dispatch failed", err);
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
              Planetary Magnetotail Reconnection &amp; Plasmoid Flux-Rope Supergrid
            </h2>
            <p className="text-xs text-slate-400">
              Option B Wave 72 · Nightside X-Line 22–120 R_E Reconnection Tap (10.580 GW Baseload)
            </p>
          </div>
        </div>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-300 hover:bg-cyan-500/20"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh Lobes
        </button>
      </div>

      {metrics && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="text-xs text-slate-400">Active Tail Lobes</div>
            <div className="mt-1 text-xl font-bold text-cyan-300">{metrics.active_lobes_count}</div>
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
            <div className="text-xs text-slate-400">Plasmoid Coupling</div>
            <div className="mt-1 text-sm font-semibold text-cyan-300">{metrics.plasmoid_coupling_status}</div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-cyan-300">
            <Zap className="h-4 w-4" /> Dispatch Magnetotail Plasmoid Power
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-slate-400">Magnetotail Lobe</label>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              >
                {lobes.map((l) => (
                  <option key={l.lobe_id} value={l.lobe_id}>
                    {l.lobe_id} ({l.tail_distance_re})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">Plasmoid Multiplier</label>
              <input
                type="number"
                step="0.01"
                value={plasmoidMultiplier}
                onChange={(e) => setPlasmoidMultiplier(Number(e.target.value))}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">Reconnection Efficiency</label>
              <input
                type="number"
                step="0.001"
                value={reconnectionEfficiency}
                onChange={(e) => setReconnectionEfficiency(Number(e.target.value))}
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
            {loading ? "Harvesting Magnetotail Flux..." : "Harvest Magnetotail Plasmoid Baseload"}
          </button>

          {result && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/30 p-3 text-xs">
              <div className="flex items-center gap-2 font-semibold text-emerald-300">
                <Activity className="h-4 w-4" /> {result.status} ({result.plasmoid_coupling_state})
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] text-slate-400">
                <span>Dispatch: {result.harvested_power_gw.toFixed(3)} GW</span>
                <span>Flux: {result.plasmoid_flux_mw.toFixed(1)} MW</span>
                <span>Stability: {result.grid_stability_pct.toFixed(3)}%</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <h3 className="text-sm font-semibold text-cyan-300">Nightside Reconnection Lobes</h3>
          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {lobes.map((l) => (
              <div
                key={l.lobe_id}
                className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs"
              >
                <div>
                  <div className="font-semibold text-white">{l.lobe_id}</div>
                  <div className="text-[11px] text-slate-400">
                    {l.tail_distance_re} · {l.reconnection_rate_mv_m} mV/m · {l.nominal_baseload_gw.toFixed(2)} GW
                  </div>
                </div>
                <span className="rounded bg-cyan-500/20 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">
                  {l.plasmoid_state}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
