"use client";

import React, { useEffect, useState } from "react";
import { Flame, RefreshCw, ShieldCheck, Layers } from "lucide-react";

interface HallInvariantRecord {
  invariant_id: string;
  abelian_category: string;
  chern_rank: number;
  behrend_weight: number;
  wall_crossing_state: string;
}

interface JoyceSongMetrics {
  active_invariants_count: number;
  total_evaluations: number;
  joyce_song_compliance_pct: number;
  hall_algebra_status: string;
}

interface JoyceSongEvalResult {
  invariant_id: string;
  status: string;
  hall_identity_verified: boolean;
  motivic_dt_residue: number;
  behrend_euler_index: number;
  compliance_pct: number;
  detail: string;
}

export function JoyceSongHallStudio() {
  const [invariants, setInvariants] = useState<HallInvariantRecord[]>([]);
  const [metrics, setMetrics] = useState<JoyceSongMetrics | null>(null);
  const [selectedId, setSelectedId] = useState("JOYCE-SONG-HALL-ALGEBRA-01");
  const [chernRank, setChernRank] = useState(2);
  const [behrendWeight, setBehrendWeight] = useState(1);
  const [firewallGain, setFirewallGain] = useState(1.25);
  const [result, setResult] = useState<JoyceSongEvalResult | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [iRes, mRes] = await Promise.all([
        fetch("/api/joyce-song-hall/invariants"),
        fetch("/api/joyce-song-hall/metrics"),
      ]);
      if (iRes.ok) {
        const iData = await iRes.json();
        setInvariants(iData.invariants || []);
      }
      if (mRes.ok) {
        setMetrics(await mRes.json());
      }
    } catch (err) {
      console.error("Failed to load Joyce-Song telemetry", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEvaluate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/joyce-song-hall/evaluate-joyce-song", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invariant_id: selectedId,
          chern_rank: chernRank,
          behrend_weight: behrendWeight,
          firewall_gain: firewallGain,
        }),
      });
      if (res.ok) {
        setResult(await res.json());
        await loadData();
      }
    } catch (err) {
      console.error("Joyce-Song evaluation failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 rounded-xl border border-rose-500/30 bg-slate-950/80 p-6 text-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-rose-500/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-rose-500/20 p-2.5 text-rose-400">
            <Flame className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              Joyce-Song Generalized DT &amp; Hall Algebra Firewall
            </h2>
            <p className="text-xs text-slate-400">
              Capability 235 · Behrend Weighted Euler Invariants &amp; Motivic Wall-Crossing
            </p>
          </div>
        </div>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-300 hover:bg-rose-500/20"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh Invariants
        </button>
      </div>

      {metrics && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="text-xs text-slate-400">Active Invariants</div>
            <div className="mt-1 text-xl font-bold text-rose-300">{metrics.active_invariants_count}</div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="text-xs text-slate-400">Joyce-Song Compliance</div>
            <div className="mt-1 text-xl font-bold text-emerald-400">
              {metrics.joyce_song_compliance_pct.toFixed(2)}%
            </div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="text-xs text-slate-400">Total Evaluations</div>
            <div className="mt-1 text-xl font-bold text-white">{metrics.total_evaluations}</div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="text-xs text-slate-400">Hall Algebra Status</div>
            <div className="mt-1 text-sm font-semibold text-cyan-300">{metrics.hall_algebra_status}</div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-rose-300">
            <Layers className="h-4 w-4" /> Evaluate Generalized DT Firewall
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-slate-400">Hall Invariant Channel</label>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              >
                {invariants.map((inv) => (
                  <option key={inv.invariant_id} value={inv.invariant_id}>
                    {inv.invariant_id} ({inv.abelian_category})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">Chern Character Rank</label>
              <input
                type="number"
                value={chernRank}
                min={1}
                onChange={(e) => setChernRank(Number(e.target.value))}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">Behrend Weight (ν)</label>
              <input
                type="number"
                value={behrendWeight}
                onChange={(e) => setBehrendWeight(Number(e.target.value))}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">Firewall Gain</label>
              <input
                type="number"
                step="0.05"
                value={firewallGain}
                onChange={(e) => setFirewallGain(Number(e.target.value))}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              />
            </div>
          </div>
          <button
            onClick={handleEvaluate}
            disabled={loading}
            className="w-full rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500 disabled:opacity-50"
          >
            {loading ? "Evaluating Hall Identity..." : "Lock Joyce-Song Motivic DT Firewall"}
          </button>

          {result && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/30 p-3 text-xs">
              <div className="flex items-center gap-2 font-semibold text-emerald-300">
                <ShieldCheck className="h-4 w-4" /> {result.status}
              </div>
              <div className="mt-1 text-slate-300">{result.detail}</div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] text-slate-400">
                <span>Motivic Residue: {result.motivic_dt_residue.toFixed(4)}</span>
                <span>Behrend Index: {result.behrend_euler_index.toFixed(2)}</span>
                <span>Compliance: {result.compliance_pct.toFixed(2)}%</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <h3 className="text-sm font-semibold text-rose-300">Ringel-Hall Algebra Channels</h3>
          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {invariants.map((inv) => (
              <div
                key={inv.invariant_id}
                className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs"
              >
                <div>
                  <div className="font-semibold text-white">{inv.invariant_id}</div>
                  <div className="text-[11px] text-slate-400">
                    {inv.abelian_category} · rank {inv.chern_rank} · ν={inv.behrend_weight}
                  </div>
                </div>
                <span className="rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-semibold text-rose-300">
                  {inv.wall_crossing_state}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
