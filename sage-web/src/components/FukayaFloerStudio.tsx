'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles, Cpu, AlertTriangle, Infinity as InfinityIcon } from 'lucide-react';

interface FukayaBrane {
  brane_id: string;
  classification: string;
  default_ainf_order: number;
  default_holomorphic_disks: number;
  default_novikov_depth: number;
  base_unitarity_pct: number;
  base_suppression_db: number;
  status: string;
}

interface SealResult {
  brane_id: string;
  classification: string;
  ainf_order: number;
  holomorphic_disks: number;
  novikov_valuation_depth: number;
  symplectic_gain: number;
  maurer_cartan_obstruction: number;
  floer_homology_rank_fidelity: number;
  symplectic_suppression_db: number;
  fukaya_unitarity_pct: number;
  maslov_grading_locked: boolean;
  status: string;
  timestamp: number;
}

export default function FukayaFloerStudio() {
  const [branes, setBranes] = useState<FukayaBrane[]>([]);
  const [selectedBrane, setSelectedBrane] = useState<string>('FUKAYA-AINF-CY3-01');
  const [ainfOrder, setAinfOrder] = useState<number>(5);
  const [holomorphicDisks, setHolomorphicDisks] = useState<number>(14);
  const [novikovDepth, setNovikovDepth] = useState<number>(12);
  const [symplecticGain, setSymplecticGain] = useState<number>(1.6);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<SealResult | null>(null);

  const fetchBranes = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/symplectic-fukaya-floer/branes');
      const data = (await res.json().catch(() => ({}))) as {
        branes?: FukayaBrane[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load Fukaya Lagrangian branes');
      }
      if (data.branes) {
        setBranes(data.branes);
        if (data.branes.length > 0) {
          setSelectedBrane((prev) => prev || data.branes![0].brane_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Failed to load Fukaya Lagrangian branes'
      );
    }
  }, []);

  useEffect(() => {
    fetchBranes();
  }, [fetchBranes]);

  const handleSeal = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/symplectic-fukaya-floer/seal-floer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brane_id: selectedBrane,
          ainf_order: ainfOrder,
          holomorphic_disks: holomorphicDisks,
          novikov_valuation_depth: novikovDepth,
          symplectic_gain: symplecticGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as SealResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Fukaya Floer brane seal failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Fukaya Floer brane seal failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-violet-500/10 border border-violet-500/30 rounded-lg">
            <InfinityIcon className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-violet-300">
              Capability 147: Fukaya A_infinity-Category &amp; Floer Homology Shield
            </h2>
            <p className="text-sm text-slate-400">
              Lagrangian Maurer-Cartan flatness, Novikov pseudoholomorphic disk counts &amp; Maslov Floer cohomology
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchBranes}
          className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Branes</span>
        </button>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="bg-red-950/30 border border-red-800/60 rounded-lg px-4 py-2.5 text-xs font-mono text-red-300 flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-red-300 hover:text-white underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {branes.map((b) => (
          <button
            type="button"
            key={b.brane_id}
            onClick={() => setSelectedBrane(b.brane_id)}
            aria-pressed={selectedBrane === b.brane_id}
            className={`text-left p-4 rounded-lg border transition ${
              selectedBrane === b.brane_id
                ? 'bg-violet-950/40 border-violet-500/60 shadow-lg shadow-violet-950/50'
                : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-semibold text-violet-400">
                {b.brane_id}
              </span>
              <span className="text-[10px] bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full font-mono">
                {b.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2">{b.classification}</p>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div>
                m_{b.default_ainf_order} | Disks={b.default_holomorphic_disks}
              </div>
              <div>Base Suppression: {b.base_suppression_db} dB</div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              A_infinity Composition Order
            </label>
            <input
              type="number"
              min={2}
              max={24}
              step={1}
              value={ainfOrder}
              onChange={(e) => setAinfOrder(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-violet-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Holomorphic Disks
            </label>
            <input
              type="number"
              min={4}
              max={128}
              step={2}
              value={holomorphicDisks}
              onChange={(e) => setHolomorphicDisks(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-violet-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Novikov Valuation Depth
            </label>
            <input
              type="number"
              min={4}
              max={64}
              step={2}
              value={novikovDepth}
              onChange={(e) => setNovikovDepth(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-violet-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Symplectic Floer Gain
            </label>
            <input
              type="number"
              min={0.85}
              max={2.5}
              step={0.05}
              value={symplecticGain}
              onChange={(e) => setSymplecticGain(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-violet-500"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSeal}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-lg transition shadow-lg shadow-violet-900/30"
        >
          <Sparkles className="w-4 h-4" />
          <span>
            {loading
              ? 'Sealing Fukaya Floer Brane...'
              : 'Verify Maurer-Cartan Flatness & Seal Floer Cohomology'}
          </span>
        </button>
      </div>

      {telemetry && (
        <div className="bg-violet-950/20 border border-violet-800/50 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-violet-900/50 pb-3">
            <div className="flex items-center space-x-2 text-violet-400 font-semibold text-sm">
              <Cpu className="w-4 h-4" />
              <span>Fukaya Floer Telemetry ({telemetry.brane_id})</span>
            </div>
            <span className="text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
              {telemetry.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Fukaya Unitarity</div>
              <div className="text-base font-bold text-violet-300">
                {telemetry.fukaya_unitarity_pct}%
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Symplectic Suppression</div>
              <div className="text-base font-bold text-fuchsia-300">
                {telemetry.symplectic_suppression_db} dB
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Floer Rank Fidelity</div>
              <div className="text-base font-bold text-emerald-300">
                {telemetry.floer_homology_rank_fidelity}
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">MC Obstruction</div>
              <div className="text-base font-bold text-teal-300">
                {telemetry.maurer_cartan_obstruction}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

