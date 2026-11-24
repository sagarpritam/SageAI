'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles, Binary, AlertTriangle, ShieldCheck } from 'lucide-react';

interface AzumayaAlgebra {
  algebra_id: string;
  classification: string;
  brauer_torsion_order_n: number;
  periodic_cyclic_hp_dim: number;
  noncommutative_motive_rank: number;
  morita_equivalence_depth: number;
  base_barrier_gev: number;
  shield_fidelity_pct: number;
  status: string;
}

interface BrauerSealResult {
  algebra_id: string;
  seal_status: string;
  chern_character_hp_norm: number;
  effective_fidelity_pct: number;
  hardened_barrier_gev: number;
  torsion_order_n: number;
  periodic_cyclic_degree: number;
  morita_equivalence_depth: number;
  brauer_amplification: number;
  timestamp: number;
}

export default function AzumayaBrauerStudio() {
  const [algebras, setAlgebras] = useState<AzumayaAlgebra[]>([]);
  const [selectedAlgebra, setSelectedAlgebra] = useState<string>('AZUMAYA-K3-TWISTED-01');
  const [torsionOrderN, setTorsionOrderN] = useState<number>(4);
  const [cyclicDegree, setCyclicDegree] = useState<number>(2);
  const [moritaDepth, setMoritaDepth] = useState<number>(8);
  const [amplification, setAmplification] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<BrauerSealResult | null>(null);

  const fetchAlgebras = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/azumaya-brauer-shield/algebras');
      const data = (await res.json().catch(() => ({}))) as {
        algebras?: AzumayaAlgebra[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load Azumaya algebras');
      }
      if (data.algebras) {
        setAlgebras(data.algebras);
        if (data.algebras.length > 0) {
          setSelectedAlgebra((prev) => prev || data.algebras![0].algebra_id);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error loading Azumaya algebras';
      setErrorMsg(msg);
    }
  }, []);

  useEffect(() => {
    fetchAlgebras();
  }, [fetchAlgebras]);

  const handleSealBrauer = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/azumaya-brauer-shield/seal-brauer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          algebra_id: selectedAlgebra,
          torsion_order_n: torsionOrderN,
          periodic_cyclic_degree: cyclicDegree,
          morita_equivalence_depth: moritaDepth,
          brauer_amplification: amplification,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as BrauerSealResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to seal Azumaya-Brauer algebra');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error executing Brauer seal';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-indigo-500/30 bg-zinc-950 p-6 shadow-2xl text-zinc-100">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-950/60 border border-indigo-500/40 text-indigo-400">
            <Binary className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-wide text-white">
              Derived Azumaya Brauer-Grothendieck Studio
            </h2>
            <p className="text-xs text-zinc-400 font-mono">
              Capability 165: Non-Commutative Motives, Periodic Cyclic Cohomology &amp; Morita Invariance Barrier
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchAlgebras}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-mono text-zinc-300 hover:bg-zinc-800 transition"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Reload Algebras
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
              Select Derived Azumaya Algebra:
            </label>
            <select
              value={selectedAlgebra}
              onChange={(e) => setSelectedAlgebra(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-mono text-zinc-200 focus:border-indigo-500 focus:outline-none"
            >
              {algebras.map((a) => (
                <option key={a.algebra_id} value={a.algebra_id}>
                  {a.algebra_id} — {a.classification}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono text-zinc-400 block mb-1">
                Brauer Torsion Order (n): {torsionOrderN}
              </label>
              <input
                type="range"
                min={1}
                max={16}
                step={1}
                value={torsionOrderN}
                onChange={(e) => setTorsionOrderN(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-zinc-400 block mb-1">
                Cyclic HP_* Degree: {cyclicDegree}
              </label>
              <input
                type="range"
                min={0}
                max={8}
                step={1}
                value={cyclicDegree}
                onChange={(e) => setCyclicDegree(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono text-zinc-400 block mb-1">
                Morita Depth: {moritaDepth}
              </label>
              <input
                type="range"
                min={2}
                max={20}
                step={1}
                value={moritaDepth}
                onChange={(e) => setMoritaDepth(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-zinc-400 block mb-1">
                Amplification: {amplification.toFixed(1)}x
              </label>
              <input
                type="range"
                min={0.5}
                max={2.5}
                step={0.1}
                value={amplification}
                onChange={(e) => setAmplification(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleSealBrauer}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 py-2.5 text-xs font-mono font-bold text-white shadow-lg transition"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" /> Sealing Brauer Group...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Seal Brauer-Grothendieck Barrier
              </>
            )}
          </button>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
          <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-indigo-400" />
            Non-Commutative Cohomology Telemetry
          </h3>
          {telemetry ? (
            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                <span className="text-zinc-500">Algebra ID:</span>
                <span className="text-indigo-400 font-bold">{telemetry.algebra_id}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                <span className="text-zinc-500">Status:</span>
                <span className="text-zinc-200">{telemetry.seal_status}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                <span className="text-zinc-500">Chern Character ||ch(A)||:</span>
                <span className="text-emerald-300 font-bold">
                  {telemetry.chern_character_hp_norm.toFixed(4)}
                </span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                <span className="text-zinc-500">Hardened Barrier:</span>
                <span className="text-yellow-400 font-bold">
                  {telemetry.hardened_barrier_gev.toFixed(2)} GeV
                </span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                <span className="text-zinc-500">Morita Equivalence Depth:</span>
                <span className="text-blue-300 font-bold">
                  {telemetry.morita_equivalence_depth} levels
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Effective Fidelity:</span>
                <span className="text-indigo-400 font-bold">
                  {telemetry.effective_fidelity_pct.toFixed(4)}%
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center text-zinc-500 font-mono text-xs">
              <Binary className="h-8 w-8 text-zinc-700 mb-2" />
              <span>Select Azumaya algebra and seal non-commutative Brauer barrier</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
