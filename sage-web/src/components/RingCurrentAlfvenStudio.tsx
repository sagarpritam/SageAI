"use client";

import React, { useEffect, useState } from "react";
import { Atom, RefreshCw, Zap, Activity } from "lucide-react";

interface RingCurrentTorus {
  torus_id: string;
  l_shell_range: string;
  ring_current_ma: number;
  plasmasphere_density_cm3: number;
  nominal_baseload_gw: number;
  alfven_maser_state: string;
}

interface RingCurrentMetrics {
  active_tori_count: number;
  total_dispatches: number;
  nominal_baseload_gw: number;
  cumulative_harvested_mwh: number;
  alfven_coupling_status: string;
}

interface RingCurrentDispatchResult {
  torus_id: string;
  status: string;
  alfven_coupling_state: string;
  harvested_power_gw: number;
  harvested_energy_mwh: number;
  grid_stability_pct: number;
  detail: string;
}

export function RingCurrentAlfvenStudio() {
  const [tori, setTori] = useState<RingCurrentTorus[]>([]);
  const [metrics, setMetrics] = useState<RingCurrentMetrics | null>(null);
  const [selectedId, setSelectedId] = useState("RING-CURRENT-TORUS-01");
  const [alfvenMultiplier, setAlfvenMultiplier] = useState(1.05);
  const [alfvenEfficiency, setAlfvenEfficiency] = useState(0.991);
  const [dispatchDuration, setDispatchDuration] = useState(60.0);
  const [result, setResult] = useState<RingCurrentDispatchResult | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [tRes, mRes] = await Promise.all([
        fetch("/api/planetary-ring-current/tori"),
        fetch("/api/planetary-ring-current/metrics"),
      ]);
      if (tRes.ok) {
        const tData = await tRes.json();
        setTori(tData.tori || []);
      }
      if (mRes.ok) {
        setMetrics(await mRes.json());
      }
    } catch (err) {
      console.error("Failed to load Ring-Current Supergrid telemetry", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleHarvest = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/planetary-ring-current/harvest-ring-current-power", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          torus_id: selectedId,
          alfven_multiplier: alfvenMultiplier,
          alfven_efficiency: alfvenEfficiency,
          dispatch_duration_s: dispatchDuration,
        }),
      });
      if (res.ok) {
        setResult(await res.json());
        await loadData();
      }
    } catch (err) {
      console.error("Ring-Current power dispatch failed", err);
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
              Planetary Ring-Current &amp; Plasmasphere Alfvén Maser Supergrid
            </h2>
            <p className="text-xs text-slate-400">
              Option B Wave 71 · Equatorial L-Shell 3.0–6.5 Ion-Cyclotron Power Tap (10.320 GW Baseload)
            </p>
          </div>
        </div>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-300 hover:bg-cyan-500/20"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh Tori
        </button>
      </div>

      {metrics && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="text-xs text-slate-400">Active Tori</div>
            <div className="mt-1 text-xl font-bold text-cyan-300">{metrics.active_tori_count}</div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="text-xs text-slate-400">Nominal Baseload</div>
            <div className="mt-1 text-xl font-bold text-emerald-400">
              {metrics.nominal_baseload_gw.toFixed(3)} GW
            </div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="text-xs text-slate-400">Cumulative Energy</div>
            <div className="mt-1 text-xl font-bold text-white">
              {metrics.cumulative_harvested_mwh.toFixed(2)} MWh
            </div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="text-xs text-slate-400">Alfvén Coupling</div>
            <div className="mt-1 text-sm font-semibold text-cyan-300">{metrics.alfven_coupling_status}</div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-cyan-300">
            <Zap className="h-4 w-4" /> Dispatch Ring-Current Alfvén Power
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-slate-400">Ring-Current Torus</label>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              >
                {tori.map((t) => (
                  <option key={t.torus_id} value={t.torus_id}>
                    {t.torus_id} ({t.l_shell_range})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">Alfvén Multiplier</label>
              <input
                type="number"
                step="0.01"
                value={alfvenMultiplier}
                onChange={(e) => setAlfvenMultiplier(Number(e.target.value))}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">Maser Efficiency</label>
              <input
                type="number"
                step="0.001"
                value={alfvenEfficiency}
                onChange={(e) => setAlfvenEfficiency(Number(e.target.value))}
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
            {loading ? "Harvesting Ring-Current Power..." : "Harvest Ring-Current Alfvén Baseload"}
          </button>

          {result && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/30 p-3 text-xs">
              <div className="flex items-center gap-2 font-semibold text-emerald-300">
                <Activity className="h-4 w-4" /> {result.status} ({result.alfven_coupling_state})
              </div>
              <div className="mt-1 text-slate-300">{result.detail}</div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] text-slate-400">
                <span>Dispatch: {result.harvested_power_gw.toFixed(3)} GW</span>
                <span>Energy: {result.harvested_energy_mwh.toFixed(2)} MWh</span>
                <span>Stability: {result.grid_stability_pct.toFixed(2)}%</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <h3 className="text-sm font-semibold text-cyan-300">Plasmasphere &amp; Ring-Current Tori</h3>
          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {tori.map((t) => (
              <div
                key={t.torus_id}
                className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs"
              >
                <div>
                  <div className="font-semibold text-white">{t.torus_id}</div>
                  <div className="text-[11px] text-slate-400">
                    {t.l_shell_range} · {t.ring_current_ma} MA · {t.nominal_baseload_gw.toFixed(2)} GW
                  </div>
                </div>
                <span className="rounded bg-cyan-500/20 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">
                  {t.alfven_maser_state}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
