'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles, Shield, AlertTriangle, BarChart3 } from 'lucide-react';

interface ModularGenus {
  genus_id: string;
  spectrum: string;
  default_central_charge: number;
  default_spin_cutoff: number;
  base_fidelity_pct: number;
  base_suppression_db: number;
  status: string;
}

interface AuditModularResult {
  genus_id: string;
  spectrum: string;
  central_charge: number;
  spin_cutoff: number;
  functional_depth: number;
  hellerman_gap_bound: number;
  cardy_entropy_density: number;
  sl2z_s_transform_residual: number;
  ghost_suppression_db: number;
  modular_unitarity_pct: number;
  rademacher_convergent: boolean;
  status: string;
  timestamp: number;
}

export default function ModularBootstrapStudio() {
  const [genera, setGenera] = useState<ModularGenus[]>([]);
  const [selectedGenus, setSelectedGenus] = useState<string>('MOD-SL2Z-TORUS-01');
  const [centralCharge, setCentralCharge] = useState<number>(48.0);
  const [spinCutoff, setSpinCutoff] = useState<number>(24);
  const [functionalDepth, setFunctionalDepth] = useState<number>(1.65);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<AuditModularResult | null>(null);

  const fetchGenera = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/modular-bootstrap/genera');
      const data = (await res.json().catch(() => ({}))) as {
        genera?: ModularGenus[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load modular bootstrap genera');
      }
      if (data.genera) {
        setGenera(data.genera);
        if (data.genera.length > 0) {
          setSelectedGenus((prev) => prev || data.genera![0].genus_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to load modular bootstrap genera');
    }
  }, []);

  useEffect(() => {
    fetchGenera();
  }, [fetchGenera]);

  const handleAudit = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/modular-bootstrap/audit-modular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          genus_id: selectedGenus,
          central_charge: centralCharge,
          spin_cutoff: spinCutoff,
          functional_depth: functionalDepth,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as AuditModularResult & {
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Modular bootstrap audit failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Modular bootstrap audit failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-violet-500/10 border border-violet-500/30 rounded-lg">
            <BarChart3 className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-violet-300">
              Capability 124: Modular Bootstrap &amp; Rademacher Regge Unitarity Guard
            </h2>
            <p className="text-sm text-slate-400">
              SL(2, Z) torus S-invariance, Hellerman primary gap bounds &amp; Ramanujan mock-theta Rademacher sums
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchGenera}
          className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Genera</span>
        </button>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="bg-red-950/30 border border-red-800/60 rounded-lg px-4 py-2.5 text-xs font-mono text-red-300 flex items-center gap-2"
        >
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {genera.map((g) => (
          <button
            type="button"
            key={g.genus_id}
            onClick={() => setSelectedGenus(g.genus_id)}
            aria-pressed={selectedGenus === g.genus_id}
            className={`text-left p-4 rounded-lg border transition ${
              selectedGenus === g.genus_id
                ? 'bg-violet-950/40 border-violet-500/60 shadow-lg shadow-violet-950/50'
                : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-semibold text-violet-400">{g.genus_id}</span>
              <span className="text-[10px] bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full font-mono">
                {g.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2">{g.spectrum}</p>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div>Central Charge: c={g.default_central_charge}</div>
              <div>Base Suppression: {g.base_suppression_db} dB</div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Central Charge (c)
            </label>
            <input
              type="number"
              min={1}
              max={512}
              step={4}
              value={centralCharge}
              onChange={(e) => setCentralCharge(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-violet-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Regge Spin Cutoff
            </label>
            <input
              type="number"
              min={2}
              max={128}
              step={2}
              value={spinCutoff}
              onChange={(e) => setSpinCutoff(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-violet-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              LP Functional Depth
            </label>
            <input
              type="number"
              min={0.85}
              max={2.5}
              step={0.05}
              value={functionalDepth}
              onChange={(e) => setFunctionalDepth(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-violet-500"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleAudit}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-lg transition shadow-lg shadow-violet-900/30"
        >
          <Sparkles className="w-4 h-4" />
          <span>{loading ? 'Auditing SL(2, Z) Spectrum...' : 'Audit Modular Partition Unitarity'}</span>
        </button>
      </div>

      {telemetry && (
        <div className="bg-violet-950/20 border border-violet-800/50 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-violet-900/50 pb-3">
            <div className="flex items-center space-x-2 text-violet-400 font-semibold text-sm">
              <Shield className="w-4 h-4" />
              <span>Modular Bootstrap Telemetry ({telemetry.genus_id})</span>
            </div>
            <span className="text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
              {telemetry.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Hellerman Gap</div>
              <div className="text-base font-bold text-violet-300">
                {telemetry.hellerman_gap_bound}
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Unitarity Fidelity</div>
              <div className="text-base font-bold text-emerald-300">
                {telemetry.modular_unitarity_pct}%
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Ghost Suppression</div>
              <div className="text-base font-bold text-fuchsia-300">
                {telemetry.ghost_suppression_db} dB
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">S-Duality Residual</div>
              <div className="text-base font-bold text-cyan-300">
                {telemetry.sl2z_s_transform_residual}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

