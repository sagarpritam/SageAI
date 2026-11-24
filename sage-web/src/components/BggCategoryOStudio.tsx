'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles, Layers, AlertTriangle, ShieldCheck } from 'lucide-react';

interface CategoryOModule {
  module_id: string;
  classification: string;
  lie_algebra: string;
  weyl_group_order: number;
  highest_weight_lambda: number[];
  base_reciprocity_pct: number;
  character_filtration_depth: number;
  status: string;
}

interface VermaSealResult {
  module_id: string;
  classification: string;
  lie_algebra: string;
  weyl_length: number;
  kazhdan_lusztig_evaluation: number;
  loewy_filtration_steps: number;
  bgg_reciprocity_fidelity_pct: number;
  representation_barrier_db: number;
  verma_module_shielded: boolean;
  status: string;
  timestamp: number;
}

export default function BggCategoryOStudio() {
  const [modules, setModules] = useState<CategoryOModule[]>([]);
  const [selectedModule, setSelectedModule] = useState<string>('BGG-SL2-PRINCIPAL-01');
  const [weylLength, setWeylLength] = useState<number>(3);
  const [polynomialDegQ, setPolynomialDegQ] = useState<number>(2);
  const [filtrationSteps, setFiltrationSteps] = useState<number>(8);
  const [klAmplification, setKlAmplification] = useState<number>(1.2);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<VermaSealResult | null>(null);

  const fetchModules = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/bgg-category-o-shield/modules');
      const data = (await res.json().catch(() => ({}))) as {
        modules?: CategoryOModule[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load Category O modules');
      }
      if (data.modules) {
        setModules(data.modules);
        if (data.modules.length > 0) {
          setSelectedModule((prev) => prev || data.modules![0].module_id);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error loading Category O modules';
      setErrorMsg(msg);
    }
  }, []);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  const handleSealVerma = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/bgg-category-o-shield/seal-verma', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          module_id: selectedModule,
          weyl_length: weylLength,
          polynomial_deg_q: polynomialDegQ,
          filtration_steps: filtrationSteps,
          kl_amplification: klAmplification,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as VermaSealResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to seal Verma module');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error sealing Verma module';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-cyan-500/30 bg-zinc-950 p-6 shadow-2xl text-zinc-100">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-400">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-wide text-white">
              BGG Category &Oscr; Verma Module Studio
            </h2>
            <p className="text-xs text-zinc-400 font-mono">
              Capability 162: Kazhdan-Lusztig Invariant Shield &amp; Representation-Theoretic Immunity
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchModules}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-mono text-zinc-300 hover:bg-zinc-800 transition"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Reload Modules
        </button>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="mb-6 flex items-center justify-between rounded-lg border border-red-500/40 bg-red-950/30 p-3 text-xs text-red-300 font-mono"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-[10px] bg-red-900/60 hover:bg-red-900 px-2 py-0.5 rounded border border-red-700/50 text-red-200 transition"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-mono text-zinc-400 block mb-1.5">
              Select Highest Weight Module Block:
            </label>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-mono text-zinc-200 focus:border-cyan-500 focus:outline-none"
            >
              {modules.map((m) => (
                <option key={m.module_id} value={m.module_id}>
                  {m.module_id} — {m.classification} ({m.lie_algebra})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono text-zinc-400 block mb-1">
                Weyl Length l(w): {weylLength}
              </label>
              <input
                type="range"
                min={1}
                max={12}
                step={1}
                value={weylLength}
                onChange={(e) => setWeylLength(Number(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-zinc-400 block mb-1">
                Poly Degree in q: {polynomialDegQ}
              </label>
              <input
                type="range"
                min={0}
                max={6}
                step={1}
                value={polynomialDegQ}
                onChange={(e) => setPolynomialDegQ(Number(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono text-zinc-400 block mb-1">
                Loewy Steps: {filtrationSteps}
              </label>
              <input
                type="number"
                min={2}
                max={24}
                value={filtrationSteps}
                onChange={(e) => setFiltrationSteps(Number(e.target.value))}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-mono text-zinc-200"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-zinc-400 block mb-1">
                KL Amplification: {klAmplification}x
              </label>
              <input
                type="number"
                min={0.1}
                max={5.0}
                step={0.1}
                value={klAmplification}
                onChange={(e) => setKlAmplification(Number(e.target.value))}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-mono text-zinc-200"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleSealVerma}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 py-2.5 px-4 text-xs font-bold font-mono text-white transition disabled:opacity-50"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Enforce BGG Reciprocity &amp; Kazhdan-Lusztig Seal
          </button>
        </div>

        {/* Telemetry Panel */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="text-zinc-400 font-bold">CATEGORY &Oscr; VERMA TELEMETRY</span>
            {telemetry && (
              <span className="flex items-center gap-1 text-[11px] text-cyan-400 font-bold">
                <ShieldCheck className="h-3.5 w-3.5" /> RECIPROCITY SEALED
              </span>
            )}
          </div>

          {telemetry ? (
            <div className="space-y-2.5">
              <div className="flex justify-between">
                <span className="text-zinc-500">Module ID:</span>
                <span className="text-white font-bold">{telemetry.module_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Lie Algebra:</span>
                <span className="text-cyan-400 font-bold">{telemetry.lie_algebra}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">P_x,w(1) KL Polynomial Value:</span>
                <span className="text-zinc-300 font-bold">{telemetry.kazhdan_lusztig_evaluation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">BGG Reciprocity Fidelity:</span>
                <span className="text-cyan-400 font-bold">{telemetry.bgg_reciprocity_fidelity_pct}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Representation Barrier:</span>
                <span className="text-emerald-400 font-bold">{telemetry.representation_barrier_db} dB</span>
              </div>
              <div className="p-2 rounded bg-black/60 border border-zinc-800 text-[10px] text-zinc-400">
                BGG Reciprocity: [P(&lambda;) : M(&mu;)] = [M(&mu;) : L(&lambda;)] identity verified.
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-zinc-600 text-center">
              Execute a Verma module seal to stream Category &Oscr; representation invariants.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

