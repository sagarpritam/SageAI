"use client";

import { useState, useEffect } from "react";
import {
  ShieldAlert,
  Key,
  Globe,
  Copy,
  Check,
  RefreshCw,
  AlertTriangle,
  Radio,
  Play,
  Cloud,
  Network,
  Cpu,
  Layers,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import axios from "axios";

interface Decoy {
  path: string;
  type: string;
  lure: string;
  category?: string;
}

interface CanaryToken {
  token_id: string;
  canary_value: string;
  token_type: string;
  label: string;
  created_at: string;
  triggered?: boolean;
  trigger_count?: number;
  last_triggered_by?: string;
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
  const [tokens, setTokens] = useState<CanaryToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any | null>(null);
  const [tokenType, setTokenType] = useState("api_key");
  const [tokenLabel, setTokenLabel] = useState("Production Database Credential");
  const [createdToken, setCreatedToken] = useState<CanaryToken | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [deceptionRes, tokensRes] = await Promise.all([
        axios.get("/api/deception"),
        axios.get("/api/deception/tokens").catch(() => ({ data: { tokens: [] } })),
      ]);
      setDecoys(deceptionRes.data.decoys || []);
      setAlerts(deceptionRes.data.alerts || []);
      setTokens(tokensRes.data.tokens || []);
    } catch {
      // Fallback
      setDecoys([
        { path: "/wp-login.php", type: "WordPress Admin Decoy", lure: "CMS Login", category: "web" },
        { path: "/.env", type: "Configuration Decoy", lure: "Secrets Disclosure", category: "web" },
        { path: "/.aws/credentials", type: "Cloud Credentials Decoy", lure: "AWS Secret Keys", category: "cloud" },
        { path: "tcp://0.0.0.0:2222", type: "SSH Honeypot Listener", lure: "Interactive SSH Decoy", category: "network" },
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
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleSimulateJourney = async () => {
    setSimulating(true);
    setSimulationResult(null);
    try {
      const res = await axios.post("/api/deception/simulate-attack", {
        decoy_path: "/.env",
        attacker_ip: "198.51.100.42",
      });
      if (res.data?.simulation) {
        setSimulationResult(res.data.simulation);
        fetchData(); // Refresh alerts and tokens
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSimulating(false);
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 rounded-2xl bg-gradient-to-r from-red-950/40 via-zinc-900/60 to-black border border-red-900/30">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-red-400 animate-pulse" />
            <h2 className="text-lg font-black text-white tracking-tight">
              Deception Mesh &amp; Dynamic Honeytokens
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Pillar V: High-fidelity decoy services, honey-endpoints, and tripwire canary credentials. Any interaction triggers a 100% confidence breach alert and automated SOAR containment.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSimulateJourney}
            disabled={simulating}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-xs font-bold text-white transition shadow-lg shadow-red-950/30 font-mono"
          >
            {simulating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            Test Deception Mesh
          </button>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300 hover:text-white hover:border-zinc-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Simulation Result Callout */}
      {simulationResult && (
        <div className="p-4 rounded-xl bg-black/90 border border-emerald-900/60 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs font-mono">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Deception Mesh Simulation Successful — Kill-Chain Intercepted</span>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">
              Incident {simulationResult.incident.incident_id} Auto-Escalated
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs">
            {simulationResult.journey.map((step: any, idx: number) => (
              <div key={idx} className="p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-900 space-y-1">
                <span className="text-[10px] text-emerald-400 font-bold block">STEP {step.step}</span>
                <p className="text-[11px] text-zinc-300">{step.action}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Decoy Endpoints & Canary Generator */}
        <div className="lg:col-span-1 space-y-6">
          {/* Canary Token Creator */}
          <div className="p-5 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-4">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs uppercase tracking-wider font-bold text-white font-mono">
                Forge Tripwire Canary Token
              </h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Plant fake credentials in GitHub repos, `.env` files, or DB backups. Any usage indicates an active breach with 100% confidence.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1 font-mono">Honeytoken Type</label>
                <select
                  value={tokenType}
                  onChange={(e) => setTokenType(e.target.value)}
                  className="w-full bg-black/60 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 font-mono"
                >
                  <option value="api_key">API Key (sage_honey_live_...)</option>
                  <option value="aws_key">AWS Access Key (AKIA...)</option>
                  <option value="jwt_token">JWT Admin Bearer Token</option>
                  <option value="db_uri">Database Connection URI</option>
                  <option value="dns_token">DNS Canary Subdomain</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1 font-mono">Lure Location Description</label>
                <input
                  type="text"
                  value={tokenLabel}
                  onChange={(e) => setTokenLabel(e.target.value)}
                  placeholder="e.g. GitHub repo .env / AWS S3 backup"
                  className="w-full bg-black/60 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <button
                onClick={handleGenerateCanary}
                disabled={generating}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs uppercase tracking-wider transition font-mono"
              >
                {generating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Key className="w-3.5 h-3.5" />}
                Generate Honey-Token
              </button>
            </div>

            {createdToken && (
              <div className="mt-4 p-3 rounded-lg bg-black/80 border border-emerald-900/50 space-y-2">
                <span className="text-[10px] uppercase font-mono text-emerald-400 block">
                  Tripwire Canary Value Generated
                </span>
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-red-400" />
                <h3 className="text-xs uppercase tracking-wider font-bold text-white font-mono">
                  Active Deception Lures ({decoys.length})
                </h3>
              </div>
            </div>
            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {decoys.map((d, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-black/50 border border-zinc-900 text-xs">
                  <div>
                    <code className="text-red-400 font-mono text-[11px]">{d.path}</code>
                    <p className="text-[10px] text-zinc-500">{d.type}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-red-950/40 text-red-300 border border-red-900/30">
                    {d.category?.toUpperCase() || "LURE"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Deception Intrusion Feed & Active Canary Tokens */}
        <div className="lg:col-span-2 space-y-6">
          {/* Confirmed Intrusion Alerts */}
          <div className="p-5 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-500" />
                <h3 className="text-xs uppercase tracking-wider font-bold text-white font-mono">
                  Confirmed Honeypot Intrusion Alerts
                </h3>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">{alerts.length} verified breaches</span>
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
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
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

          {/* Active Deployed Canary Tokens */}
          {tokens.length > 0 && (
            <div className="p-5 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs uppercase tracking-wider font-bold text-white font-mono">
                    Deployed Canary Tripwires ({tokens.length})
                  </h3>
                </div>
              </div>

              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {tokens.map((t, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-black/50 border border-zinc-900 flex items-center justify-between text-xs font-mono">
                    <div className="space-y-0.5 truncate mr-2">
                      <span className="text-zinc-200 font-bold block">{t.label}</span>
                      <span className="text-[10px] text-zinc-500 truncate block">{t.canary_value}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-mono ${
                        t.triggered
                          ? "bg-red-950/80 text-red-400 border border-red-800/40"
                          : "bg-emerald-950/40 text-emerald-400 border border-emerald-900/30"
                      }`}
                    >
                      {t.triggered ? `BREACH TRIGGERED (${t.trigger_count})` : "ARMED"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
