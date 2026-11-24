'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles, Shield, AlertTriangle, ShieldCheck } from 'lucide-react';

interface MotivicScheme {
  motive_id: string;
  classification: string;
  nisnevich_dimension: number;
  milnor_residue: string;
  motivic_weight: number;
  base_fidelity_pct: number;
  status: string;
}

interface MotivicHomotopyResult {
  motive_id: string;
  classification: string;
  slice_filtration_level: number;
  milnor_k_norm: number;
  nisnevich_cohomology_degree: number;
  effective_fidelity_pct: number;
  motivic_barrier_gev: number;
  motivic_suppression_db: number;
  homotopy_status: string;
  timestamp: number;
}

export default function VoevodskyMotivicStudio() {
  const [motives, setMotives] = useState<MotivicScheme[]>([]);
  const [selectedMotive, setSelectedMotive] = useState<string>('MOTIVIC-MGL-SPHERE-01');
  const [sliceLevel, setSliceLevel] = useState<number>(3);
  const [cohomologyDegree, setCohomologyDegree] = useState<number>(2);
  const [homotopyGain, setHomotopyGain] = useState<number>(1.2);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<MotivicHomotopyResult | null>(null);

  const fetchMotives = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/voevodsky-motivic-shield/motives');
      const data = (await res.json().catch(() => ({}))) as {
        motives?: MotivicScheme[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load Voevodsky motivic schemes');
      }
      if (data.motives) {
        setMotives(data.motives);
        if (data.motives.length > 0) {
          setSelectedMotive((prev) => prev || data.motives![0].motive_id);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error loading motivic schemes';
      setErrorMsg(msg);
    }
  }, []);

  useEffect(() => {
    fetchMotives();
  }, [fetchMotives]);

  const handleEvaluate = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/voevodsky-motivic-shield/evaluate-homotopy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          motive_id: selectedMotive,
          slice_filtration_level: sliceLevel,
          nisnevich_cohomology_degree: cohomologyDegree,
          weight_p: 4,
          homotopy_gain: homotopyGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as MotivicHomotopyResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to evaluate Voevodsky motivic homotopy barrier');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Evaluation error encountered';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Voevodsky Motivic Homotopy Shield
            </h2>
            <p className="text-sm text-muted-foreground">
              Capability 168 • Derived A^1-Homotopy, Nisnevich Topology & Algebraic Cobordism MGL
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchMotives}
          className="p-2 rounded-md hover:bg-muted text-muted-foreground transition-colors"
          title="Refresh motives"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {errorMsg && (
        <div role="alert" className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-xs font-semibold hover:underline ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Select Motivic Scheme
            </label>
            <select
              value={selectedMotive}
              onChange={(e) => setSelectedMotive(e.target.value)}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-indigo-500 focus:outline-none"
            >
              {motives.map((m) => (
                <option key={m.motive_id} value={m.motive_id}>
                  {m.motive_id} — {m.classification}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Slice Filtration Level ({sliceLevel})
            </label>
            <input
              type="range"
              min="1"
              max="8"
              value={sliceLevel}
              onChange={(e) => setSliceLevel(parseInt(e.target.value, 10))}
              className="mt-1 w-full"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Nisnevich Degree ({cohomologyDegree})
            </label>
            <input
              type="range"
              min="0"
              max="6"
              value={cohomologyDegree}
              onChange={(e) => setCohomologyDegree(parseInt(e.target.value, 10))}
              className="mt-1 w-full"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Homotopy Gain ({homotopyGain}x)
            </label>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.05"
              value={homotopyGain}
              onChange={(e) => setHomotopyGain(parseFloat(e.target.value))}
              className="mt-1 w-full"
            />
          </div>

          <button
            type="button"
            onClick={handleEvaluate}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            <span>Evaluate Motivic Homotopy</span>
          </button>
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4 text-indigo-500" />
              <span>Motivic Barrier & Milnor Invariant Ledger</span>
            </h3>

            {telemetry ? (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="p-3 rounded-md bg-background border border-border">
                  <div className="text-xs text-muted-foreground">Milnor K-Norm</div>
                  <div className="text-lg font-bold text-foreground">
                    {telemetry.milnor_k_norm}
                  </div>
                </div>
                <div className="p-3 rounded-md bg-background border border-border">
                  <div className="text-xs text-muted-foreground">Motivic Barrier</div>
                  <div className="text-lg font-bold text-indigo-500">
                    {telemetry.motivic_barrier_gev} GeV
                  </div>
                </div>
                <div className="p-3 rounded-md bg-background border border-border">
                  <div className="text-xs text-muted-foreground">Effective Fidelity</div>
                  <div className="text-lg font-bold text-foreground">
                    {telemetry.effective_fidelity_pct}%
                  </div>
                </div>
                <div className="p-3 rounded-md bg-background border border-border">
                  <div className="text-xs text-muted-foreground">Suppression DB</div>
                  <div className="text-lg font-bold text-indigo-500">
                    -{telemetry.motivic_suppression_db} dB
                  </div>
                </div>
                <div className="p-3 rounded-md bg-background border border-border">
                  <div className="text-xs text-muted-foreground">Slice Level</div>
                  <div className="text-lg font-bold text-foreground">
                    L-{telemetry.slice_filtration_level}
                  </div>
                </div>
                <div className="p-3 rounded-md bg-background border border-border">
                  <div className="text-xs text-muted-foreground">Seal Status</div>
                  <div className="text-xs font-bold text-indigo-400 mt-1">
                    {telemetry.homotopy_status}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-8 text-center text-sm text-muted-foreground">
                Select an algebraic motive and evaluate A^1-homotopy localization to synthesize Voevodsky cobordism barriers.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
