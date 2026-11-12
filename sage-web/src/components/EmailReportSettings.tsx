"use client";

import { useState, useEffect } from "react";
import { Mail, Plus, X, Save, Loader2, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import axios from "axios";

interface EmailConfig {
  recipients: string[];
  frequency: string;
  enabled: boolean;
  format: string;
}

const frequencies = [
  { value: "daily", label: "Daily Digest" },
  { value: "weekly", label: "Weekly Summary" },
  { value: "biweekly", label: "Bi-Weekly Report" },
  { value: "monthly", label: "Monthly Executive Report" },
];

export function EmailReportSettings() {
  const [config, setConfig] = useState<EmailConfig>({
    recipients: [],
    frequency: "weekly",
    enabled: false,
    format: "pdf",
  });
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get("/api/email-reports")
      .then((r) => {
        setConfig((prev) => ({ ...prev, ...r.data }));
        setErrorMsg(null);
      })
      .catch((err: unknown) => {
        const msg = axios.isAxiosError(err)
          ? err.response?.data?.error ||
            err.response?.data?.detail ||
            "Failed to load email report configuration."
          : "Failed to load email report configuration.";
        setErrorMsg(String(msg));
      })
      .finally(() => setLoading(false));
  }, []);

  const addRecipient = () => {
    const email = newEmail.trim().toLowerCase();
    if (email && email.includes("@") && !config.recipients.includes(email)) {
      setConfig({ ...config, recipients: [...config.recipients, email] });
      setNewEmail("");
    }
  };

  const removeRecipient = (email: string) => {
    setConfig({
      ...config,
      recipients: config.recipients.filter((r) => r !== email),
    });
  };

  const saveConfig = async () => {
    setSaving(true);
    setSaved(false);
    setErrorMsg(null);
    try {
      await axios.post("/api/email-reports", config);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.error ||
          err.response?.data?.detail ||
          "Failed to save email report configuration."
        : "Failed to save email report configuration.";
      setErrorMsg(String(msg));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/60 border border-emerald-900/30 rounded-xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Mail className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">Scheduled Email Reports</h3>
        </div>
        <button
          type="button"
          onClick={() => setConfig({ ...config, enabled: !config.enabled })}
          className={`relative w-11 h-6 rounded-full transition-colors ${
            config.enabled ? "bg-emerald-600" : "bg-zinc-700"
          }`}
          aria-label="Toggle email reports"
        >
          <span
            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
              config.enabled ? "translate-x-5.5" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="bg-red-950/40 border border-red-700/50 rounded-lg px-4 py-3 text-xs font-mono text-red-300 flex items-center gap-2"
        >
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {config.enabled && (
        <>
          {/* Frequency */}
          <div>
            <label className="text-xs text-zinc-500 font-mono uppercase tracking-wider mb-2 block">
              Report Frequency
            </label>
            <div className="grid grid-cols-2 gap-2">
              {frequencies.map((f) => (
                <button
                  type="button"
                  key={f.value}
                  onClick={() => setConfig({ ...config, frequency: f.value })}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
                    config.frequency === f.value
                      ? "bg-emerald-900/40 text-emerald-400 border border-emerald-500/50"
                      : "bg-zinc-800/50 text-zinc-400 border border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Format */}
          <div>
            <label className="text-xs text-zinc-500 font-mono uppercase tracking-wider mb-2 block">
              Report Format
            </label>
            <div className="flex gap-2">
              {["pdf", "csv", "json"].map((fmt) => (
                <button
                  type="button"
                  key={fmt}
                  onClick={() => setConfig({ ...config, format: fmt })}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                    config.format === fmt
                      ? "bg-emerald-900/40 text-emerald-400 border border-emerald-500/50"
                      : "bg-zinc-800/50 text-zinc-400 border border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          {/* Recipients */}
          <div>
            <label className="text-xs text-zinc-500 font-mono uppercase tracking-wider mb-2 block">
              Recipients
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addRecipient()}
                placeholder="team@company.com"
                className="flex-1 bg-black/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50"
              />
              <button
                type="button"
                onClick={addRecipient}
                className="px-3 py-2 bg-emerald-900/30 text-emerald-400 rounded-lg hover:bg-emerald-900/50 transition-colors"
                aria-label="Add recipient"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {config.recipients.length === 0 ? (
              <p className="text-xs text-zinc-600">No recipients added yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {config.recipients.map((email) => (
                  <span
                    key={email}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800/50 border border-zinc-700 rounded-full text-xs text-zinc-300"
                  >
                    {email}
                    <button
                      type="button"
                      onClick={() => removeRecipient(email)}
                      className="text-zinc-500 hover:text-red-400 transition-colors"
                      aria-label={`Remove ${email}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Save Button */}
          <button
            type="button"
            onClick={saveConfig}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 text-white font-bold rounded-lg transition-colors text-sm w-full justify-center"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? "Saving..." : saved ? "Saved!" : "Save Configuration"}
          </button>
        </>
      )}
    </div>
  );
}
