'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles, Cpu, AlertTriangle, Infinity as InfinityIcon } from 'lucide-react';

interface SubfactorAlgebra {
  algebra_id: string;
  classification: string;
  default_jones_level_k: number;
  default_tangle_boxes: number;
  default_tl_strands: number;
  base_unitarity_pct: number;
  base_suppression_db: number;
  status: string;
}

interface CompressResult {
  algebra_id: string;
  classification: string;
  jones_level_k: number;
  tangle_boxes: number;
  tl_strand_count: number;
  planar_gain: number;
  temperley_lieb_loop_value: number;
  jones_index_delta: number;
  tangle_anomaly_residual: number;
  subfactor_suppression_db: number;
  bimodule_unitarity_pct: number;
  planar_isotopy_certified: boolean;
  status: string;
  timestamp: number;
}

export default function SubfactorJonesPlanarStudio() {
  const [algebras, setAlgebras] = useState<SubfactorAlgebra[]>([]);
  const [selectedAlgebra, setSelectedAlgebra] = useState<string>('SUBFACTOR-JONES-E8-01');
  const [jonesLevelK, setJonesLevelK] = useState<number>(28);
  const [tangleBoxes, setTangleBoxes] = useState<number>(16);
  const [tlStrands, setTlStrands] = useState<number>(12);
  const [planarGain, setPlanarGain] = useState<number>(1.6);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<CompressResult | null>(null);

  const fetchAlgebras = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/subfactor-jones-planars/algebras');
      const data = (await res.json().catch(() => ({}))) as {
        algebras?: SubfactorAlgebra[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load Subfactor Jones planar algebras');
      }
      if (data.algebras) {
        setAlgebras(data.algebras);
        if (data.algebras.length > 0) {
          setSelectedAlgebra((prev) => prev || data.algebras![0].algebra_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to load Subfactor Jones planar algebras');
    }
  }, []);

  useEffect(() => {
    fetchAlgebras();
  }, [fetchAlgebras]);

  const handleCompress = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/subfactor-jones-planars/compress-tangle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          algebra_id: selectedAlgebra,
          jones_level_k: jonesLevelK,
          tangle_boxes: tangleBoxes,
          tl_strand_count: tlStrands,
          planar_gain: planarGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as CompressResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Subfactor planar tangle compression failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Subfactor planar tangle compression failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
            <InfinityIcon className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-indigo-300">
              Capability 134: Vaughan-Jones Subfactor Planar Algebra &amp; Temperley-Lieb Firewall
            </h2>
            <p className="text-sm text-slate-400">
              Type II_1 subfactor inclusions, Jones index discretization &amp; biunitary planar tangle sealing
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchAlgebras}
          className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Algebras</span>
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
        {algebras.map((a) => (
          <button
            type="button"
            key={a.algebra_id}
            onClick={() => setSelectedAlgebra(a.algebra_id)}
            aria-pressed={selectedAlgebra === a.algebra_id}
            className={`text-left p-4 rounded-lg border transition ${
              selectedAlgebra === a.algebra_id
                ? 'bg-indigo-950/40 border-indigo-500/60 shadow-lg shadow-indigo-950/50'
                : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-semibold text-indigo-400">{a.algebra_id}</span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-mono">
                {a.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2">{a.classification}</p>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div>Level k={a.default_jones_level_k} | Strands={a.default_tl_strands}</div>
              <div>Base Suppression: {a.base_suppression_db} dB</div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Jones Level (k)
            </label>
            <input
              type="number"
              min={3}
              max={128}
              step={1}
              value={jonesLevelK}
              onChange={(e) => setJonesLevelK(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Planar Tangle Boxes
            </label>
            <input
              type="number"
              min={4}
              max={128}
              step={2}
              value={tangleBoxes}
              onChange={(e) => setTangleBoxes(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Temperley-Lieb Strands
            </label>
            <input
              type="number"
              min={4}
              max={64}
              step={2}
              value={tlStrands}
              onChange={(e) => setTlStrands(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Planar Biunitary Gain
            </label>
            <input
              type="number"
              min={0.85}
              max={2.5}
              step={0.05}
              value={planarGain}
              onChange={(e) => setPlanarGain(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleCompress}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-lg transition shadow-lg shadow-indigo-900/30"
        >
          <Sparkles className="w-4 h-4" />
          <span>{loading ? 'Contracting Planar Tangle...' : 'Compress Temperley-Lieb Tangle & Seal Subfactor'}</span>
        </button>
      </div>

      {telemetry && (
        <div className="bg-indigo-950/20 border border-indigo-800/50 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-indigo-900/50 pb-3">
            <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-sm">
              <Cpu className="w-4 h-4" />
              <span>Subfactor Planar Telemetry ({telemetry.algebra_id})</span>
            </div>
            <span className="text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
              {telemetry.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Bimodule Unitarity</div>
              <div className="text-base font-bold text-indigo-300">
                {telemetry.bimodule_unitarity_pct}%
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Subfactor Suppression</div>
              <div className="text-base font-bold text-violet-300">
                {telemetry.subfactor_suppression_db} dB
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Jones Index [M:N]</div>
              <div className="text-base font-bold text-emerald-300">
                {telemetry.jones_index_delta}
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Anomaly Residual</div>
              <div className="text-base font-bold text-teal-300">
                {telemetry.tangle_anomaly_residual}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

