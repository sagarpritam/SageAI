"use client";

import { useState, useEffect } from "react";
import { Radar, Play, Loader2, CheckCircle, Lock, Zap } from "lucide-react";
import axios from "axios";

interface IntelModule {
  id: string;
  name: string;
  number: string;
  description: string;
  tier: string;
  available: boolean;
}

export function IntelligenceHub() {
  const [modules, setModules] = useState<IntelModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [sweepTarget, setSweepTarget] = useState("");
  const [sweepType, setSweepType] = useState("domain");
  const [sweeping, setSweeping] = useState(false);
  const [sweepResults, setSweepResults] = useState<Record<string, unknown> | null>(null);
  const [sweepError, setSweepError] = useState("");

  useEffect(() => {
    axios
      .get("/api/intel")
      .then((r) => setModules(r.data.modules || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const runSweep = async () => {
    if (!sweepTarget.trim()) return;
    setSweeping(true);
    setSweepResults(null);
    setSweepError("");
    try {
      const r = await axios.post("/api/intel", {
        target: sweepTarget,
        target_type: sweepType,
      });
      setSweepResults(r.data.results || r.data);
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        setSweepError(e.response?.data?.detail || "Sweep failed");
      } else {
        setSweepError("Sweep failed");
      }
    } finally {
      setSweeping(false);
    }
  };

  const tierColors: Record<string, string> = {
    pro: "text-amber-400 bg-amber-900/30",
    free: "text-emerald-400 bg-emerald-900/30",
  };

  return (
    <div className="space-y-6">
      {/* Sweep Launcher */}
      <div className="bg-zinc-900/60 border border-emerald-900/30 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
          <Zap className="w-4 h-4" /> Full Intelligence Sweep (Blacklight)
        </h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={sweepTarget}
            onChange={(e) => setSweepTarget(e.target.value)}
            placeholder="Target (e.g., example.com)"
            className="flex-1 bg-black/50 border border-zinc-700 rounded-lg px-4 py-2 text-white font-mono text-sm placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
          />
          <select aria-label="Filter platform"
            value={sweepType}
            onChange={(e) => setSweepType(e.target.value)}
            className="bg-black/50 border border-zinc-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
          >
            <option value="domain">Domain</option>
            <option value="ip">IP</option>
            <option value="email">Email</option>
            <option value="username">Username</option>
            <option value="phone">Phone</option>
          </select>
          <button
            onClick={runSweep}
            disabled={sweeping || !sweepTarget.trim()}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 text-white font-bold px-6 py-2 rounded-lg transition-colors text-sm flex items-center gap-2"
          >
            {sweeping ? <><Loader2 className="w-4 h-4 animate-spin" /> Sweeping...</> : <><Play className="w-4 h-4" /> Run Sweep</>}
          </button>
        </div>
        {sweepError && <p className="text-sm text-red-400">{sweepError}</p>}
      </div>

      {/* Module Grid */}
      <div>
        <h3 className="text-sm font-bold text-zinc-400 flex items-center gap-2 mb-4">
          <Radar className="w-4 h-4 text-emerald-400" /> Intelligence Modules
        </h3>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-24 bg-zinc-900/40 rounded-lg animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {modules.map((mod) => (
              <div key={mod.id} className="bg-zinc-900/40 border border-zinc-800 hover:border-emerald-900/50 rounded-xl p-4 transition-colors group">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-[10px] font-mono text-zinc-600">{mod.number}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tierColors[mod.tier] || tierColors.free}`}>
                    {mod.tier === "pro" ? <span className="flex items-center gap-1"><Lock className="w-2.5 h-2.5" /> PRO</span> : "FREE"}
                  </span>
                </div>
                <p className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">{mod.name}</p>
                <p className="text-xs text-zinc-500 mt-1">{mod.description}</p>
                {mod.available && <CheckCircle className="w-3 h-3 text-emerald-600 mt-2" />}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sweep Results */}
      {sweepResults && (
        <div className="bg-zinc-900/60 border border-emerald-900/30 rounded-xl p-5">
          <h3 className="text-sm font-bold text-emerald-400 mb-3">Sweep Results</h3>
          <pre className="text-xs text-zinc-400 bg-black/50 rounded-lg p-3 overflow-auto max-h-80 font-mono">
            {JSON.stringify(sweepResults, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
