"use client";

import React, { useEffect, useState } from "react";
import { Atom, RefreshCw, Zap, Activity } from "lucide-react";

interface MagnetopauseVortex {
  vortex_id: string;
  standoff_distance_re: string;
  shear_velocity_kms: number;
  nominal_baseload_gw: number;
  vortex_state: string;
}

interface MagnetopauseMetrics {
  active_vortices_count: number;
  harvest_events_total: number;
  total_baseload_dispatch_gw: number;
  mean_kh_coupling_efficiency_pct: number;
  kh_coupling_status: string;
}

interface MagnetopauseDispatchResult {
  vortex_id: string;
  status: string;
  kh_coupling_state: string;
  harvested_power_gw: number;
  vortex_flux_mw: number;
  grid_stability_pct: number;
}

export function MagnetopauseVortexStudio() {
  const [vortices, setVortices] = useState<MagnetopauseVortex[]>([]);
  const [metrics, setMetrics] = useState<MagnetopauseMetrics | null>(null);
  const [selectedId, setSelectedId] = useState("MAGNETOPAUSE-KH-DAWN-01");
  const [vortexMultiplier, setVortexMultiplier] = useState(1.05);
  const [khEfficiency, setKhEfficiency] = useState(0.993);
  const [dispatchDuration, setDispatchDuration] = useState(60.0);
  const [result, setResult] = useState<MagnetopauseDispatchResult | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [vRes, mRes] = await Promise.all([
        fetch("/api/planetary-magnetopause/vortices"),
        fetch("/api/planetary-magnetopause/metrics"),
      ]);
      if (vRes.ok) {
        const vData = await vRes.json();
        setVortices(vData.vortices || []);
      }
      if (mRes.ok) {
        setMetrics(await mRes.json());
      }
    } catch (err) {
      console.error("Failed to load Magnetopause Supergrid telemetry", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleHarvest = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/planetary-magnetopause/harvest-magnetopause-power", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vortex_id: selectedId,
          vortex_multiplier: vortexMultiplier,
          kh_efficiency: khEfficiency,
          dispatch_duration_s: dispatchDuration,
        }),
      });
      if (res.ok) {
        setResult(await res.json());
        await loadData();
      }
    } catch (err) {
      console.error("Magnetopause power dispatch failed", err);
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
              Planetary Magnetopause Kelvin-Helmholtz Vortex &amp; Bow-Shock Supergrid
            </h2>
            <p className="text-xs text-slate-400">
              Option B Wave 73 · Dawn/Dusk Flank 10.5–16.0 R_E Shear Tap (10.840 GW Baseload)
            </p>
          </div>
        </div>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-300 hover:bg-cyan-500/20"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh Vortices
        </button>
      </div>

      {metrics && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="text-xs text-slate-400">Active Vortices</div>
            <div className="mt-1 text-xl font-bold text-cyan-300">{metrics.active_vortices_count}</div>
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
            <div className="text-xs text-slate-400">KH Coupling</div>
            <div className="mt-1 text-sm font-semibold text-cyan-300">{metrics.kh_coupling_status}</div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-cyan-300">
            <Zap className="h-4 w-4" /> Dispatch Magnetopause KH Power
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-slate-400">Magnetopause Vortex</label>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              >
                {vortices.map((v) => (
                  <option key={v.vortex_id} value={v.vortex_id}>
                    {v.vortex_id} ({v.standoff_distance_re})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">Vortex Multiplier</label>
              <input
                type="number"
                step="0.01"
                value={vortexMultiplier}
                onChange={(e) => setVortexMultiplier(Number(e.target.value))}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">KH Efficiency</label>
              <input
                type="number"
                step="0.001"
                value={khEfficiency}
                onChange={(e) => setKhEfficiency(Number(e.target.value))}
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
            {loading ? "Harvesting KH Vortex Flux..." : "Harvest Magnetopause Vortex Baseload"}
          </button>

          {result && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/30 p-3 text-xs">
              <div className="flex items-center gap-2 font-semibold text-emerald-300">
                <Activity className="h-4 w-4" /> {result.status} ({result.kh_coupling_state})
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] text-slate-400">
                <span>Dispatch: {result.harvested_power_gw.toFixed(3)} GW</span>
                <span>Flux: {result.vortex_flux_mw.toFixed(1)} MW</span>
                <span>Stability: {result.grid_stability_pct.toFixed(3)}%</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <h3 className="text-sm font-semibold text-cyan-300">Magnetopause Flank Vortices</h3>
          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {vortices.map((v) => (
              <div
                key={v.vortex_id}
                className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs"
              >
                <div>
                  <div className="font-semibold text-white">{v.vortex_id}</div>
                  <div className="text-[11px] text-slate-400">
                    {v.standoff_distance_re} · {v.shear_velocity_kms} km/s · {v.nominal_baseload_gw.toFixed(2)} GW
                  </div>
                </div>
                <span className="rounded bg-cyan-500/20 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">
                  {v.vortex_state}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
