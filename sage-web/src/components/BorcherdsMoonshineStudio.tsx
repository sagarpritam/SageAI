"use client";

import React, { useEffect, useState } from "react";
import { Flame, RefreshCw, ShieldCheck, Layers } from "lucide-react";

interface MoonshineRecord {
  moonshine_id: string;
  automorphic_group: string;
  j_invariant_coeff: number;
  denominator_formula_rank: number;
  moonshine_state: string;
}

interface BorcherdsMetrics {
  active_algebras_count: number;
  evaluations_total: number;
  mean_firewall_strength_pev: number;
  borcherds_moonshine_compliance_pct: number;
}

interface BorcherdsEvalResult {
  moonshine_id: string;
  status: string;
  hauptmodul_j_verified: boolean;
  borcherds_firewall_strength_pev: number;
  moonshine_suppression_db: number;
  effective_fidelity_pct: number;
}

export function BorcherdsMoonshineStudio() {
  const [algebras, setAlgebras] = useState<MoonshineRecord[]>([]);
  const [metrics, setMetrics] = useState<BorcherdsMetrics | null>(null);
  const [selectedId, setSelectedId] = useState("BORCHERDS-MONSTER-VOA-01");
  const [denominatorRank, setDenominatorRank] = useState(2);
  const [hauptmodulOrder, setHauptmodulOrder] = useState(1);
  const [firewallGain, setFirewallGain] = useState(1.25);
  const [result, setResult] = useState<BorcherdsEvalResult | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [aRes, mRes] = await Promise.all([
        fetch("/api/borcherds-moonshine/algebras"),
        fetch("/api/borcherds-moonshine/metrics"),
      ]);
      if (aRes.ok) {
        const aData = await aRes.json();
        setAlgebras(aData.algebras || []);
      }
      if (mRes.ok) {
        setMetrics(await mRes.json());
      }
    } catch (err) {
      console.error("Failed to load Borcherds Moonshine telemetry", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEvaluate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/borcherds-moonshine/evaluate-borcherds-moonshine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moonshine_id: selectedId,
          denominator_rank: denominatorRank,
          hauptmodul_order: hauptmodulOrder,
          firewall_gain: firewallGain,
        }),
      });
      if (res.ok) {
        setResult(await res.json());
        await loadData();
      }
    } catch (err) {
      console.error("Borcherds Moonshine evaluation failed", err);
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
              Richard Borcherds Monster Lie Algebra &amp; Monstrous Moonshine Firewall
            </h2>
            <p className="text-xs text-slate-400">
              Capability 253 · Hauptmodul j-Invariant &amp; Automorphic Denominator Formulas
            </p>
          </div>
        </div>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-300 hover:bg-rose-500/20"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh Moonshine
        </button>
      </div>

      {metrics && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="text-xs text-slate-400">Moonshine Algebras</div>
            <div className="mt-1 text-xl font-bold text-rose-300">{metrics.active_algebras_count}</div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="text-xs text-slate-400">Moonshine Compliance</div>
            <div className="mt-1 text-xl font-bold text-emerald-400">
              {metrics.borcherds_moonshine_compliance_pct.toFixed(2)}%
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
            <Layers className="h-4 w-4" /> Evaluate Borcherds Moonshine Firewall
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-slate-400">Moonshine Module</label>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              >
                {algebras.map((a) => (
                  <option key={a.moonshine_id} value={a.moonshine_id}>
                    {a.moonshine_id} ({a.automorphic_group})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">Denominator Rank</label>
              <input
                type="number"
                value={denominatorRank}
                min={1}
                onChange={(e) => setDenominatorRank(Number(e.target.value))}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">Hauptmodul Order</label>
              <input
                type="number"
                value={hauptmodulOrder}
                min={1}
                onChange={(e) => setHauptmodulOrder(Number(e.target.value))}
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
            {loading ? "Verifying Hauptmodul j..." : "Lock Borcherds Moonshine Firewall"}
          </button>

          {result && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/30 p-3 text-xs">
              <div className="flex items-center gap-2 font-semibold text-emerald-300">
                <ShieldCheck className="h-4 w-4" /> {result.status}
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] text-slate-400">
                <span>Firewall: {(result.borcherds_firewall_strength_pev / 1e12).toFixed(2)} TPeV</span>
                <span>Suppression: {result.moonshine_suppression_db.toFixed(2)} dB</span>
                <span>Fidelity: {result.effective_fidelity_pct.toFixed(1)}%</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <h3 className="text-sm font-semibold text-rose-300">Moonshine Automorphic Registry</h3>
          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {algebras.map((a) => (
              <div
                key={a.moonshine_id}
                className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs"
              >
                <div>
                  <div className="font-semibold text-white">{a.moonshine_id}</div>
                  <div className="text-[11px] text-slate-400">
                    {a.automorphic_group} · j={a.j_invariant_coeff} · rank={a.denominator_formula_rank}
                  </div>
                </div>
                <span className="rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-semibold text-rose-300">
                  {a.moonshine_state}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
