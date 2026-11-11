"use client";

import { useState, useEffect } from "react";
import { Key, Plus, Trash2, Copy, Check, AlertTriangle } from "lucide-react";
import axios from "axios";

interface APIKeyItem {
  id: string;
  name: string;
  key_preview: string;
  is_active: boolean;
  last_used_at?: string;
  created_at?: string;
}

export function APIKeyManager() {
  const [keys, setKeys] = useState<APIKeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmRevokeId, setConfirmRevokeId] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const fetchKeys = () => {
    setLoading(true);
    axios
      .get("/api/api-keys")
      .then((r) => setKeys(Array.isArray(r.data) ? r.data : []))
      .catch(() => setKeys([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    setNewKey("");
    setErrorMsg(null);
    try {
      const r = await axios.post("/api/api-keys", { name: newName });
      setNewKey(r.data.key);
      setNewName("");
      fetchKeys();
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.error || err.response?.data?.detail || "Failed to create API key"
        : "Failed to create API key";
      setErrorMsg(String(msg));
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(newKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRevoke = async (id: string) => {
    setRevokingId(id);
    setErrorMsg(null);
    try {
      await axios.delete(`/api/api-keys?id=${encodeURIComponent(id)}`);
      setConfirmRevokeId(null);
      fetchKeys();
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.error || err.response?.data?.detail || "Failed to revoke API key"
        : "Failed to revoke API key";
      setErrorMsg(String(msg));
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {errorMsg && (
        <div
          role="alert"
          className="bg-red-950/40 border border-red-700/50 rounded-lg px-4 py-3 text-xs font-mono text-red-300 flex items-center gap-2"
        >
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Create */}
      <div className="bg-zinc-900/60 border border-emerald-900/30 rounded-xl p-5">
        <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2 mb-3">
          <Plus className="w-4 h-4" /> Create API Key
        </h3>
        <div className="flex gap-3">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Key name (e.g. CI/CD)"
            className="flex-1 bg-black/50 border border-zinc-700 rounded-lg px-4 py-2 text-white font-mono text-sm placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
          />
          <button
            onClick={handleCreate}
            disabled={creating || !newName.trim()}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 text-white font-bold px-5 py-2 rounded-lg transition-colors text-sm"
          >
            {creating ? "Creating..." : "Create"}
          </button>
        </div>
      </div>

      {/* New Key Display */}
      {newKey && (
        <div className="bg-amber-950/30 border border-amber-700/40 rounded-xl p-4 space-y-2">
          <p className="text-xs font-bold text-amber-400">
            ⚠ Copy this key now — it won&apos;t be shown again!
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-black/50 rounded-lg px-3 py-2 text-emerald-300 font-mono text-xs break-all">
              {newKey}
            </code>
            <button
              onClick={handleCopy}
              className="text-zinc-400 hover:text-emerald-400 transition-colors"
              aria-label="Copy new API key"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* Key List */}
      <div>
        <h3 className="text-sm font-bold text-zinc-400 flex items-center gap-2 mb-3">
          <Key className="w-4 h-4 text-emerald-400" /> Active Keys
        </h3>
        {loading ? (
          <p className="text-zinc-500 font-mono text-sm animate-pulse">Loading keys...</p>
        ) : keys.length === 0 ? (
          <p className="text-zinc-600 font-mono text-sm">No API keys yet.</p>
        ) : (
          <div className="space-y-2">
            {keys.map((k) => (
              <div
                key={k.id}
                className="flex items-center justify-between gap-3 bg-zinc-900/40 border border-zinc-800 rounded-lg px-4 py-3"
              >
                <div>
                  <p className="text-sm text-white font-mono">{k.name}</p>
                  <p className="text-xs text-zinc-500">
                    {k.key_preview} · {k.is_active ? "Active" : "Revoked"}
                  </p>
                </div>
                {k.is_active &&
                  (confirmRevokeId === k.id ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleRevoke(k.id)}
                        disabled={revokingId === k.id}
                        className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-500 text-white text-xs font-bold disabled:opacity-50"
                      >
                        {revokingId === k.id ? "Revoking..." : "Confirm Revoke"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmRevokeId(null)}
                        disabled={revokingId === k.id}
                        className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmRevokeId(k.id)}
                      className="text-zinc-600 hover:text-red-400 transition-colors"
                      aria-label={`Revoke key ${k.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
