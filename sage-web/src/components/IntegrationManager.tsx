"use client";

import { useState, useEffect } from "react";
import {
  Github,
  Loader2,
  Key,
  CheckCircle2,
  XCircle,
  Cpu,
  Radio,
  ShieldCheck,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import axios from "axios";

interface IntegrationsStatus {
  nvidia?: {
    configured: boolean;
    masked_key?: string;
    model?: string;
    tier?: string;
    free_credits_url?: string;
  };
  censys?: {
    configured: boolean;
    mode?: string;
    description?: string;
    masked_id?: string;
    free_registration_url?: string;
  };
  shodan?: {
    configured: boolean;
    mode?: string;
    description?: string;
    masked_key?: string;
    registration_url?: string;
  };
  github?: {
    configured: boolean;
    bot_enabled?: boolean;
  };
}

export function IntegrationManager() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<IntegrationsStatus>({});

  // Form states
  const [nvidiaKey, setNvidiaKey] = useState("");
  const [censysId, setCensysId] = useState("");
  const [censysSecret, setCensysSecret] = useState("");
  const [shodanKey, setShodanKey] = useState("");
  const [pat, setPat] = useState("");

  // Loading & feedback states
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [savingProvider, setSavingProvider] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ [key: string]: { type: "success" | "error"; text: string } }>({});

  const fetchStatus = async () => {
    try {
      const { data } = await axios.get("/api/integrations/status");
      setStatus(data);
    } catch {
      // Fallback if backend /status is initializing
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleVerify = async (provider: string, key: string, secondaryKey?: string) => {
    if (!key) return;
    setTestingProvider(provider);
    setFeedback(prev => ({ ...prev, [provider]: { type: "success", text: "Probing API endpoint..." } }));

    try {
      const { data } = await axios.post("/api/integrations/verify", {
        provider,
        key,
        secondary_key: secondaryKey,
      });

      if (data.valid) {
        setFeedback(prev => ({
          ...prev,
          [provider]: { type: "success", text: `[Verified] ${data.message || "Connection successful!"} (${data.latency_ms || 0}ms)` },
        }));
      } else {
        setFeedback(prev => ({
          ...prev,
          [provider]: { type: "error", text: data.error || "Verification failed." },
        }));
      }
    } catch (err: unknown) {
      const errorMsg = axios.isAxiosError(err) && err.response?.data?.detail
        ? err.response.data.detail
        : "Failed to connect to verification service.";
      setFeedback(prev => ({ ...prev, [provider]: { type: "error", text: errorMsg } }));
    } finally {
      setTestingProvider(null);
    }
  };

  const handleSave = async (provider: string, key: string, secondaryKey?: string) => {
    if (!key) return;
    setSavingProvider(provider);
    setFeedback(prev => ({ ...prev, [provider]: { type: "success", text: "Validating and activating key..." } }));

    try {
      const { data } = await axios.post("/api/integrations/save", {
        provider,
        key,
        secondary_key: secondaryKey,
      });

      setFeedback(prev => ({
        ...prev,
        [provider]: { type: "success", text: data.message || "Saved and activated successfully!" },
      }));

      // Refresh integration status
      await fetchStatus();
    } catch (err: unknown) {
      const errorMsg = axios.isAxiosError(err) && err.response?.data?.detail
        ? err.response.data.detail
        : "Failed to save integration.";
      setFeedback(prev => ({ ...prev, [provider]: { type: "error", text: errorMsg } }));
    } finally {
      setSavingProvider(null);
    }
  };

  const handleConnectGitHub = async () => {
    if (!pat) return;
    setSavingProvider("github");
    try {
      await axios.post("/api/integrations/github", { pat });
      setFeedback(prev => ({
        ...prev,
        github: { type: "success", text: "GitHub connected successfully. Auto-Fix can now open PRs." },
      }));
      setPat("");
      await fetchStatus();
    } catch {
      setFeedback(prev => ({
        ...prev,
        github: { type: "error", text: "Failed to connect GitHub. Please verify PAT has 'repo' scope." },
      }));
    } finally {
      setSavingProvider(null);
    }
  };

  const handleDisconnectGitHub = async () => {
    setSavingProvider("github");
    try {
      await axios.delete("/api/integrations/github");
      setFeedback(prev => ({
        ...prev,
        github: { type: "success", text: "GitHub disconnected." },
      }));
      await fetchStatus();
    } catch {
      setFeedback(prev => ({
        ...prev,
        github: { type: "error", text: "Failed to disconnect GitHub." },
      }));
    } finally {
      setSavingProvider(null);
    }
  };

  if (loading) return <div className="animate-pulse h-48 bg-zinc-900/50 rounded-xl" />;

  const isNvidiaConnected = status.nvidia?.configured;
  const isCensysPro = status.censys?.configured;
  const isShodanPro = status.shodan?.configured;
  const isGithubConnected = status.github?.configured;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="border-b border-zinc-800 pb-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          Automated AI & Intelligence Hub
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          Automate external intelligence, security explanations, and auto-fix pull requests with live API key verification.
        </p>
      </div>

      {/* ── 1. NVIDIA Build / NIM ── */}
      <div className="bg-zinc-900/60 border border-emerald-900/30 rounded-xl p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-400" />
            NVIDIA Build / NIM (AI Explanations & NeMo Red Teaming)
          </h3>
          {isNvidiaConnected ? (
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full border border-emerald-400/20">
              <CheckCircle2 className="w-3.5 h-3.5" /> Meta Llama 3.3 70B Active
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 bg-zinc-800 px-2 py-1 rounded-full border border-zinc-700">
              <XCircle className="w-3.5 h-3.5" /> Not Configured
            </span>
          )}
        </div>

        <p className="text-xs text-zinc-400 mb-4">
          Powers multi-agent security reasoning, vulnerability remediation playbooks, and Llama Guard 3 jailbreak audits.
          <a
            href="https://build.nvidia.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:text-emerald-300 ml-1 inline-flex items-center gap-1 underline"
          >
            Get 1,000 free credits at build.nvidia.com <ExternalLink className="w-3 h-3" />
          </a>
        </p>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="password"
            value={nvidiaKey}
            onChange={e => setNvidiaKey(e.target.value)}
            placeholder={status.nvidia?.masked_key ? `Configured: ${status.nvidia.masked_key}` : "nvapi-xxxxxxxxxxxx"}
            className="flex-1 bg-black/50 border border-zinc-700 rounded-lg px-4 py-2 text-white font-mono text-xs placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
          />
          <button
            onClick={() => handleVerify("nvidia", nvidiaKey)}
            disabled={testingProvider === "nvidia" || !nvidiaKey}
            className="bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-300 font-bold px-4 py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 border border-zinc-700 transition-colors"
          >
            {testingProvider === "nvidia" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Test Connection"}
          </button>
          <button
            onClick={() => handleSave("nvidia", nvidiaKey)}
            disabled={savingProvider === "nvidia" || !nvidiaKey}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            {savingProvider === "nvidia" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Key className="w-3.5 h-3.5" />}
            Save & Activate
          </button>
        </div>

        {feedback.nvidia && (
          <p className={`text-xs mt-3 ${feedback.nvidia.type === "success" ? "text-emerald-400" : "text-red-400"}`}>
            {feedback.nvidia.text}
          </p>
        )}
      </div>

      {/* ── 2. Censys Global Radar ── */}
      <div className="bg-zinc-900/60 border border-emerald-900/30 rounded-xl p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Radio className="w-5 h-5 text-emerald-400" />
            Censys Global Radar (Attack Surface & Certificate Transparency)
          </h3>
          {isCensysPro ? (
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full border border-emerald-400/20">
              <CheckCircle2 className="w-3.5 h-3.5" /> Censys Search Pro Active
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-medium text-amber-400 bg-amber-400/10 px-2 py-1 rounded-full border border-amber-400/20">
              <CheckCircle2 className="w-3.5 h-3.5" /> Free Mode (Certspotter CT + Direct TLS)
            </span>
          )}
        </div>

        <p className="text-xs text-zinc-400 mb-4">
          Real-time server monitoring and subdomain discovery. Free community mode uses Certspotter CT API + live socket inspection with zero keys required.
          <a
            href="https://search.censys.io/register"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:text-emerald-300 ml-1 inline-flex items-center gap-1 underline"
          >
            Get Censys Free Community API <ExternalLink className="w-3 h-3" />
          </a>
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
          <input
            type="text"
            value={censysId}
            onChange={e => setCensysId(e.target.value)}
            placeholder={status.censys?.masked_id ? `ID: ${status.censys.masked_id}` : "Censys API ID"}
            className="bg-black/50 border border-zinc-700 rounded-lg px-4 py-2 text-white font-mono text-xs placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
          />
          <input
            type="password"
            value={censysSecret}
            onChange={e => setCensysSecret(e.target.value)}
            placeholder="Censys API Secret"
            className="bg-black/50 border border-zinc-700 rounded-lg px-4 py-2 text-white font-mono text-xs placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={() => handleVerify("censys", censysId, censysSecret)}
            disabled={testingProvider === "censys" || !censysId || !censysSecret}
            className="bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-300 font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 border border-zinc-700 transition-colors"
          >
            {testingProvider === "censys" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Test Credentials"}
          </button>
          <button
            onClick={() => handleSave("censys", censysId, censysSecret)}
            disabled={savingProvider === "censys" || !censysId || !censysSecret}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-colors"
          >
            {savingProvider === "censys" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Key className="w-3.5 h-3.5" />}
            Save & Activate
          </button>
        </div>

        {feedback.censys && (
          <p className={`text-xs mt-3 ${feedback.censys.type === "success" ? "text-emerald-400" : "text-red-400"}`}>
            {feedback.censys.text}
          </p>
        )}
      </div>

      {/* ── 3. Shodan Scanner ── */}
      <div className="bg-zinc-900/60 border border-emerald-900/30 rounded-xl p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Shodan Infrastructure Scanner
          </h3>
          {isShodanPro ? (
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full border border-emerald-400/20">
              <CheckCircle2 className="w-3.5 h-3.5" /> Shodan Pro Active
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-medium text-amber-400 bg-amber-400/10 px-2 py-1 rounded-full border border-amber-400/20">
              <CheckCircle2 className="w-3.5 h-3.5" /> Free Mode (Shodan InternetDB Active)
            </span>
          )}
        </div>

        <p className="text-xs text-zinc-400 mb-4">
          Queries known vulnerabilities and open ports. Free community tier uses Shodan InternetDB with zero key required.
        </p>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="password"
            value={shodanKey}
            onChange={e => setShodanKey(e.target.value)}
            placeholder={status.shodan?.masked_key ? `Configured: ${status.shodan.masked_key}` : "Shodan API Key"}
            className="flex-1 bg-black/50 border border-zinc-700 rounded-lg px-4 py-2 text-white font-mono text-xs placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
          />
          <button
            onClick={() => handleVerify("shodan", shodanKey)}
            disabled={testingProvider === "shodan" || !shodanKey}
            className="bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-300 font-bold px-4 py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 border border-zinc-700 transition-colors"
          >
            {testingProvider === "shodan" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Test Key"}
          </button>
          <button
            onClick={() => handleSave("shodan", shodanKey)}
            disabled={savingProvider === "shodan" || !shodanKey}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            {savingProvider === "shodan" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Key className="w-3.5 h-3.5" />}
            Save & Activate
          </button>
        </div>

        {feedback.shodan && (
          <p className={`text-xs mt-3 ${feedback.shodan.type === "success" ? "text-emerald-400" : "text-red-400"}`}>
            {feedback.shodan.text}
          </p>
        )}
      </div>

      {/* ── 4. GitHub Auto-Fix ── */}
      <div className="bg-zinc-900/60 border border-emerald-900/30 rounded-xl p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Github className="w-5 h-5 text-zinc-400" />
            GitHub Integration (Auto-Fix PR Engine)
          </h3>
          {isGithubConnected ? (
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full border border-emerald-400/20">
              <CheckCircle2 className="w-3.5 h-3.5" /> Connected
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 bg-zinc-800 px-2 py-1 rounded-full border border-zinc-700">
              <XCircle className="w-3.5 h-3.5" /> Not Connected
            </span>
          )}
        </div>

        <p className="text-xs text-zinc-400 mb-4">
          Connect your GitHub Personal Access Token (PAT) with <code className="text-emerald-400 bg-emerald-400/10 px-1 rounded">repo</code> scope to allow SageAI to automatically submit pull requests with remediated security patches.
        </p>

        {!isGithubConnected ? (
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="password"
              value={pat}
              onChange={e => setPat(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxx"
              className="flex-1 bg-black/50 border border-zinc-700 rounded-lg px-4 py-2 text-white font-mono text-xs placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <button
              onClick={handleConnectGitHub}
              disabled={savingProvider === "github" || !pat}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold px-5 py-2 rounded-lg text-xs flex items-center justify-center gap-2 transition-colors"
            >
              {savingProvider === "github" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
              Connect GitHub
            </button>
          </div>
        ) : (
          <div>
            <button
              onClick={handleDisconnectGitHub}
              disabled={savingProvider === "github"}
              className="bg-red-600/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 px-4 py-2 rounded-lg text-xs font-bold transition-colors"
            >
              {savingProvider === "github" ? "Disconnecting..." : "Disconnect GitHub"}
            </button>
          </div>
        )}

        {feedback.github && (
          <p className={`text-xs mt-3 ${feedback.github.type === "success" ? "text-emerald-400" : "text-red-400"}`}>
            {feedback.github.text}
          </p>
        )}
      </div>
    </div>
  );
}
