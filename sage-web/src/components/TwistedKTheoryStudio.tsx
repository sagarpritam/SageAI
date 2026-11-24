'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles, Shield, AlertTriangle, ShieldCheck } from 'lucide-react';

interface TwistedComplex {
  complex_id: string;
  classification: string;
  dixmier_douady_class: number;
  ahss_rank: number;
  freed_witten_invariant: number;
  base_fidelity_pct: number;
  status: string;
}

interface TwistedKResult {
  complex_id: string;
  classification: string;
  dixmier_douady_flux: number;
  ramond_ramond_norm: number;
  ahss_filtration_depth: number;
  effective_fidelity_pct: number;
  hardened_firewall_gev: number;
  anomaly_suppression_db: number;
  cancellation_status: string;
  timestamp: number;
}

export default function TwistedKTheoryStudio() {
  const [complexes, setComplexes] = useState<TwistedComplex[]>([]);
  const [selectedComplex, setSelectedComplex] = useState<string>('TWISTED-K-K3-H3-01');
  const [ddFlux, setDdFlux] = useState<number>(3);
  const [ahssDepth, setAhssDepth] = useState<number>(6);
  const [branesCharge, setBranesCharge] = useState<number>(4);
  const [cancellationGain, setCancellationGain] = useState<number>(1.2);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<TwistedKResult | null>(null);

  const fetchComplexes = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/twisted-k-theory/complexes');
      const data = (await res.json().catch(() => ({}))) as {
        complexes?: TwistedComplex[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load twisted K-theory complexes');
      }
      if (data.complexes) {
        setComplexes(data.complexes);
        if (data.complexes.length > 0) {
          setSelectedComplex((prev) => prev || data.complexes![0].complex_id);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error loading twisted K complexes';
      setErrorMsg(msg);
    }
  }, []);

  useEffect(() => {
    fetchComplexes();
  }, [fetchComplexes]);

  const handleCancelAnomaly = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/twisted-k-theory/cancel-anomaly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          complex_id: selectedComplex,
          dixmier_douady_flux: ddFlux,
          ahss_filtration_depth: ahssDepth,
          branes_charge_n: branesCharge,
          cancellation_gain: cancellationGain,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as TwistedKResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to cancel Freed-Witten anomaly');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Anomaly cancellation error encountered';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-500">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Twisted K-Theory D-Brane Shield
            </h2>
            <p className="text-sm text-muted-foreground">
              Capability 169 • Freed-Witten Anomaly Firewall & Ramond-Ramond Charge Quantization
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchComplexes}
          className="p-2 rounded-md hover:bg-muted text-muted-foreground transition-colors"
          title="Refresh complexes"
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
              Select Twisted K-Theory Complex
            </label>
            <select
              value={selectedComplex}
              onChange={(e) => setSelectedComplex(e.target.value)}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-cyan-500 focus:outline-none"
            >
              {complexes.map((c) => (
                <option key={c.complex_id} value={c.complex_id}>
                  {c.complex_id} — {c.classification}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Dixmier-Douady Class [H] ({ddFlux})
            </label>
            <input
              type="range"
              min="1"
              max="16"
              value={ddFlux}
              onChange={(e) => setDdFlux(parseInt(e.target.value, 10))}
              className="mt-1 w-full"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              D-Brane Charge Multiplicity ({branesCharge})
            </label>
            <input
              type="range"
              min="1"
              max="16"
              value={branesCharge}
              onChange={(e) => setBranesCharge(parseInt(e.target.value, 10))}
              className="mt-1 w-full"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Cancellation Gain ({cancellationGain}x)
            </label>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.05"
              value={cancellationGain}
              onChange={(e) => setCancellationGain(parseFloat(e.target.value))}
              className="mt-1 w-full"
            />
          </div>

          <button
            type="button"
            onClick={handleCancelAnomaly}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-md bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            <span>Cancel Freed-Witten Anomaly</span>
          </button>
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4 text-cyan-500" />
              <span>Ramond-Ramond Ledger & Anomaly Firewall</span>
            </h3>

            {telemetry ? (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="p-3 rounded-md bg-background border border-border">
                  <div className="text-xs text-muted-foreground">RR Charge Norm</div>
                  <div className="text-lg font-bold text-foreground">
                    {telemetry.ramond_ramond_norm}
                  </div>
                </div>
                <div className="p-3 rounded-md bg-background border border-border">
                  <div className="text-xs text-muted-foreground">Firewall Energy</div>
                  <div className="text-lg font-bold text-cyan-500">
                    {telemetry.hardened_firewall_gev} GeV
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
                  <div className="text-lg font-bold text-cyan-500">
                    -{telemetry.anomaly_suppression_db} dB
                  </div>
                </div>
                <div className="p-3 rounded-md bg-background border border-border">
                  <div className="text-xs text-muted-foreground">AHSS Depth</div>
                  <div className="text-lg font-bold text-foreground">
                    d_{telemetry.ahss_filtration_depth}
                  </div>
                </div>
                <div className="p-3 rounded-md bg-background border border-border">
                  <div className="text-xs text-muted-foreground">Seal Status</div>
                  <div className="text-xs font-bold text-cyan-400 mt-1">
                    {telemetry.cancellation_status}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-8 text-center text-sm text-muted-foreground">
                Select a twisted K-theory complex and cancel Freed-Witten anomalies to seal D-brane Ramond-Ramond charges.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
