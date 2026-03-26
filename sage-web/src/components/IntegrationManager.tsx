"use client";

import { useState, useEffect } from "react";
import { Github, Loader2, Key, CheckCircle2, XCircle } from "lucide-react";
import axios from "axios";

export function IntegrationManager() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<{ is_connected: boolean }>({ is_connected: false });
  const [pat, setPat] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchStatus = async () => {
    try {
      const { data } = await axios.get("/api/integrations/github");
      setStatus(data);
    } catch {
      setError("Failed to fetch Github integration status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleConnect = async () => {
    if (!pat) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await axios.post("/api/integrations/github", { pat });
      setStatus({ is_connected: true });
      setMessage("GitHub connected successfully. Auto-Fix can now create PRs.");
      setPat("");
    } catch {
      setError("Failed to connect GitHub. Please verify your PAT has 'repo' scope.");
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnect = async () => {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await axios.delete("/api/integrations/github");
      setStatus({ is_connected: false });
      setMessage("GitHub disconnected. Auto-Fix PRs are disabled.");
    } catch {
      setError("Failed to disconnect GitHub");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="animate-pulse h-32 bg-zinc-900/50 rounded-xl" />;

  return (
    <div className="bg-zinc-900/60 border border-emerald-900/30 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Github className="w-5 h-5 text-zinc-400" />
          GitHub Integration
        </h3>
        {status.is_connected ? (
          <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full border border-emerald-400/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> Connected
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 bg-zinc-800 px-2 py-1 rounded-full border border-zinc-700">
            <XCircle className="w-3.5 h-3.5" /> Not Connected
          </span>
        )}
      </div>

      <p className="text-sm text-zinc-400 mb-6">
        Connect your GitHub account using a Personal Access Token (PAT) to enable SageAI&apos;s Auto-Fix engine to directly open Pull Requests with vulnerability patches.
      </p>

      {!status.is_connected ? (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Personal Access Token</label>
            <div className="flex gap-3">
              <input 
                type="password" 
                value={pat} 
                onChange={e => setPat(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxx"
                className="flex-1 bg-black/50 border border-zinc-700 rounded-lg px-4 py-2 text-white font-mono text-sm placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
               />
              <button 
                onClick={handleConnect} 
                disabled={saving || !pat}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 text-white font-bold px-5 py-2 rounded-lg transition-colors text-sm flex items-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                Connect
              </button>
            </div>
          </div>
          <p className="text-xs text-zinc-500">Requires a token with <code className="text-emerald-400 bg-emerald-400/10 px-1 rounded">repo</code> scope.</p>
        </div>
      ) : (
        <div>
          <button 
            onClick={handleDisconnect} 
            disabled={saving}
            className="bg-red-600/20 hover:bg-red-500/30 text-red-500 hover:text-red-400 border border-red-500/30 hover:border-red-500/50 disabled:opacity-50 font-bold px-5 py-2 rounded-lg transition-colors text-sm"
          >
            {saving ? "Disconnecting..." : "Disconnect GitHub"}
          </button>
        </div>
      )}

      {error && <p className="text-sm text-red-400 mt-4">{error}</p>}
      {message && <p className="text-sm text-emerald-400 mt-4">{message}</p>}
    </div>
  );
}
