"use client";

import { useState, useEffect } from "react";
import { GitBranch, Play, CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react";
import axios from "axios";

interface FixResult {
  status: string;
  message?: string;
  scan_results?: Record<string, unknown>;
  fix_results?: Record<string, unknown>;
}

export function AutoFixPanel() {
  const [ready, setReady] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [checkingStatus, setCheckingStatus] = useState(true);

  const [repo, setRepo] = useState("");
  const [branch, setBranch] = useState("main");
  const [maxFixes, setMaxFixes] = useState(5);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<FixResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get("/api/autofix")
      .then((r) => {
        setReady(r.data.ready);
        setStatusMsg(r.data.message);
      })
      .catch(() => setStatusMsg("Failed to check autofix status."))
      .finally(() => setCheckingStatus(false));
  }, []);

  const handleRun = async () => {
    if (!repo.trim()) return;
    setRunning(true);
    setResult(null);
    setError("");

    try {
      const r = await axios.post("/api/autofix", {
        repository: repo,
        branch,
        max_fixes: maxFixes,
      });
      setResult(r.data);
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        setError(e.response?.data?.detail || e.message);
      } else {
        setError("Autofix run failed.");
      }
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Check */}
      <div className={`rounded-xl p-5 border ${ready ? "bg-emerald-950/30 border-emerald-700/40" : "bg-zinc-900/60 border-zinc-700/40"}`}>
        <div className="flex items-center gap-3">
          {checkingStatus ? (
            <Loader2 className="w-5 h-5 text-zinc-500 animate-spin" />
          ) : ready ? (
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-400" />
          )}
          <div>
            <p className="text-sm font-bold text-white">
              {checkingStatus ? "Checking status..." : ready ? "Self-Healing Code Ready" : "Configuration Needed"}
            </p>
            <p className="text-xs text-zinc-400 mt-0.5">{statusMsg}</p>
          </div>
        </div>
      </div>

      {/* Run Panel */}
      <div className="bg-zinc-900/60 border border-emerald-900/30 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
          <GitBranch className="w-4 h-4" /> Run Auto-Fix on Repository
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
            placeholder="owner/repo"
            className="col-span-2 bg-black/50 border border-zinc-700 rounded-lg px-4 py-2 text-white font-mono text-sm placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
          />
          <input
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            placeholder="Branch"
            className="bg-black/50 border border-zinc-700 rounded-lg px-4 py-2 text-white font-mono text-sm placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
        <div className="flex items-center gap-4">
          <label className="text-xs text-zinc-400 font-mono">
            Max Fixes:
            <input
              type="number"
              min={1}
              max={20}
              value={maxFixes}
              onChange={(e) => setMaxFixes(Number(e.target.value))}
              className="ml-2 w-16 bg-black/50 border border-zinc-700 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </label>
          <button
            onClick={handleRun}
            disabled={running || !repo.trim()}
            className="ml-auto bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 text-white font-bold px-6 py-2 rounded-lg transition-colors text-sm flex items-center gap-2"
          >
            {running ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Running...</>
            ) : (
              <><Play className="w-4 h-4" /> Run Auto-Fix</>
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      {error && (
        <div className="bg-red-950/40 border border-red-700/40 rounded-xl p-4 flex items-start gap-3">
          <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {result && (
        <div className="bg-zinc-900/60 border border-emerald-900/30 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <p className="text-sm font-bold text-white">
              {result.status === "clean" ? "No Vulnerabilities Found 🎉" : "Auto-Fix Completed"}
            </p>
          </div>
          {result.message && <p className="text-xs text-zinc-400">{result.message}</p>}
          <pre className="text-xs text-zinc-500 bg-black/50 rounded-lg p-3 overflow-auto max-h-60 font-mono">
            {JSON.stringify(result.fix_results || result.scan_results, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
