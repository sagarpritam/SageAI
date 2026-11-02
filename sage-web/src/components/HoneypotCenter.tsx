"use client";

import { useState, useEffect } from "react";
import { ShieldAlert, Key, Globe, Copy, Check, RefreshCw, AlertTriangle, Radio } from "lucide-react";
import axios from "axios";

interface Decoy {
  path: string;
  type: string;
  lure: string;
}

interface CanaryToken {
  token_id: string;
  canary_value: string;
  token_type: string;
  label: string;
  created_at: string;
}

interface DeceptionAlert {
  event_id: string;
  type: string;
  severity: string;
  path?: string;
  source_ip: string;
  user_agent?: string;
  fingerprint?: string;
  timestamp: string;
  confidence: string;
  threat_verdict?: string;
}

export function HoneypotCenter() {
  const [decoys, setDecoys] = useState<Decoy[]>([]);
  const [alerts, setAlerts] = useState<DeceptionAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [tokenType, setTokenType] = useState("api_key");
  const [tokenLabel, setTokenLabel] = useState("Production Database Credential");
  const [createdToken, setCreatedToken] = useState<CanaryToken | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/deception");
      setDecoys(res.data.decoys || []);
      setAlerts(res.data.alerts || []);
    } catch {
      // fallback mock decoys if offline
      setDecoys([
        { path: "/wp-login.php", type: "WordPress Admin Decoy", lure: "CMS Login" },
        { path: "/.env", type: "Configuration Decoy", lure: "Secrets Disclosure" },
        { path: "/admin/phpmyadmin", type: "Database Interface Decoy", lure: "DB Management" },
        { path: "/actuator/env", type: "Spring Actuator Decoy", lure: "Microservice Secrets" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerateCanary = async () => {
    setGenerating(true);
    try {
      const res = await axios.post("/api/deception/canary", {
        token_type: tokenType,
        label: tokenLabel,
      });
      if (res.data?.canary_token) {
        setCreatedToken(res.data.canary_token);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (val: string) => {
    navigator.clipboard.writeText(val);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 rounded-xl bg-gradient-to-r from-red-950/30 via-zinc-900/60 to-black border border-red-900/30">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-red-400 animate-pulse" />
            <h2 className="text-xl font-bold text-white tracking-wide">Deception Technology & Honeypots</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Controlled decoys & canary credentials. Probes trigger 100% confidence, zero false-positive alerts.
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300 hover:text-white hover:border-zinc-700 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Decoys
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Decoy Endpoints & Canary Generator */}
        <div className="lg:col-span-1 space-y-6">
          {/* Canary Token Creator */}
          <div className="p-5 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-4">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">Generate Canary Honey-Token</h3>
            </div>
            <p className="text-xs text-zinc-400">
              Plant fake credentials in code repositories or config files. Any access indicates an active breach.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Token Type</label>
                <select
                  value={tokenType}
                  onChange={(e) => setTokenType(e.target.value)}
                  className="w-full bg-black/60 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="api_key">API Key (sage_honey_live_...)</option>
                  <option value="aws_key">AWS Access Key (AKIA...)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Lure Placement Label</label>
                <input
                  type="text"
                  value={tokenLabel}
                  onChange={(e) => setTokenLabel(e.target.value)}
                  placeholder="e.g. Production S3 Backup Key"
                  className="w-full bg-black/60 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                onClick={handleGenerateCanary}
                disabled={generating}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-black font-semibold text-xs transition"
              >
                {generating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Key className="w-3.5 h-3.5" />}
                Generate Honey-Token
              </button>
            </div>

            {createdToken && (
              <div className="mt-4 p-3 rounded-lg bg-black/80 border border-emerald-900/50 space-y-2">
                <span className="text-[10px] uppercase font-mono text-emerald-400 block">Canary Value Generated</span>
                <div className="flex items-center justify-between gap-2">
                  <code className="text-xs font-mono text-zinc-200 truncate">{createdToken.canary_value}</code>
                  <button
                    onClick={() => copyToClipboard(createdToken.canary_value)}
                    className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Decoy Endpoints List */}
          <div className="p-5 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-3">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-red-400" />
              <h3 className="text-sm font-semibold text-white">Active Decoy Lures ({decoys.length})</h3>
            </div>
            <div className="space-y-2">
              {decoys.map((d, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-black/50 border border-zinc-900 text-xs">
                  <div>
                    <code className="text-red-400 font-mono">{d.path}</code>
                    <p className="text-[10px] text-zinc-500">{d.type}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-red-950/40 text-red-300 border border-red-900/30">
                    Active Lure
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Deception Intrusion Feed */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-500" />
              <h3 className="text-sm font-semibold text-white">Confirmed Honeypot Intrusion Alerts</h3>
            </div>
            <span className="text-xs font-mono text-zinc-500">{alerts.length} logged events</span>
          </div>

          {alerts.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-zinc-800/80 rounded-xl space-y-2">
              <ShieldAlert className="w-8 h-8 text-zinc-600 mx-auto" />
              <p className="text-sm text-zinc-400 font-medium">No Honeypot Triggers Detected</p>
              <p className="text-xs text-zinc-600 max-w-sm mx-auto">
                Decoy endpoints and canary credentials are live. Any unauthorized access will appear here in real-time.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
              {alerts.map((alert, i) => (
                <div
                  key={i}
                  className="p-4 rounded-lg bg-black/60 border border-red-900/40 hover:border-red-700/60 transition space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-xs font-bold text-red-400">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                      {alert.type}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {new Date(alert.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-200">
                    {alert.threat_verdict || `Intrusion attempt from IP ${alert.source_ip}`}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-[11px] font-mono text-zinc-400">
                    <div>
                      <span className="text-zinc-600 block">Attacker IP:</span>
                      <span className="text-zinc-200">{alert.source_ip}</span>
                    </div>
                    {alert.fingerprint && (
                      <div>
                        <span className="text-zinc-600 block">TLS Fingerprint:</span>
                        <span className="text-zinc-200">{alert.fingerprint}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-zinc-600 block">Confidence:</span>
                      <span className="text-emerald-400">{alert.confidence}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

