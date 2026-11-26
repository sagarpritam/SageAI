"use client";

import React, { useEffect, useState } from "react";
import { Flame, RefreshCw, ShieldCheck, Layers } from "lucide-react";

interface OperadRecord {
  operad_id: string;
  operad_family: string;
  genus_order: number;
  arity_n: number;
  bv_homotopy_state: string;
}

interface OperadMetrics {
  active_operads_count: number;
  evaluations_total: number;
  mean_firewall_strength_pev: number;
  getzler_kapranov_compliance_pct: number;
}

interface OperadEvalResult {
  operad_id: string;
  status: string;
  feynman_transform_verified: boolean;
  operad_firewall_strength_pev: number;
  operad_homotopy_suppression_db: number;
  effective_fidelity_pct: number;
}

export function GetzlerKapranovStudio() {
  const [operads, setOperads] = useState<OperadRecord[]>([]);
  const [metrics, setMetrics] = useState<OperadMetrics | null>(null);
  const [selectedId, setSelectedId] = useState("GETZLER-KAPRANOV-MODULAR-01");
  const [genusOrder, setGenusOrder] = useState(2);
  const [arityN, setArityN] = useState(4);
  const [firewallGain, setFirewallGain] = useState(1.25);
  const [result, setResult] = useState<OperadEvalResult | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [oRes, mRes] = await Promise.all([
        fetch("/api/getzler-kapranov-operad/operads"),
        fetch("/api/getzler-kapranov-operad/metrics"),
      ]);
      if (oRes.ok) {
        const oData = await oRes.json();
        setOperads(oData.operads || []);
      }
      if (mRes.ok) {
        setMetrics(await mRes.json());
      }
    } catch (err) {
      console.error("Failed to load Getzler-Kapranov telemetry", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEvaluate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/getzler-kapranov-operad/evaluate-operad-bv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operad_id: selectedId,
          genus_order: genusOrder,
          arity_n: arityN,
          firewall_gain: firewallGain,
        }),
      });
      if (res.ok) {
        setResult(await res.json());
        await loadData();
      }
    } catch (err) {
      console.error("Getzler-Kapranov evaluation failed", err);
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
              Getzler-Kapranov Modular Operad &amp; BV Homotopy Firewall
            </h2>
            <p className="text-xs text-slate-400">
              Capability 238 · Feynman Transform &amp; Batalin-Vilkovisky Quantum Master Equation
            </p>
          </div>
        </div>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-300 hover:bg-rose-500/20"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh Operads
        </button>
      </div>

      {metrics && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="text-xs text-slate-400">Active Operads</div>
            <div className="mt-1 text-xl font-bold text-rose-300">{metrics.active_operads_count}</div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="text-xs text-slate-400">BV Compliance</div>
            <div className="mt-1 text-xl font-bold text-emerald-400">
              {metrics.getzler_kapranov_compliance_pct.toFixed(2)}%
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
            <Layers className="h-4 w-4" /> Evaluate Modular Operad BV Firewall
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-slate-400">Modular Operad</label>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              >
                {operads.map((o) => (
                  <option key={o.operad_id} value={o.operad_id}>
                    {o.operad_id} ({o.operad_family})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">Genus (g)</label>
              <input
                type="number"
                value={genusOrder}
                min={0}
                onChange={(e) => setGenusOrder(Number(e.target.value))}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">Arity (n)</label>
              <input
                type="number"
                value={arityN}
                min={1}
                onChange={(e) => setArityN(Number(e.target.value))}
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
            {loading ? "Locking Feynman Transform..." : "Lock Getzler-Kapranov BV Firewall"}
          </button>

          {result && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/30 p-3 text-xs">
              <div className="flex items-center gap-2 font-semibold text-emerald-300">
                <ShieldCheck className="h-4 w-4" /> {result.status}
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] text-slate-400">
                <span>Firewall: {(result.operad_firewall_strength_pev / 1e12).toFixed(2)} TPeV</span>
                <span>Suppression: {result.operad_homotopy_suppression_db.toFixed(2)} dB</span>
                <span>Fidelity: {result.effective_fidelity_pct.toFixed(1)}%</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <h3 className="text-sm font-semibold text-rose-300">Modular Operad Channels</h3>
          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {operads.map((o) => (
              <div
                key={o.operad_id}
                className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs"
              >
                <div>
                  <div className="font-semibold text-white">{o.operad_id}</div>
                  <div className="text-[11px] text-slate-400">
                    {o.operad_family} · g={o.genus_order} · n={o.arity_n}
                  </div>
                </div>
                <span className="rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-semibold text-rose-300">
                  {o.bv_homotopy_state}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
