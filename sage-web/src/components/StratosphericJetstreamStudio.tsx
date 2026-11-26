"use client";

import React, { useEffect, useState } from "react";
import { Wind, Zap, Activity, ShieldCheck } from "lucide-react";

interface JetStream {
  stream_id: string;
  name: string;
  altitude_km: number;
  wind_velocity_ms: number;
  nominal_baseload_gw: number;
  triboelectric_efficiency_pct: number;
  status: string;
}

interface JetstreamReceipt {
  stream_id: string;
  status: string;
  harvested_power_gw: number;
  triboelectric_flux_mw: number;
  grid_stability_pct: number;
  jetstream_coupling_state: string;
}

interface JetstreamMetrics {
  active_streams_count: number;
  harvest_events_total: number;
  total_baseload_dispatch_gw: number;
  mean_triboelectric_efficiency_pct: number;
  jetstream_coupling_status: string;
}

export function StratosphericJetstreamStudio() {
  const [streams, setStreams] = useState<JetStream[]>([]);
  const [metrics, setMetrics] = useState<JetstreamMetrics | null>(null);
  const [selectedId, setSelectedId] = useState("POLAR-FRONT-JETSTREAM-01");
  const [receipt, setReceipt] = useState<JetstreamReceipt | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [sRes, mRes] = await Promise.all([
        fetch("/api/planetary-stratospheric-jetstream/streams"),
        fetch("/api/planetary-stratospheric-jetstream/metrics"),
      ]);
      if (sRes.ok) {
        const d = await sRes.json();
        setStreams(d.streams || []);
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
      const res = await fetch("/api/planetary-stratospheric-jetstream/harvest-jetstream-power", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stream_id: selectedId,
          rossby_multiplier: 1.05,
          triboelectric_efficiency: 0.986,
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
            <Wind className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              Planetary Stratospheric Jet-Stream & Triboelectric Tropopause Supergrid (Option B W66)
            </h2>
            <p className="text-sm text-slate-400">
              Wave 66 — 9.720 GW Nominal Rossby Waveguide & Triboelectric Shear Baseload
            </p>
          </div>
        </div>
        <button
          onClick={handleHarvest}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold transition disabled:opacity-50"
        >
          {loading ? "Harvesting Jetstream Power..." : "Harvest Jetstream Power"}
        </button>
      </div>

      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Active Streams</div>
            <div className="text-2xl font-bold text-cyan-400 mt-1">{metrics.active_streams_count}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Total Baseload</div>
            <div className="text-2xl font-bold text-white mt-1">{metrics.total_baseload_dispatch_gw} GW</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Triboelectric Eff.</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">
              {metrics.mean_triboelectric_efficiency_pct}%
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Harvest Events</div>
            <div className="text-2xl font-bold text-cyan-400 mt-1">{metrics.harvest_events_total}</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {streams.map((s) => (
          <button
            key={s.stream_id}
            onClick={() => setSelectedId(s.stream_id)}
            className={`text-left p-4 rounded-xl border transition ${
              selectedId === s.stream_id
                ? "bg-cyan-950/40 border-cyan-500/60"
                : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-cyan-400">{s.stream_id}</span>
              <Zap className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-sm font-semibold text-white mt-2">{s.name}</div>
            <div className="text-xs text-slate-400 mt-1">
              {s.altitude_km} km | {s.wind_velocity_ms} m/s
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
                {receipt.stream_id} — {receipt.status}
              </div>
              <div className="text-xs text-slate-400">
                Dispatched: {receipt.harvested_power_gw} GW ({receipt.triboelectric_flux_mw} MW) |
                Stability: {receipt.grid_stability_pct}%
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-300">
            <Activity className="w-4 h-4" />
            <span>{receipt.jetstream_coupling_state}</span>
          </div>
        </div>
      )}
    </div>
  );
}
