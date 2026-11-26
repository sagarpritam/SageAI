"use client";

import React, { useEffect, useState } from "react";
import { Zap, Activity, ShieldCheck, Radio } from "lucide-react";

interface ThermosphericZone {
  zone_id: string;
  name: string;
  altitude_km: number;
  ion_velocity_ms: number;
  nominal_baseload_gw: number;
  dynamo_efficiency_pct: number;
  status: string;
}

interface ThermosphericReceipt {
  zone_id: string;
  status: string;
  harvested_power_gw: number;
  dynamo_flux_mw: number;
  grid_stability_pct: number;
  thermospheric_coupling_state: string;
}

interface ThermosphericMetrics {
  active_zones_count: number;
  harvest_events_total: number;
  total_baseload_dispatch_gw: number;
  mean_dynamo_efficiency_pct: number;
  thermospheric_coupling_status: string;
}

export function ThermosphericDynamoStudio() {
  const [zones, setZones] = useState<ThermosphericZone[]>([]);
  const [metrics, setMetrics] = useState<ThermosphericMetrics | null>(null);
  const [selectedId, setSelectedId] = useState("THERMOSPHERE-JOULE-RING-01");
  const [receipt, setReceipt] = useState<ThermosphericReceipt | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [zRes, mRes] = await Promise.all([
        fetch("/api/planetary-thermospheric-dynamo/zones"),
        fetch("/api/planetary-thermospheric-dynamo/metrics"),
      ]);
      if (zRes.ok) {
        const d = await zRes.json();
        setZones(d.zones || []);
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
      const res = await fetch("/api/planetary-thermospheric-dynamo/harvest-thermospheric-power", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          zone_id: selectedId,
          dynamo_multiplier: 1.05,
          dynamo_efficiency: 0.988,
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
            <Radio className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              Planetary Thermospheric Auroral &amp; Ionospheric Dynamo Supergrid (Option B W68)
            </h2>
            <p className="text-sm text-slate-400">
              Wave 68 — 9.960 GW Nominal Joule Ring, F-Region Fountain &amp; Polar Cusp Ion-Outflow Baseload
            </p>
          </div>
        </div>
        <button
          onClick={handleHarvest}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold transition disabled:opacity-50"
        >
          {loading ? "Harvesting Thermospheric Power..." : "Harvest Thermospheric Power"}
        </button>
      </div>

      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Active Zones</div>
            <div className="text-2xl font-bold text-cyan-400 mt-1">{metrics.active_zones_count}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Total Baseload</div>
            <div className="text-2xl font-bold text-white mt-1">{metrics.total_baseload_dispatch_gw} GW</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Dynamo Efficiency</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">
              {metrics.mean_dynamo_efficiency_pct}%
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Harvest Events</div>
            <div className="text-2xl font-bold text-cyan-400 mt-1">{metrics.harvest_events_total}</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {zones.map((z) => (
          <button
            key={z.zone_id}
            onClick={() => setSelectedId(z.zone_id)}
            className={`text-left p-4 rounded-xl border transition ${
              selectedId === z.zone_id
                ? "bg-cyan-950/40 border-cyan-500/60"
                : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-cyan-400">{z.zone_id}</span>
              <Zap className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-sm font-semibold text-white mt-2">{z.name}</div>
            <div className="text-xs text-slate-400 mt-1">
              {z.altitude_km} km | {z.ion_velocity_ms} m/s
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-300">
              <span>{z.nominal_baseload_gw} GW</span>
              <span className="text-cyan-400">{z.status}</span>
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
                {receipt.zone_id} — {receipt.status}
              </div>
              <div className="text-xs text-slate-400">
                Dispatched: {receipt.harvested_power_gw} GW ({receipt.dynamo_flux_mw} MW) |
                Stability: {receipt.grid_stability_pct}%
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-300">
            <Activity className="w-4 h-4" />
            <span>{receipt.thermospheric_coupling_state}</span>
          </div>
        </div>
      )}
    </div>
  );
}
