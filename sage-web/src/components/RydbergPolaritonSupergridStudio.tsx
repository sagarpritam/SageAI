'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Zap, AlertTriangle, CheckCircle2, BatteryCharging } from 'lucide-react';

interface RydbergCavity {
  cavity_id: string;
  classification: string;
  rabi_splitting_mev: number;
  condensate_density_cm3: number;
  base_harvest_mw: number;
  grid_efficiency_pct: number;
  status: string;
}

interface RydbergHarvestResult {
  cavity_id: string;
  classification: string;
  harvested_power_mw: number;
  bogoliubov_sound_velocity_m_s: number;
  grid_efficiency_pct: number;
  condensate_phase_coherence: number;
  temperature_k: number;
  harvest_status: string;
  timestamp: number;
}

export default function RydbergPolaritonSupergridStudio() {
  const [cavities, setCavities] = useState<RydbergCavity[]>([]);
  const [selectedCavity, setSelectedCavity] = useState<string>('RYDBERG-PEROVSKITE-CAVITY-01');
  const [excitonFraction, setExcitonFraction] = useState<number>(50.0);
  const [pumpFluence, setPumpFluence] = useState<number>(120.0);
  const [superfluidGain, setSuperfluidGain] = useState<number>(1.15);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<RydbergHarvestResult | null>(null);

  const fetchCavities = useCallback(async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/rydberg-polariton-supergrid/cavities');
      const data = (await res.json().catch(() => ({}))) as {
        cavities?: RydbergCavity[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load Rydberg polariton cavities');
      }
      if (data.cavities) {
        setCavities(data.cavities);
        if (data.cavities.length > 0) {
          setSelectedCavity((prev) => prev || data.cavities![0].cavity_id);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error loading polariton cavities';
      setErrorMsg(msg);
    }
  }, []);

  useEffect(() => {
    fetchCavities();
  }, [fetchCavities]);

  const handleHarvest = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/rydberg-polariton-supergrid/harvest-polariton', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cavity_id: selectedCavity,
          exciton_fraction_pct: excitonFraction,
          pump_fluence_uj_cm2: pumpFluence,
          superfluid_coupling_gain: superfluidGain,
          temperature_k: 295.0,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as RydbergHarvestResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to dispatch Rydberg polariton power');
      }
      setTelemetry(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Polariton power dispatch error';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Rydberg Exciton-Polariton Supergrid
            </h2>
            <p className="text-sm text-muted-foreground">
              Option B Wave 49 • Room-Temperature Perovskite BEC & Zero-Dissipation Superfluid Power
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchCavities}
          className="p-2 rounded-md hover:bg-muted text-muted-foreground transition-colors"
          title="Refresh cavities"
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
              Select Microcavity Array
            </label>
            <select
              value={selectedCavity}
              onChange={(e) => setSelectedCavity(e.target.value)}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-amber-500 focus:outline-none"
            >
              {cavities.map((c) => (
                <option key={c.cavity_id} value={c.cavity_id}>
                  {c.cavity_id} — {c.classification}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Hopfield Exciton Fraction ({excitonFraction}%)
            </label>
            <input
              type="range"
              min="10"
              max="90"
              value={excitonFraction}
              onChange={(e) => setExcitonFraction(parseFloat(e.target.value))}
              className="mt-1 w-full"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Pump Fluence ({pumpFluence} uJ/cm²)
            </label>
            <input
              type="range"
              min="20"
              max="500"
              value={pumpFluence}
              onChange={(e) => setPumpFluence(parseFloat(e.target.value))}
              className="mt-1 w-full"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Superfluid Gain ({superfluidGain}x)
            </label>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.05"
              value={superfluidGain}
              onChange={(e) => setSuperfluidGain(parseFloat(e.target.value))}
              className="mt-1 w-full"
            />
          </div>

          <button
            type="button"
            onClick={handleHarvest}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-md bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <BatteryCharging className="h-4 w-4" />}
            <span>Harvest Polariton Power</span>
          </button>
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-amber-500" />
              <span>Polariton Condensate & Superfluid Dispatch Ledger</span>
            </h3>

            {telemetry ? (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="p-3 rounded-md bg-background border border-border">
                  <div className="text-xs text-muted-foreground">Dispatched Power</div>
                  <div className="text-lg font-bold text-amber-500">
                    {telemetry.harvested_power_mw} MW
                  </div>
                </div>
                <div className="p-3 rounded-md bg-background border border-border">
                  <div className="text-xs text-muted-foreground">Bogoliubov Velocity</div>
                  <div className="text-lg font-bold text-foreground">
                    {telemetry.bogoliubov_sound_velocity_m_s} m/s
                  </div>
                </div>
                <div className="p-3 rounded-md bg-background border border-border">
                  <div className="text-xs text-muted-foreground">Grid Efficiency</div>
                  <div className="text-lg font-bold text-foreground">
                    {telemetry.grid_efficiency_pct}%
                  </div>
                </div>
                <div className="p-3 rounded-md bg-background border border-border">
                  <div className="text-xs text-muted-foreground">Phase Coherence</div>
                  <div className="text-lg font-bold text-foreground">
                    {telemetry.condensate_phase_coherence}
                  </div>
                </div>
                <div className="p-3 rounded-md bg-background border border-border">
                  <div className="text-xs text-muted-foreground">Temperature</div>
                  <div className="text-lg font-bold text-foreground">
                    {telemetry.temperature_k} K
                  </div>
                </div>
                <div className="p-3 rounded-md bg-background border border-border">
                  <div className="text-xs text-muted-foreground">Dispatch Status</div>
                  <div className="text-xs font-bold text-amber-400 mt-1">
                    {telemetry.harvest_status}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-8 text-center text-sm text-muted-foreground">
                Select a room-temperature Rydberg polariton cavity array and dispatch zero-dissipation superfluid power.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
