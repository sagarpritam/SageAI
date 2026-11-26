"use client";

import React, { useEffect, useState } from "react";
import { Flame, RefreshCw, ShieldCheck, Layers } from "lucide-react";

interface CrystalRecord {
  crystal_id: string;
  dg_category: string;
  serre_duality_order: number;
  lie_algebroid_rank: number;
  crystal_state: string;
}

interface GrMetrics {
  active_crystals_count: number;
  evaluations_total: number;
  mean_firewall_strength_pev: number;
  gaitsgory_rozenblyum_compliance_pct: number;
}

interface GrEvalResult {
  crystal_id: string;
  status: string;
  grothendieck_serre_verified: boolean;
  gr_firewall_strength_pev: number;
  dag_crystal_suppression_db: number;
  effective_fidelity_pct: number;
}

export function GaitsgoryRozenblyumStudio() {
  const [crystals, setCrystals] = useState<CrystalRecord[]>([]);
  const [metrics, setMetrics] = useState<GrMetrics | null>(null);
  const [selectedId, setSelectedId] = useState("GAITSGORY-ROZENBLYUM-INDCOH-01");
  const [serreOrder, setSerreOrder] = useState(3);
  const [algebroidRank, setAlgebroidRank] = useState(4);
  const [firewallGain, setFirewallGain] = useState(1.25);
  const [result, setResult] = useState<GrEvalResult | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [cRes, mRes] = await Promise.all([
        fetch("/api/gaitsgory-rozenblyum-dag/crystals"),
        fetch("/api/gaitsgory-rozenblyum-dag/metrics"),
      ]);
      if (cRes.ok) {
        const cData = await cRes.json();
        setCrystals(cData.crystals || []);
      }
      if (mRes.ok) {
        setMetrics(await mRes.json());
      }
    } catch (err) {
      console.error("Failed to load Gaitsgory-Rozenblyum telemetry", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEvaluate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/gaitsgory-rozenblyum-dag/evaluate-indcoherent-crystal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          crystal_id: selectedId,
          serre_order: serreOrder,
          algebroid_rank: algebroidRank,
          firewall_gain: firewallGain,
        }),
      });
      if (res.ok) {
        setResult(await res.json());
        await loadData();
      }
    } catch (err) {
      console.error("Gaitsgory-Rozenblyum evaluation failed", err);
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
              Gaitsgory-Rozenblyum Ind-Coherent Sheaves &amp; DAG Crystal Firewall
            </h2>
            <p className="text-xs text-slate-400">
              Capability 241 · Grothendieck-Serre Duality &amp; Formal Moduli Lie Algebroids
            </p>
          </div>
        </div>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-300 hover:bg-rose-500/20"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh Crystals
        </button>
      </div>

      {metrics && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="text-xs text-slate-400">Active Crystals</div>
            <div className="mt-1 text-xl font-bold text-rose-300">{metrics.active_crystals_count}</div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="text-xs text-slate-400">DAG Compliance</div>
            <div className="mt-1 text-xl font-bold text-emerald-400">
              {metrics.gaitsgory_rozenblyum_compliance_pct.toFixed(2)}%
            </div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="text-xs text-slate-400">Evaluations</div>
            <div className="mt-1 text-xl font-bold text-white">{metrics.evaluations_total}</div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="text-xs text-slate-400">Mean Firewall</div>
            <div className="mt-1 text-sm font-semibold text-cyan-300">
              {(metrics.mean_firewall_strength_pev / 1e12).toFixed(2)} TPeV
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-rose-300">
            <Layers className="h-4 w-4" /> Evaluate IndCoh Crystal Firewall
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-slate-400">DG Crystal Category</label>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              >
                {crystals.map((c) => (
                  <option key={c.crystal_id} value={c.crystal_id}>
                    {c.crystal_id} ({c.dg_category})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">Serre Duality Order</label>
              <input
                type="number"
                value={serreOrder}
                min={1}
                onChange={(e) => setSerreOrder(Number(e.target.value))}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">Lie Algebroid Rank</label>
              <input
                type="number"
                value={algebroidRank}
                min={1}
                onChange={(e) => setAlgebroidRank(Number(e.target.value))}
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
            {loading ? "Locking IndCoh Crystal..." : "Lock Gaitsgory-Rozenblyum DAG Firewall"}
          </button>

          {result && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/30 p-3 text-xs">
              <div className="flex items-center gap-2 font-semibold text-emerald-300">
                <ShieldCheck className="h-4 w-4" /> {result.status}
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] text-slate-400">
                <span>Firewall: {(result.gr_firewall_strength_pev / 1e12).toFixed(2)} TPeV</span>
                <span>Suppression: {result.dag_crystal_suppression_db.toFixed(2)} dB</span>
                <span>Fidelity: {result.effective_fidelity_pct.toFixed(1)}%</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <h3 className="text-sm font-semibold text-rose-300">Ind-Coherent Crystal Channels</h3>
          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {crystals.map((c) => (
              <div
                key={c.crystal_id}
                className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs"
              >
                <div>
                  <div className="font-semibold text-white">{c.crystal_id}</div>
                  <div className="text-[11px] text-slate-400">
                    {c.dg_category} · Serre={c.serre_duality_order} · Lie={c.lie_algebroid_rank}
                  </div>
                </div>
                <span className="rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-semibold text-rose-300">
                  {c.crystal_state}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
