'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles, Cpu, AlertTriangle, Shield } from 'lucide-react';

interface CondensedModule {
  module_id: string;
  classification: string;
  default_liquid_exponent: number;
  default_stone_rank: number;
  default_ext_vanishing_degree: number;
  base_unitarity_pct: number;
  base_suppression_db: number;
  status: string;
}

interface SealResult {
  module_id: string;
  classification: string;
  liquid_exponent_p: number;
  profinite_stone_rank: number;
  ext_vanishing_degree: number;
  condensed_gain: number;
  ext_solidification_residual: number;
  liquid_banach_norm_bound: number;
  condensed_suppression_db: number;
  condensed_unitarity_pct: number;
  scholze_liquid_acyclic_locked: boolean;
  status: string;
  timestamp: number;
}

export default function CondensedLiquidMathStudio() {
  const [modules, setModules] = useState<CondensedModule[]>([]);
  const [selectedModule, setSelectedModule] = useState<string>('LIQUID-SCHOLZE-P05-01');
  const [liquidExp, setLiquidExp] = useState<number>(0.5);
  const [stoneRank, setStoneRank] = useState<number>(16);
  const [extDegree, setExtDegree] = useState<number>(6);
  const [condensedGain, setCondensedGain] = useState<number>(1.6);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<SealResult | null>(null);

  const fetchModules = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/condensed-liquid-mathematics/modules');
      const data = (await res.json().catch(() => ({}))) as {
        modules?: CondensedModule[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load condensed liquid modules');
      }
      if (data.modules) {
        setModules(data.modules);
        if (data.modules.length > 0) {
          setSelectedModule((prev) => prev || data.modules![0].module_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Failed to load condensed liquid modules'
      );
    }
  }, []);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  const handleSeal = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/condensed-liquid-mathematics/seal-condensed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          module_id: selectedModule,
          liquid_exponent_p: liquidExp,
          profinite_stone_rank: stoneRank,
          ext_vanishing_degree: extDegree,
          condensed_gain: condensedGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as SealResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Condensed liquid module seal failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Condensed liquid module seal failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
            <Shield className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-cyan-300">
              Capability 141: Clausen-Scholze Condensed Mathematics &amp; Liquid Vector Shield
            </h2>
            <p className="text-sm text-slate-400">
              Profinite Stone-space condensations, liquid p-norm spaces &amp; Ext^i-acyclic solidification
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchModules}
          className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Modules</span>
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
        {modules.map((m) => (
          <button
            type="button"
            key={m.module_id}
            onClick={() => setSelectedModule(m.module_id)}
            aria-pressed={selectedModule === m.module_id}
            className={`text-left p-4 rounded-lg border transition ${
              selectedModule === m.module_id
                ? 'bg-cyan-950/40 border-cyan-500/60 shadow-lg shadow-cyan-950/50'
                : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-semibold text-cyan-400">
                {m.module_id}
              </span>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full font-mono">
                {m.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2">{m.classification}</p>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div>
                p={m.default_liquid_exponent} | Stone={m.default_stone_rank}
              </div>
              <div>Base Suppression: {m.base_suppression_db} dB</div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Liquid Exponent (p)
            </label>
            <input
              type="number"
              min={0.1}
              max={1.0}
              step={0.05}
              value={liquidExp}
              onChange={(e) => setLiquidExp(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Profinite Stone Rank
            </label>
            <input
              type="number"
              min={4}
              max={128}
              step={2}
              value={stoneRank}
              onChange={(e) => setStoneRank(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Ext Vanishing Degree
            </label>
            <input
              type="number"
              min={2}
              max={32}
              step={1}
              value={extDegree}
              onChange={(e) => setExtDegree(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Solidification Gain
            </label>
            <input
              type="number"
              min={0.85}
              max={2.5}
              step={0.05}
              value={condensedGain}
              onChange={(e) => setCondensedGain(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSeal}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-lg transition shadow-lg shadow-cyan-900/30"
        >
          <Sparkles className="w-4 h-4" />
          <span>
            {loading
              ? 'Sealing Condensed Liquid Space...'
              : 'Solidify Profinite Tower & Seal Liquid Shield'}
          </span>
        </button>
      </div>

      {telemetry && (
        <div className="bg-cyan-950/20 border border-cyan-800/50 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-cyan-900/50 pb-3">
            <div className="flex items-center space-x-2 text-cyan-400 font-semibold text-sm">
              <Cpu className="w-4 h-4" />
              <span>Condensed Liquid Telemetry ({telemetry.module_id})</span>
            </div>
            <span className="text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
              {telemetry.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Condensed Unitarity</div>
              <div className="text-base font-bold text-cyan-300">
                {telemetry.condensed_unitarity_pct}%
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Suppression</div>
              <div className="text-base font-bold text-sky-300">
                {telemetry.condensed_suppression_db} dB
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Liquid Norm Bound</div>
              <div className="text-base font-bold text-emerald-300">
                {telemetry.liquid_banach_norm_bound}
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Ext Residual</div>
              <div className="text-base font-bold text-teal-300">
                {telemetry.ext_solidification_residual}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

