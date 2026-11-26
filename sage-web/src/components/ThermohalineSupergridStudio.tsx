"use client";

import React, { useEffect, useState } from "react";
import { Waves, Zap, Activity, ShieldCheck } from "lucide-react";

interface ThermohalineCurrent {
  current_id: string;
  name: string;
  sverdrup_transport_sv: number;
  depth_m: number;
  salinity_psu: number;
  nominal_baseload_gw: number;
  lorentz_efficiency_pct: number;
  status: string;
}

interface HarvestReceipt {
  current_id: string;
  status: string;
  harvested_power_gw: number;
  induction_flux_mw: number;
  sverdrup_transport_sv: number;
  lorentz_efficiency_pct: number;
  grid_stability_pct: number;
  thermohaline_coupling_state: string;
  timestamp: string;
}

interface ThermohalineMetrics {
  active_currents_count: number;
  harvest_events_total: number;
  total_baseload_dispatch_gw: number;
  mean_lorentz_efficiency_pct: number;
  thermohaline_coupling_status: string;
}

export function ThermohalineSupergridStudio() {
  const [currents, setCurrents] = useState<ThermohalineCurrent[]>([]);
  const [metrics, setMetrics] = useState<ThermohalineMetrics | null>(null);
  const [selectedId, setSelectedId] = useState("AMOC-NORTH-ATLANTIC-DEEPWATER-01");
  const [receipt, setReceipt] = useState<HarvestReceipt | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [cRes, mRes] = await Promise.all([
        fetch("/api/planetary-oceanic-thermohaline/currents"),
        fetch("/api/planetary-oceanic-thermohaline/metrics"),
      ]);
      if (cRes.ok) {
        const d = await cRes.json();
        setCurrents(d.currents || []);
      }
      if (mRes.ok) {
        setMetrics(await mRes.json());
      }
    } catch {
      // fallback handled by API
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleHarvest = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        "/api/planetary-oceanic-thermohaline/harvest-thermohaline-power",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            current_id: selectedId,
            coriolis_multiplier: 1.05,
            lorentz_efficiency: 0.984,
            dispatch_duration_s: 60.0,
          }),
        }
      );
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
            <Waves className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              Planetary Oceanic Thermohaline & Coriolis Induction Supergrid (Option B W65)
            </h2>
            <p className="text-sm text-slate-400">
              Wave 65 — 9.600 GW Nominal Abyssal Sverdrup Transport & Lorentz MHD Baseload
            </p>
          </div>
        </div>
        <button
          onClick={handleHarvest}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold transition disabled:opacity-50"
        >
          {loading ? "Harvesting Thermohaline Power..." : "Harvest Thermohaline Power"}
        </button>
      </div>

      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Active Currents</div>
            <div className="text-2xl font-bold text-cyan-400 mt-1">{metrics.active_currents_count}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Total Baseload</div>
            <div className="text-2xl font-bold text-white mt-1">
              {metrics.total_baseload_dispatch_gw} GW
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Lorentz Efficiency</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">
              {metrics.mean_lorentz_efficiency_pct}%
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Harvest Events</div>
            <div className="text-2xl font-bold text-cyan-400 mt-1">{metrics.harvest_events_total}</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {currents.map((c) => (
          <button
            key={c.current_id}
            onClick={() => setSelectedId(c.current_id)}
            className={`text-left p-4 rounded-xl border transition ${
              selectedId === c.current_id
                ? "bg-cyan-950/40 border-cyan-500/60"
                : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-cyan-400">{c.current_id}</span>
              <Zap className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-sm font-semibold text-white mt-2">{c.name}</div>
            <div className="text-xs text-slate-400 mt-1">
              {c.sverdrup_transport_sv} Sv | {c.depth_m}m | {c.salinity_psu} PSU
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-300">
              <span>{c.nominal_baseload_gw} GW</span>
              <span className="text-cyan-400">{c.status}</span>
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
                {receipt.current_id} — {receipt.status}
              </div>
              <div className="text-xs text-slate-400">
                Dispatched: {receipt.harvested_power_gw} GW ({receipt.induction_flux_mw} MW) |
                Stability: {receipt.grid_stability_pct}%
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-300">
            <Activity className="w-4 h-4" />
            <span>{receipt.thermohaline_coupling_state}</span>
          </div>
        </div>
      )}
    </div>
  );
}
