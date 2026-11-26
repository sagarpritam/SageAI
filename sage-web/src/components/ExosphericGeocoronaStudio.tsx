"use client";

import React, { useEffect, useState } from "react";
import { Globe, Zap, Activity, ShieldCheck } from "lucide-react";

interface ExosphericShell {
  shell_id: string;
  name: string;
  altitude_km: number;
  solar_wind_kms: number;
  nominal_baseload_gw: number;
  reconnection_efficiency_pct: number;
  status: string;
}

interface ExosphericReceipt {
  shell_id: string;
  status: string;
  harvested_power_gw: number;
  geocorona_flux_mw: number;
  grid_stability_pct: number;
  exospheric_coupling_state: string;
}

interface ExosphericMetrics {
  active_shells_count: number;
  harvest_events_total: number;
  total_baseload_dispatch_gw: number;
  mean_reconnection_efficiency_pct: number;
  exospheric_coupling_status: string;
}

export function ExosphericGeocoronaStudio() {
  const [shells, setShells] = useState<ExosphericShell[]>([]);
  const [metrics, setMetrics] = useState<ExosphericMetrics | null>(null);
  const [selectedId, setSelectedId] = useState("EXOSPHERE-GEOCORONA-LYMAN-01");
  const [receipt, setReceipt] = useState<ExosphericReceipt | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [sRes, mRes] = await Promise.all([
        fetch("/api/planetary-exospheric-geocorona/shells"),
        fetch("/api/planetary-exospheric-geocorona/metrics"),
      ]);
      if (sRes.ok) {
        const d = await sRes.json();
        setShells(d.shells || []);
      }
      if (mRes.ok) setMetrics(await mRes.json());
    } catch {
      // handled by API fallback
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleHarvest = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/planetary-exospheric-geocorona/harvest-exospheric-power", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shell_id: selectedId,
          reconnection_multiplier: 1.05,
          reconnection_efficiency: 0.989,
          dispatch_duration_s: 60.0,
        }),
      });
      if (res.ok) {
        setReceipt(await res.json());
        await loadData();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6 bg-slate-950/60 border border-cyan-500/20 rounded-2xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
            <Globe className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              Planetary Exospheric Geocorona &amp; Magnetopause Supergrid (Option B W69)
            </h2>
            <p className="text-sm text-slate-400">
              Wave 69 — 10.080 GW Nominal Lyman-Alpha Geocorona &amp; Dayside Reconnection Baseload
            </p>
          </div>
        </div>
        <button
          onClick={handleHarvest}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold transition disabled:opacity-50"
        >
          {loading ? "Harvesting Exospheric Power..." : "Harvest Exospheric Power"}
        </button>
      </div>

      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Active Shells</div>
            <div className="text-2xl font-bold text-cyan-400 mt-1">{metrics.active_shells_count}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Total Baseload</div>
            <div className="text-2xl font-bold text-white mt-1">{metrics.total_baseload_dispatch_gw} GW</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Reconnection Eff.</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">
              {metrics.mean_reconnection_efficiency_pct}%
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Harvest Events</div>
            <div className="text-2xl font-bold text-cyan-400 mt-1">{metrics.harvest_events_total}</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {shells.map((s) => (
          <button
            key={s.shell_id}
            onClick={() => setSelectedId(s.shell_id)}
            className={`text-left p-4 rounded-xl border transition ${
              selectedId === s.shell_id
                ? "bg-cyan-950/40 border-cyan-500/60"
                : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-cyan-400">{s.shell_id}</span>
              <Zap className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-sm font-semibold text-white mt-2">{s.name}</div>
            <div className="text-xs text-slate-400 mt-1">
              {s.altitude_km} km | {s.solar_wind_kms} km/s
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-300">
              <span>{s.nominal_baseload_gw} GW</span>
              <span className="text-cyan-400">{s.status}</span>
            </div>
          </button>
        ))}
      </div>

      {receipt && (
        <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/40 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <div>
              <div className="text-sm font-semibold text-white">
                {receipt.shell_id} — {receipt.status}
              </div>
              <div className="text-xs text-slate-400">
                Dispatched: {receipt.harvested_power_gw} GW ({receipt.geocorona_flux_mw} MW) |
                Stability: {receipt.grid_stability_pct}%
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-300">
            <Activity className="w-4 h-4" />
            <span>{receipt.exospheric_coupling_state}</span>
          </div>
        </div>
      )}
    </div>
  );
}
