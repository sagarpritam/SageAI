"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, Zap, Activity, ShieldCheck } from "lucide-react";

interface MesosphericLayer {
  layer_id: string;
  name: string;
  altitude_km: number;
  plasma_density_cm3: number;
  nominal_baseload_gw: number;
  plasma_efficiency_pct: number;
  status: string;
}

interface MesosphericReceipt {
  layer_id: string;
  status: string;
  harvested_power_gw: number;
  plasma_flux_mw: number;
  grid_stability_pct: number;
  mesospheric_coupling_state: string;
}

interface MesosphericMetrics {
  active_layers_count: number;
  harvest_events_total: number;
  total_baseload_dispatch_gw: number;
  mean_plasma_efficiency_pct: number;
  mesospheric_coupling_status: string;
}

export function MesosphericPlasmaStudio() {
  const [layers, setLayers] = useState<MesosphericLayer[]>([]);
  const [metrics, setMetrics] = useState<MesosphericMetrics | null>(null);
  const [selectedId, setSelectedId] = useState("MESOPAUSE-NOCTILUCENT-01");
  const [receipt, setReceipt] = useState<MesosphericReceipt | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [lRes, mRes] = await Promise.all([
        fetch("/api/planetary-mesospheric-plasma/layers"),
        fetch("/api/planetary-mesospheric-plasma/metrics"),
      ]);
      if (lRes.ok) {
        const d = await lRes.json();
        setLayers(d.layers || []);
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
      const res = await fetch("/api/planetary-mesospheric-plasma/harvest-mesospheric-power", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          layer_id: selectedId,
          electrojet_multiplier: 1.05,
          plasma_efficiency: 0.987,
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
            <Sparkles className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              Planetary Mesospheric Noctilucent & Electrojet Plasma Supergrid (Option B W67)
            </h2>
            <p className="text-sm text-slate-400">
              Wave 67 — 9.840 GW Nominal Mesopause Dusty Plasma & E-Region Electrojet Baseload
            </p>
          </div>
        </div>
        <button
          onClick={handleHarvest}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold transition disabled:opacity-50"
        >
          {loading ? "Harvesting Mesospheric Power..." : "Harvest Mesospheric Power"}
        </button>
      </div>

      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Active Layers</div>
            <div className="text-2xl font-bold text-cyan-400 mt-1">{metrics.active_layers_count}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Total Baseload</div>
            <div className="text-2xl font-bold text-white mt-1">{metrics.total_baseload_dispatch_gw} GW</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Plasma Efficiency</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">
              {metrics.mean_plasma_efficiency_pct}%
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Harvest Events</div>
            <div className="text-2xl font-bold text-cyan-400 mt-1">{metrics.harvest_events_total}</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {layers.map((l) => (
          <button
            key={l.layer_id}
            onClick={() => setSelectedId(l.layer_id)}
            className={`text-left p-4 rounded-xl border transition ${
              selectedId === l.layer_id
                ? "bg-cyan-950/40 border-cyan-500/60"
                : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-cyan-400">{l.layer_id}</span>
              <Zap className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-sm font-semibold text-white mt-2">{l.name}</div>
            <div className="text-xs text-slate-400 mt-1">
              {l.altitude_km} km | {l.plasma_density_cm3} cm⁻³
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-300">
              <span>{l.nominal_baseload_gw} GW</span>
              <span className="text-cyan-400">{l.status}</span>
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
                {receipt.layer_id} — {receipt.status}
              </div>
              <div className="text-xs text-slate-400">
                Dispatched: {receipt.harvested_power_gw} GW ({receipt.plasma_flux_mw} MW) |
                Stability: {receipt.grid_stability_pct}%
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-300">
            <Activity className="w-4 h-4" />
            <span>{receipt.mesospheric_coupling_state}</span>
          </div>
        </div>
      )}
    </div>
  );
}
