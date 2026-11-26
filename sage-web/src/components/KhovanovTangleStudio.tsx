"use client";

import React, { useEffect, useState } from "react";
import { Flame, RefreshCw, ShieldCheck, Layers } from "lucide-react";

interface TangleRecord {
  tangle_id: string;
  cobordism_category: string;
  crossing_count: number;
  quantum_grading_j: number;
  tangle_state: string;
}

interface KhovanovMetrics {
  active_tangles_count: number;
  evaluations_total: number;
  mean_firewall_strength_pev: number;
  khovanov_barnatan_compliance_pct: number;
}

interface KhovanovEvalResult {
  tangle_id: string;
  status: string;
  categorified_functoriality_verified: boolean;
  kb_firewall_strength_pev: number;
  khovanov_tangle_suppression_db: number;
  effective_fidelity_pct: number;
}

export function KhovanovTangleStudio() {
  const [tangles, setTangles] = useState<TangleRecord[]>([]);
  const [metrics, setMetrics] = useState<KhovanovMetrics | null>(null);
  const [selectedId, setSelectedId] = useState("KHOVANOV-BARNATAN-COB-01");
  const [crossingCount, setCrossingCount] = useState(7);
  const [quantumGradingJ, setQuantumGradingJ] = useState(3);
  const [firewallGain, setFirewallGain] = useState(1.25);
  const [result, setResult] = useState<KhovanovEvalResult | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [tRes, mRes] = await Promise.all([
        fetch("/api/khovanov-barnatan-tangle/tangles"),
        fetch("/api/khovanov-barnatan-tangle/metrics"),
      ]);
      if (tRes.ok) {
        const tData = await tRes.json();
        setTangles(tData.tangles || []);
      }
      if (mRes.ok) {
        setMetrics(await mRes.json());
      }
    } catch (err) {
      console.error("Failed to load Khovanov-Bar-Natan telemetry", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEvaluate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/khovanov-barnatan-tangle/evaluate-khovanov-tangle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tangle_id: selectedId,
          crossing_count: crossingCount,
          quantum_grading_j: quantumGradingJ,
          firewall_gain: firewallGain,
        }),
      });
      if (res.ok) {
        setResult(await res.json());
        await loadData();
      }
    } catch (err) {
      console.error("Khovanov-Bar-Natan evaluation failed", err);
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
              Khovanov-Bar-Natan Categorified Knot Homology &amp; Tangle Firewall
            </h2>
            <p className="text-xs text-slate-400">
              Capability 244 · Cobordism Functoriality &amp; Reidemeister-Invariant Tangle Complexes
            </p>
          </div>
        </div>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-300 hover:bg-rose-500/20"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh Tangles
        </button>
      </div>

      {metrics && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="text-xs text-slate-400">Active Tangles</div>
            <div className="mt-1 text-xl font-bold text-rose-300">{metrics.active_tangles_count}</div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="text-xs text-slate-400">Tangle Compliance</div>
            <div className="mt-1 text-xl font-bold text-emerald-400">
              {metrics.khovanov_barnatan_compliance_pct.toFixed(2)}%
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
            <Layers className="h-4 w-4" /> Evaluate Khovanov Tangle Firewall
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-slate-400">Tangle Cobordism</label>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              >
                {tangles.map((t) => (
                  <option key={t.tangle_id} value={t.tangle_id}>
                    {t.tangle_id} ({t.cobordism_category})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">Crossing Count</label>
              <input
                type="number"
                value={crossingCount}
                min={1}
                onChange={(e) => setCrossingCount(Number(e.target.value))}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">Quantum Grading (j)</label>
              <input
                type="number"
                value={quantumGradingJ}
                onChange={(e) => setQuantumGradingJ(Number(e.target.value))}
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
            {loading ? "Verifying Cobordism Functor..." : "Lock Khovanov-Bar-Natan Tangle Firewall"}
          </button>

          {result && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/30 p-3 text-xs">
              <div className="flex items-center gap-2 font-semibold text-emerald-300">
                <ShieldCheck className="h-4 w-4" /> {result.status}
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] text-slate-400">
                <span>Firewall: {(result.kb_firewall_strength_pev / 1e12).toFixed(2)} TPeV</span>
                <span>Suppression: {result.khovanov_tangle_suppression_db.toFixed(2)} dB</span>
                <span>Fidelity: {result.effective_fidelity_pct.toFixed(1)}%</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <h3 className="text-sm font-semibold text-rose-300">Categorified Tangle Channels</h3>
          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {tangles.map((t) => (
              <div
                key={t.tangle_id}
                className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs"
              >
                <div>
                  <div className="font-semibold text-white">{t.tangle_id}</div>
                  <div className="text-[11px] text-slate-400">
                    {t.cobordism_category} · c={t.crossing_count} · j={t.quantum_grading_j}
                  </div>
                </div>
                <span className="rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-semibold text-rose-300">
                  {t.tangle_state}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
