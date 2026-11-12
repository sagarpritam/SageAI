'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles, Cpu, AlertTriangle, GitMerge } from 'lucide-react';

interface KoszulOperad {
  operad_id: string;
  classification: string;
  default_arity: number;
  default_graph_loops: number;
  default_transfer_order: number;
  base_unitarity_pct: number;
  base_suppression_db: number;
  status: string;
}

interface SealResult {
  operad_id: string;
  classification: string;
  operad_arity: number;
  graph_complex_loops: number;
  homotopy_transfer_order: number;
  operadic_gain: number;
  bar_cobar_quasi_iso_error: number;
  kontsevich_formality_index: number;
  operadic_suppression_db: number;
  koszul_unitarity_pct: number;
  linf_formality_locked: boolean;
  status: string;
  timestamp: number;
}

export default function OperadicBarCobarStudio() {
  const [operads, setOperads] = useState<KoszulOperad[]>([]);
  const [selectedOperad, setSelectedOperad] = useState<string>('OPERAD-KOSZUL-LINF-01');
  const [operadArity, setOperadArity] = useState<number>(4);
  const [graphLoops, setGraphLoops] = useState<number>(12);
  const [transferOrder, setTransferOrder] = useState<number>(10);
  const [operadicGain, setOperadicGain] = useState<number>(1.6);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<SealResult | null>(null);

  const fetchOperads = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/operadic-bv-bar-cobar/operads');
      const data = (await res.json().catch(() => ({}))) as {
        operads?: KoszulOperad[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load Koszul operads');
      }
      if (data.operads) {
        setOperads(data.operads);
        if (data.operads.length > 0) {
          setSelectedOperad((prev) => prev || data.operads![0].operad_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Failed to load Koszul operads'
      );
    }
  }, []);

  useEffect(() => {
    fetchOperads();
  }, [fetchOperads]);

  const handleSeal = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/operadic-bv-bar-cobar/seal-operad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operad_id: selectedOperad,
          operad_arity: operadArity,
          graph_complex_loops: graphLoops,
          homotopy_transfer_order: transferOrder,
          operadic_gain: operadicGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as SealResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Operadic bar-cobar seal failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Operadic bar-cobar seal failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
            <GitMerge className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-emerald-300">
              Capability 148: Koszul Operadic Bar-Cobar Duality &amp; Formality Firewall
            </h2>
            <p className="text-sm text-slate-400">
              Quadratic bar-cobar adjunction quasi-isomorphisms, Kontsevich graph weights &amp; BV homotopy transfer
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchOperads}
          className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Operads</span>
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
        {operads.map((o) => (
          <button
            type="button"
            key={o.operad_id}
            onClick={() => setSelectedOperad(o.operad_id)}
            aria-pressed={selectedOperad === o.operad_id}
            className={`text-left p-4 rounded-lg border transition ${
              selectedOperad === o.operad_id
                ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-950/50'
                : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-semibold text-emerald-400">
                {o.operad_id}
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
                {o.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2">{o.classification}</p>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div>
                Arity={o.default_arity} | Loops={o.default_graph_loops}
              </div>
              <div>Base Suppression: {o.base_suppression_db} dB</div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Operad Arity
            </label>
            <input
              type="number"
              min={2}
              max={16}
              step={1}
              value={operadArity}
              onChange={(e) => setOperadArity(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Graph Complex Loops
            </label>
            <input
              type="number"
              min={4}
              max={128}
              step={2}
              value={graphLoops}
              onChange={(e) => setGraphLoops(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Homotopy Transfer Order
            </label>
            <input
              type="number"
              min={4}
              max={64}
              step={2}
              value={transferOrder}
              onChange={(e) => setTransferOrder(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Bar-Cobar Gain
            </label>
            <input
              type="number"
              min={0.85}
              max={2.5}
              step={0.05}
              value={operadicGain}
              onChange={(e) => setOperadicGain(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSeal}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-lg transition shadow-lg shadow-emerald-900/30"
        >
          <Sparkles className="w-4 h-4" />
          <span>
            {loading
              ? 'Sealing Koszul Operad...'
              : 'Verify Bar-Cobar Quasi-Isomorphism & Lock Kontsevich Formality'}
          </span>
        </button>
      </div>

      {telemetry && (
        <div className="bg-emerald-950/20 border border-emerald-800/50 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-900/50 pb-3">
            <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-sm">
              <Cpu className="w-4 h-4" />
              <span>Koszul Operadic Telemetry ({telemetry.operad_id})</span>
            </div>
            <span className="text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
              {telemetry.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Koszul Unitarity</div>
              <div className="text-base font-bold text-emerald-300">
                {telemetry.koszul_unitarity_pct}%
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Operadic Suppression</div>
              <div className="text-base font-bold text-cyan-300">
                {telemetry.operadic_suppression_db} dB
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Formality Index</div>
              <div className="text-base font-bold text-teal-300">
                {telemetry.kontsevich_formality_index}
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Quasi-Iso Error</div>
              <div className="text-base font-bold text-indigo-300">
                {telemetry.bar_cobar_quasi_iso_error}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

