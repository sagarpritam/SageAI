"use client";

import React, { useEffect, useState } from "react";
import { Atom, RefreshCw, Zap, Activity } from "lucide-react";

interface AkrCavity {
  cavity_id: string;
  altitude_km: string;
  cyclotron_freq_khz: number;
  nominal_baseload_gw: number;
  cavity_state: string;
}

interface AkrMetrics {
  active_cavities_count: number;
  harvest_events_total: number;
  total_baseload_dispatch_gw: number;
  mean_maser_efficiency_pct: number;
  akr_coupling_status: string;
}

interface AkrDispatchResult {
  cavity_id: string;
  status: string;
  akr_coupling_state: string;
  harvested_power_gw: number;
  akr_flux_mw: number;
  grid_stability_pct: number;
}

export function AuroralAkrMaserStudio() {
  const [cavities, setCavities] = useState<AkrCavity[]>([]);
  const [metrics, setMetrics] = useState<AkrMetrics | null>(null);
  const [selectedId, setSelectedId] = useState("AKR-CAVITY-BOREAL-01");
  const [maserMultiplier, setMaserMultiplier] = useState(1.05);
  const [maserEfficiency, setMaserEfficiency] = useState(0.995);
  const [dispatchDuration, setDispatchDuration] = useState(60.0);
  const [result, setResult] = useState<AkrDispatchResult | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [cRes, mRes] = await Promise.all([
        fetch("/api/planetary-akr-maser/cavities"),
        fetch("/api/planetary-akr-maser/metrics"),
      ]);
      if (cRes.ok) {
        const cData = await cRes.json();
        setCavities(cData.cavities || []);
      }
      if (mRes.ok) {
        setMetrics(await mRes.json());
      }
    } catch (err) {
      console.error("Failed to load AKR Maser Supergrid telemetry", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleHarvest = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/planetary-akr-maser/harvest-akr-power", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cavity_id: selectedId,
          maser_multiplier: maserMultiplier,
          maser_efficiency: maserEfficiency,
          dispatch_duration_s: dispatchDuration,
        }),
      });
      if (res.ok) {
        setResult(await res.json());
        await loadData();
      }
    } catch (err) {
      console.error("AKR Maser power dispatch failed", err);
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
              Planetary Auroral Kilometric Radiation &amp; Electron-Cyclotron Maser Supergrid
            </h2>
            <p className="text-xs text-slate-400">
              Option B Wave 75 · Auroral Cavity 4,500–18,000 km Cyclotron Maser Tap (11.400 GW Baseload)
            </p>
          </div>
        </div>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-300 hover:bg-cyan-500/20"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh Cavities
        </button>
      </div>

      {metrics && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="text-xs text-slate-400">Active Cavities</div>
            <div className="mt-1 text-xl font-bold text-cyan-300">{metrics.active_cavities_count}</div>
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
            <div className="text-xs text-slate-400">AKR Coupling</div>
            <div className="mt-1 text-sm font-semibold text-cyan-300">{metrics.akr_coupling_status}</div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-cyan-300">
            <Zap className="h-4 w-4" /> Dispatch Auroral AKR Maser Power
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-slate-400">Auroral Cavity</label>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              >
                {cavities.map((c) => (
                  <option key={c.cavity_id} value={c.cavity_id}>
                    {c.cavity_id} ({c.altitude_km})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">Maser Multiplier</label>
              <input
                type="number"
                step="0.01"
                value={maserMultiplier}
                onChange={(e) => setMaserMultiplier(Number(e.target.value))}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">Maser Efficiency</label>
              <input
                type="number"
                step="0.001"
                value={maserEfficiency}
                onChange={(e) => setMaserEfficiency(Number(e.target.value))}
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
            {loading ? "Harvesting AKR Maser Flux..." : "Harvest Auroral AKR Baseload"}
          </button>

          {result && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/30 p-3 text-xs">
              <div className="flex items-center gap-2 font-semibold text-emerald-300">
                <Activity className="h-4 w-4" /> {result.status} ({result.akr_coupling_state})
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] text-slate-400">
                <span>Dispatch: {result.harvested_power_gw.toFixed(3)} GW</span>
                <span>Flux: {result.akr_flux_mw.toFixed(1)} MW</span>
                <span>Stability: {result.grid_stability_pct.toFixed(3)}%</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <h3 className="text-sm font-semibold text-cyan-300">Auroral Cyclotron Maser Cavities</h3>
          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {cavities.map((c) => (
              <div
                key={c.cavity_id}
                className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs"
              >
                <div>
                  <div className="font-semibold text-white">{c.cavity_id}</div>
                  <div className="text-[11px] text-slate-400">
                    {c.altitude_km} · {c.cyclotron_freq_khz} kHz · {c.nominal_baseload_gw.toFixed(2)} GW
                  </div>
                </div>
                <span className="rounded bg-cyan-500/20 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">
                  {c.cavity_state}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
