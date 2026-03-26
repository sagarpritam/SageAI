"use client";

import { useState, useEffect } from "react";
import { Target, Play, Loader2, Plus, ShieldAlert } from "lucide-react";
import axios from "axios";

interface AuditTarget {
  name: string;
  model: string;
  uri: string;
}

export function RedTeamPanel() {
  const [targets, setTargets] = useState<AuditTarget[]>([]);
  const [loading, setLoading] = useState(true);

  // Target form
  const [tName, setTName] = useState("");
  const [tModel, setTModel] = useState("");
  const [tUri, setTUri] = useState("");
  const [creating, setCreating] = useState(false);

  // Audit
  const [auditTarget, setAuditTarget] = useState("");
  const [probes, setProbes] = useState("jailbreak");
  const [auditing, setAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");

  const fetchTargets = () => {
    setLoading(true);
    axios
      .get("/api/redteam")
      .then((r) => {
        const t = r.data.targets || [];
        setTargets(Array.isArray(t) ? t : []);
      })
      .catch(() => setTargets([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTargets(); }, []);

  const handleCreateTarget = async () => {
    if (!tName || !tModel || !tUri) return;
    setCreating(true);
    try {
      await axios.post("/api/redteam", { name: tName, model: tModel, uri: tUri, _action: "target" });
      setTName(""); setTModel(""); setTUri("");
      fetchTargets();
    } catch {
      alert("Failed to register target");
    } finally {
      setCreating(false);
    }
  };

  const handleAudit = async () => {
    if (!auditTarget) return;
    setAuditing(true);
    setAuditResult(null);
    setError("");
    try {
      const r = await axios.post("/api/redteam", {
        _action: "audit",
        target_name: auditTarget,
        probes: probes.split(",").map(p => p.trim()),
      });
      setAuditResult(r.data);
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        setError(e.response?.data?.detail || "Audit failed");
      } else {
        setError("Audit failed");
      }
    } finally {
      setAuditing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Register Target */}
      <div className="bg-zinc-900/60 border border-emerald-900/30 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Register LLM Target
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input value={tName} onChange={e => setTName(e.target.value)} placeholder="Target name"
            className="bg-black/50 border border-zinc-700 rounded-lg px-4 py-2 text-white font-mono text-sm placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors" />
          <input value={tModel} onChange={e => setTModel(e.target.value)} placeholder="Model (e.g. gpt-4)"
            className="bg-black/50 border border-zinc-700 rounded-lg px-4 py-2 text-white font-mono text-sm placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors" />
          <input value={tUri} onChange={e => setTUri(e.target.value)} placeholder="API endpoint URI"
            className="bg-black/50 border border-zinc-700 rounded-lg px-4 py-2 text-white font-mono text-sm placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors" />
        </div>
        <button onClick={handleCreateTarget} disabled={creating || !tName || !tModel || !tUri}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 text-white font-bold px-5 py-2 rounded-lg transition-colors text-sm">
          {creating ? "Registering..." : "Register Target"}
        </button>
      </div>

      {/* Registered Targets */}
      <div>
        <h3 className="text-sm font-bold text-zinc-400 flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-emerald-400" /> Audit Targets
        </h3>
        {loading ? (
          <p className="text-zinc-500 font-mono text-sm animate-pulse">Loading targets...</p>
        ) : targets.length === 0 ? (
          <p className="text-zinc-600 font-mono text-sm">No targets registered yet. Add one above to start red teaming.</p>
        ) : (
          <div className="space-y-2">
            {targets.map((t, i) => (
              <div key={i} className="flex items-center justify-between bg-zinc-900/40 border border-zinc-800 rounded-lg px-4 py-3">
                <div>
                  <p className="text-white font-mono text-sm">{t.name}</p>
                  <p className="text-xs text-zinc-500">{t.model} · {t.uri}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Run Audit */}
      <div className="bg-zinc-900/60 border border-red-900/30 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-red-400 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" /> Launch Red Team Audit
        </h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <input value={auditTarget} onChange={e => setAuditTarget(e.target.value)} placeholder="Target name"
            className="flex-1 bg-black/50 border border-zinc-700 rounded-lg px-4 py-2 text-white font-mono text-sm placeholder:text-zinc-600 focus:outline-none focus:border-red-500 transition-colors" />
          <input value={probes} onChange={e => setProbes(e.target.value)} placeholder="Probes (e.g. jailbreak)"
            className="bg-black/50 border border-zinc-700 rounded-lg px-4 py-2 text-white font-mono text-sm placeholder:text-zinc-600 focus:outline-none focus:border-red-500 transition-colors" />
          <button onClick={handleAudit} disabled={auditing || !auditTarget}
            className="bg-red-600 hover:bg-red-500 disabled:bg-zinc-700 text-white font-bold px-6 py-2 rounded-lg transition-colors text-sm flex items-center gap-2">
            {auditing ? <><Loader2 className="w-4 h-4 animate-spin" /> Auditing...</> : <><Play className="w-4 h-4" /> Launch Audit</>}
          </button>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>

      {/* Audit Results */}
      {auditResult && (
        <div className="bg-zinc-900/60 border border-red-900/30 rounded-xl p-5">
          <h3 className="text-sm font-bold text-red-400 mb-3">Audit Results</h3>
          <pre className="text-xs text-zinc-400 bg-black/50 rounded-lg p-3 overflow-auto max-h-60 font-mono">
            {JSON.stringify(auditResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
