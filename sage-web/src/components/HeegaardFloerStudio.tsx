'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles, Cpu, AlertTriangle, ShieldCheck } from 'lucide-react';

interface HfDiagram {
  diagram_id: string;
  classification: string;
  default_grid_rank: number;
  default_contact_depth: number;
  default_bordered_algebra_dim: number;
  base_unitarity_pct: number;
  base_suppression_db: number;
  status: string;
}

interface SealResult {
  diagram_id: string;
  classification: string;
  grid_rank: number;
  contact_depth: number;
  bordered_algebra_dim: number;
  hf_gain: number;
  holomorphic_disk_residual: number;
  bordered_floer_coherence: number;
  hf_suppression_db: number;
  contact_unitarity_pct: number;
  heegaard_bordered_locked: boolean;
  status: string;
  timestamp: number;
}

export default function HeegaardFloerStudio() {
  const [diagrams, setDiagrams] = useState<HfDiagram[]>([]);
  const [selectedDiagram, setSelectedDiagram] = useState<string>('HF-POINCARE-SPHERE-01');
  const [gridRank, setGridRank] = useState<number>(4);
  const [contactDepth, setContactDepth] = useState<number>(12);
  const [algebraDim, setAlgebraDim] = useState<number>(6);
  const [hfGain, setHfGain] = useState<number>(1.6);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<SealResult | null>(null);

  const fetchDiagrams = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/heegaard-floer-bordered/diagrams');
      const data = (await res.json().catch(() => ({}))) as {
        diagrams?: HfDiagram[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load Heegaard Floer diagrams');
      }
      if (data.diagrams) {
        setDiagrams(data.diagrams);
        if (data.diagrams.length > 0) {
          setSelectedDiagram((prev) => prev || data.diagrams![0].diagram_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Failed to load Heegaard Floer diagrams'
      );
    }
  }, []);

  useEffect(() => {
    fetchDiagrams();
  }, [fetchDiagrams]);

  const handleSeal = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/heegaard-floer-bordered/seal-hf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diagram_id: selectedDiagram,
          grid_rank: gridRank,
          contact_depth: contactDepth,
          bordered_algebra_dim: algebraDim,
          hf_gain: hfGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as SealResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Heegaard Floer seal failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Heegaard Floer seal failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-violet-500/10 border border-violet-500/30 rounded-lg">
            <ShieldCheck className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-violet-300">
              Capability 159: Heegaard Floer Homology &amp; Bordered Contact Firewall
            </h2>
            <p className="text-sm text-slate-400">
              Ozsváth-Szabó multi-pointed Heegaard tori, Alexander gradings &amp; Lipshitz-Ozsváth-Thurston bordered algebras
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchDiagrams}
          className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="flex items-center justify-between bg-red-950/50 border border-red-500/40 text-red-300 p-4 rounded-lg text-sm"
        >
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-xs text-red-400 hover:text-red-200 underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="hf-diagram-select" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Target Multi-Pointed Heegaard Diagram
            </label>
            <select
              id="hf-diagram-select"
              aria-label="Target Multi-Pointed Heegaard Diagram"
              value={selectedDiagram}
              onChange={(e) => {
                setSelectedDiagram(e.target.value);
                const d = diagrams.find((x) => x.diagram_id === e.target.value);
                if (d) {
                  setGridRank(d.default_grid_rank);
                  setContactDepth(d.default_contact_depth);
                  setAlgebraDim(d.default_bordered_algebra_dim);
                }
              }}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-violet-500"
            >
              {diagrams.map((d) => (
                <option key={d.diagram_id} value={d.diagram_id}>
                  {d.diagram_id} — {d.classification}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="hf-grid-rank" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Toroidal Grid Rank ({gridRank})
              </label>
              <input
                id="hf-grid-rank"
                aria-label="Toroidal Grid Rank"
                type="range"
                min="1"
                max="16"
                value={gridRank}
                onChange={(e) => setGridRank(Number(e.target.value))}
                className="w-full accent-violet-500"
              />
            </div>
            <div>
              <label htmlFor="hf-contact-depth" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Contact Depth ({contactDepth})
              </label>
              <input
                id="hf-contact-depth"
                aria-label="Contact Depth"
                type="range"
                min="2"
                max="64"
                value={contactDepth}
                onChange={(e) => setContactDepth(Number(e.target.value))}
                className="w-full accent-violet-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="hf-algebra-dim" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Bordered Algebra Dim ({algebraDim})
              </label>
              <input
                id="hf-algebra-dim"
                aria-label="Bordered Algebra Dim"
                type="range"
                min="2"
                max="32"
                value={algebraDim}
                onChange={(e) => setAlgebraDim(Number(e.target.value))}
                className="w-full accent-violet-500"
              />
            </div>
            <div>
              <label htmlFor="hf-gain" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                HF Differential Gain ({hfGain.toFixed(2)}x)
              </label>
              <input
                id="hf-gain"
                aria-label="HF Differential Gain"
                type="range"
                min="0.85"
                max="2.5"
                step="0.05"
                value={hfGain}
                onChange={(e) => setHfGain(Number(e.target.value))}
                className="w-full accent-violet-500"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleSeal}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-lg shadow-lg shadow-violet-900/30 transition disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Evaluate Floer Differential &amp; Lock Bordered Algebra</span>
              </>
            )}
          </button>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-violet-400" />
              <span>Heegaard Floer Telemetry</span>
            </h3>

            {telemetry ? (
              <div className="space-y-3 text-xs">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Status</span>
                  <span className="font-mono text-violet-400 font-semibold">{telemetry.status}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Holomorphic Disk Residual</span>
                  <span className="font-mono text-emerald-400">{telemetry.holomorphic_disk_residual.toExponential(4)}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Bordered Floer Coherence</span>
                  <span className="font-mono text-violet-400">{(telemetry.bordered_floer_coherence * 100).toFixed(5)}%</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Boundary Suppression</span>
                  <span className="font-mono text-purple-400">{telemetry.hf_suppression_db.toFixed(2)} dB</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Contact Unitarity</span>
                  <span className="font-mono text-emerald-300">{telemetry.contact_unitarity_pct.toFixed(5)}%</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Bordered Floer Locked</span>
                  <span className="font-mono text-violet-400">{telemetry.heegaard_bordered_locked ? 'TRUE' : 'FALSE'}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-400">Timestamp</span>
                  <span className="font-mono text-slate-400">{new Date(telemetry.timestamp * 1000).toLocaleTimeString()}</span>
                </div>
              </div>
            ) : (
              <div className="h-44 flex flex-col items-center justify-center text-slate-500 text-xs text-center space-y-2">
                <ShieldCheck className="w-8 h-8 text-slate-600" />
                <p>No active Heegaard Floer seal. Select a diagram and evaluate differential boundaries.</p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Bordered Contact Firewall</span>
            <span className="font-mono text-violet-400">Giroux DA Open-Book Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
