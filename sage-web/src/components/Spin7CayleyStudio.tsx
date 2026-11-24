'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles, Shield, AlertTriangle, ShieldCheck } from 'lucide-react';

interface Spin7Manifold {
  manifold_id: string;
  classification: string;
  betti_b4_plus: number;
  betti_b4_minus: number;
  cayley_volume: number;
  base_calibration_fidelity_pct: number;
  status: string;
}

interface Spin7CalibrationResult {
  manifold_id: string;
  classification: string;
  cayley_order: number;
  calibrated_cayley_volume: number;
  octonionic_instanton_action: number;
  effective_fidelity_pct: number;
  spin7_shield_strength_pev: number;
  spin7_suppression_db: number;
  self_dual_precision: number;
  calibration_status: string;
  timestamp: number;
}

export default function Spin7CayleyStudio() {
  const [manifolds, setManifolds] = useState<Spin7Manifold[]>([]);
  const [selectedManifold, setSelectedManifold] = useState<string>('SPIN7-JOYCE-TORUS-01');
  const [cayleyOrder, setCayleyOrder] = useState<number>(4);
  const [sliceDepth, setSliceDepth] = useState<number>(8);
  const [calibrationGain, setCalibrationGain] = useState<number>(1.25);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<Spin7CalibrationResult | null>(null);

  const fetchManifolds = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/spin7-cayley-shield/manifolds');
      const data = (await res.json().catch(() => ({}))) as {
        manifolds?: Spin7Manifold[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load Spin(7) holonomy manifolds');
      }
      if (data.manifolds) {
        setManifolds(data.manifolds);
        if (data.manifolds.length > 0) {
          setSelectedManifold((prev) => prev || data.manifolds![0].manifold_id);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error loading Spin(7) manifolds';
      setErrorMsg(msg);
    }
  }, []);

  useEffect(() => {
    fetchManifolds();
  }, [fetchManifolds]);

  const handleCalibrate = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/spin7-cayley-shield/calibrate-cayley', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manifold_id: selectedManifold,
          cayley_order: cayleyOrder,
          self_dual_precision: 1e-6,
          octonionic_slice_depth: sliceDepth,
          calibration_gain: calibrationGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as Spin7CalibrationResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to calibrate Spin(7) Cayley 4-cycles');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Calibration error encountered';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Spin(7) Holonomy Cayley 4-Cycle Shield
            </h2>
            <p className="text-sm text-muted-foreground">
              Capability 167 • Berger Exceptional Holonomy & 8D Instanton Anomaly Suppression
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchManifolds}
          className="p-2 rounded-md hover:bg-muted text-muted-foreground transition-colors"
          title="Refresh manifolds"
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
              Select Spin(7) 8-Manifold
            </label>
            <select
              value={selectedManifold}
              onChange={(e) => setSelectedManifold(e.target.value)}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-emerald-500 focus:outline-none"
            >
              {manifolds.map((m) => (
                <option key={m.manifold_id} value={m.manifold_id}>
                  {m.manifold_id} — {m.classification}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Cayley 4-Form Topological Order ({cayleyOrder})
            </label>
            <input
              type="range"
              min="1"
              max="16"
              value={cayleyOrder}
              onChange={(e) => setCayleyOrder(parseInt(e.target.value, 10))}
              className="mt-1 w-full"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Octonionic Slice Depth ({sliceDepth})
            </label>
            <input
              type="range"
              min="1"
              max="16"
              value={sliceDepth}
              onChange={(e) => setSliceDepth(parseInt(e.target.value, 10))}
              className="mt-1 w-full"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Calibration Gain ({calibrationGain}x)
            </label>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.05"
              value={calibrationGain}
              onChange={(e) => setCalibrationGain(parseFloat(e.target.value))}
              className="mt-1 w-full"
            />
          </div>

          <button
            type="button"
            onClick={handleCalibrate}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            <span>Calibrate Cayley 4-Cycles</span>
          </button>
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Cayley Calibration & Telemetry Ledger</span>
            </h3>

            {telemetry ? (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="p-3 rounded-md bg-background border border-border">
                  <div className="text-xs text-muted-foreground">Calibrated Volume</div>
                  <div className="text-lg font-bold text-foreground">
                    {telemetry.calibrated_cayley_volume}
                  </div>
                </div>
                <div className="p-3 rounded-md bg-background border border-border">
                  <div className="text-xs text-muted-foreground">Instanton Action</div>
                  <div className="text-lg font-bold text-emerald-500">
                    {telemetry.octonionic_instanton_action}
                  </div>
                </div>
                <div className="p-3 rounded-md bg-background border border-border">
                  <div className="text-xs text-muted-foreground">Effective Fidelity</div>
                  <div className="text-lg font-bold text-foreground">
                    {telemetry.effective_fidelity_pct}%
                  </div>
                </div>
                <div className="p-3 rounded-md bg-background border border-border">
                  <div className="text-xs text-muted-foreground">Shield Strength</div>
                  <div className="text-lg font-bold text-foreground">
                    {telemetry.spin7_shield_strength_pev} PeV
                  </div>
                </div>
                <div className="p-3 rounded-md bg-background border border-border">
                  <div className="text-xs text-muted-foreground">Suppression DB</div>
                  <div className="text-lg font-bold text-emerald-500">
                    -{telemetry.spin7_suppression_db} dB
                  </div>
                </div>
                <div className="p-3 rounded-md bg-background border border-border">
                  <div className="text-xs text-muted-foreground">Seal Status</div>
                  <div className="text-xs font-bold text-emerald-400 mt-1">
                    {telemetry.calibration_status}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-8 text-center text-sm text-muted-foreground">
                Select an 8D Spin(7) manifold and execute Cayley calibration to view real-time Berger holonomy metrics.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
