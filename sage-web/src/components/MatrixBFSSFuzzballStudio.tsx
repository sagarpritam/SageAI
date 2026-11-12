'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles, Cpu, AlertTriangle, Layers } from 'lucide-react';

interface MatrixBFSSConfiguration {
  config_id: string;
  manifold: string;
  default_matrix_rank_n: number;
  default_thooft_coupling: number;
  default_mu_mass_gap: number;
  base_unitarity_pct: number;
  base_suppression_db: number;
  status: string;
}

interface LockFuzzballResult {
  config_id: string;
  manifold: string;
  matrix_rank_n: number;
  thooft_coupling: number;
  mu_mass_gap: number;
  commutator_clamp_gain: number;
  commutator_frobenius_norm: number;
  microstate_dispersion_index: number;
  singularity_drift_residual: number;
  commutator_suppression_db: number;
  matrix_fuzzball_unitarity_pct: number;
  horizonless_microstate_locked: boolean;
  status: string;
  timestamp: number;
}

export default function MatrixBFSSFuzzballStudio() {
  const [configs, setConfigs] = useState<MatrixBFSSConfiguration[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<string>('BFSS-BMN-MATRIX-01');
  const [matrixRankN, setMatrixRankN] = useState<number>(64);
  const [thooftCoupling, setThooftCoupling] = useState<number>(4.2);
  const [muMassGap, setMuMassGap] = useState<number>(1.65);
  const [clampGain, setClampGain] = useState<number>(1.6);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<LockFuzzballResult | null>(null);

  const fetchConfigurations = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/matrix-bfss-fuzzball/configurations');
      const data = (await res.json().catch(() => ({}))) as {
        configurations?: MatrixBFSSConfiguration[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load BFSS matrix configurations');
      }
      if (data.configurations) {
        setConfigs(data.configurations);
        if (data.configurations.length > 0) {
          setSelectedConfig((prev) => prev || data.configurations![0].config_id);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to load BFSS matrix configurations');
    }
  }, []);

  useEffect(() => {
    fetchConfigurations();
  }, [fetchConfigurations]);

  const handleLock = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/matrix-bfss-fuzzball/lock-fuzzball', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config_id: selectedConfig,
          matrix_rank_n: matrixRankN,
          thooft_coupling: thooftCoupling,
          mu_mass_gap: muMassGap,
          commutator_clamp_gain: clampGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as LockFuzzballResult & {
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'BFSS fuzzball microstate lock failed');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'BFSS fuzzball microstate lock failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-violet-500/10 border border-violet-500/30 rounded-lg">
            <Layers className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-violet-300">
              Capability 128: BFSS / IKKT M-Theory Matrix Model &amp; Fuzzball Microstate Firewall
            </h2>
            <p className="text-sm text-slate-400">
              Non-abelian SU(N) commutator dispersion &amp; horizonless D1-D5-P superstrata fuzzball sealing
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchConfigurations}
          className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Configurations</span>
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
        {configs.map((c) => (
          <button
            type="button"
            key={c.config_id}
            onClick={() => setSelectedConfig(c.config_id)}
            aria-pressed={selectedConfig === c.config_id}
            className={`text-left p-4 rounded-lg border transition ${
              selectedConfig === c.config_id
                ? 'bg-violet-950/40 border-violet-500/60 shadow-lg shadow-violet-950/50'
                : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-semibold text-violet-400">{c.config_id}</span>
              <span className="text-[10px] bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full font-mono">
                {c.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2">{c.manifold}</p>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div>Matrix Rank: N={c.default_matrix_rank_n} | λ={c.default_thooft_coupling}</div>
              <div>Base Suppression: {c.base_suppression_db} dB</div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Matrix Rank (N)
            </label>
            <input
              type="number"
              min={16}
              max={1024}
              step={16}
              value={matrixRankN}
              onChange={(e) => setMatrixRankN(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-violet-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              &apos;t Hooft Coupling (λ)
            </label>
            <input
              type="number"
              min={0.5}
              max={25}
              step={0.1}
              value={thooftCoupling}
              onChange={(e) => setThooftCoupling(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-violet-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              BMN Mass Gap (μ)
            </label>
            <input
              type="number"
              min={0.25}
              max={8}
              step={0.05}
              value={muMassGap}
              onChange={(e) => setMuMassGap(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-violet-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-mono">
              Commutator Clamp Gain
            </label>
            <input
              type="number"
              min={0.85}
              max={2.5}
              step={0.05}
              value={clampGain}
              onChange={(e) => setClampGain(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-violet-500"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleLock}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-lg transition shadow-lg shadow-violet-900/30"
        >
          <Sparkles className="w-4 h-4" />
          <span>{loading ? 'Locking Fuzzball Microstate...' : 'Lock Horizonless BFSS Fuzzball Microstate'}</span>
        </button>
      </div>

      {telemetry && (
        <div className="bg-violet-950/20 border border-violet-800/50 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-violet-900/50 pb-3">
            <div className="flex items-center space-x-2 text-violet-400 font-semibold text-sm">
              <Cpu className="w-4 h-4" />
              <span>BFSS Matrix Fuzzball Telemetry ({telemetry.config_id})</span>
            </div>
            <span className="text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
              {telemetry.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Matrix Unitarity</div>
              <div className="text-base font-bold text-violet-300">
                {telemetry.matrix_fuzzball_unitarity_pct}%
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Commutator Suppression</div>
              <div className="text-base font-bold text-indigo-300">
                {telemetry.commutator_suppression_db} dB
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Frobenius Norm</div>
              <div className="text-base font-bold text-emerald-300">
                {telemetry.commutator_frobenius_norm}
              </div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
              <div className="text-slate-400 mb-1">Singularity Drift</div>
              <div className="text-base font-bold text-teal-300">
                {telemetry.singularity_drift_residual}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

