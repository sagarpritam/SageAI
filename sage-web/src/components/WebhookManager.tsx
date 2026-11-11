"use client";

import { useState, useEffect } from "react";
import { Webhook, Plus, Trash2, Loader2, AlertTriangle } from "lucide-react";
import axios from "axios";

interface WebhookItem {
  id: number | string;
  url: string;
  events: string[];
  secret?: string;
}

export function WebhookManager() {
  const [webhooks, setWebhooks] = useState<WebhookItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [url, setUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [events] = useState(["scan.completed", "scan.failed", "autofix.created"]);
  const [error, setError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | string | null>(null);
  const [deletingId, setDeletingId] = useState<number | string | null>(null);

  const fetchWebhooks = async () => {
    try {
      const { data } = await axios.get("/api/webhooks");
      setWebhooks(Array.isArray(data) ? data : []);
    } catch {
      setError("Failed to load webhooks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const handleAdd = async () => {
    if (!url) return;
    setSaving(true);
    setError("");
    try {
      await axios.post("/api/webhooks", {
        url,
        secret: secret || undefined,
        events,
        is_active: true,
      });
      setUrl("");
      setSecret("");
      fetchWebhooks();
    } catch {
      setError("Failed to create webhook. Verify the URL is valid.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number | string) => {
    setDeletingId(id);
    setError("");
    try {
      await axios.delete(`/api/webhooks?id=${encodeURIComponent(String(id))}`);
      setConfirmDeleteId(null);
      fetchWebhooks();
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.error || err.response?.data?.detail || "Failed to delete webhook."
        : "Failed to delete webhook.";
      setError(msg);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <div className="animate-pulse h-32 bg-zinc-900/50 rounded-xl" />;

  return (
    <div className="bg-zinc-900/60 border border-emerald-900/30 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Webhook className="w-5 h-5 text-emerald-400" />
          Event Webhooks
        </h3>
      </div>

      <p className="text-sm text-zinc-400 mb-6">
        Configure endpoints to receive real-time HTTP POST payloads when security events occur in your organization. All payloads are signed via HMAC-SHA256 if a secret is provided.
      </p>

      {error && (
        <div
          role="alert"
          className="mb-4 bg-red-950/40 border border-red-700/50 rounded-lg px-4 py-3 text-xs font-mono text-red-300 flex items-center gap-2"
        >
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* List Existing Webhooks */}
      <div className="space-y-3 mb-8">
        {webhooks.length === 0 ? (
          <div className="text-sm text-zinc-500 italic p-4 border border-dashed border-zinc-700 rounded-xl text-center">
            No webhooks configured.
          </div>
        ) : (
          webhooks.map((wh) => (
            <div
              key={wh.id}
              className="bg-black/40 border border-zinc-800 rounded-lg p-4 flex items-center justify-between gap-3"
            >
              <div>
                <p className="text-sm font-mono text-emerald-400 mb-1 break-all">{wh.url}</p>
                <div className="flex gap-2 text-xs text-zinc-500 flex-wrap">
                  {(wh.events || []).map((e: string) => (
                    <span key={e} className="bg-zinc-800 px-1.5 py-0.5 rounded">
                      {e}
                    </span>
                  ))}
                  {wh.secret ? (
                    <span className="bg-amber-900/20 text-amber-500 border border-amber-900/50 px-1.5 py-0.5 rounded">
                      Secured
                    </span>
                  ) : null}
                </div>
              </div>
              {confirmDeleteId === wh.id ? (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleDelete(wh.id)}
                    disabled={deletingId === wh.id}
                    className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-500 text-white text-xs font-bold disabled:opacity-50"
                  >
                    {deletingId === wh.id ? "Deleting..." : "Confirm Delete"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(null)}
                    disabled={deletingId === wh.id}
                    className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDeleteId(wh.id)}
                  className="text-zinc-500 hover:text-red-400 transition-colors p-2 shrink-0"
                  aria-label={`Delete webhook ${wh.url}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      <hr className="border-zinc-800 mb-6" />

      {/* Add New Webhook */}
      <h4 className="text-sm font-semibold text-white mb-4">Add Webhook</h4>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">Payload URL</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://api.yourdomain.com/webhooks/sageai"
            className="w-full bg-black/50 border border-zinc-700 rounded-lg px-4 py-2 text-white font-mono text-sm placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">Secret (Optional)</label>
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="Webhook signing secret"
            className="w-full bg-black/50 border border-zinc-700 rounded-lg px-4 py-2 text-white font-mono text-sm placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
        <div className="pt-2">
          <button
            onClick={handleAdd}
            disabled={saving || !url}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 text-white font-bold px-5 py-2 rounded-lg transition-colors text-sm flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Add Endpoint
          </button>
        </div>
      </div>
    </div>
  );
}
