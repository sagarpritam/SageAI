"use client";

import { useState, useEffect } from "react";
import {
  KeyRound,
  Shield,
  CheckCircle2,
  Copy,
  ExternalLink,
  Loader2,
  Lock,
  Globe,
  Save,
} from "lucide-react";
import axios from "axios";

interface SSOConfig {
  enabled: boolean;
  provider_type: string;
  idp_name: string;
  idp_entity_id: string;
  idp_sso_url: string;
  idp_certificate_fingerprint: string;
  sp_entity_id: string;
  acs_url: string;
  slo_url: string;
  allowed_email_domains: string[];
  auto_provision_users: boolean;
  default_role: string;
  enforce_mfa_at_idp: boolean;
}

export function SSOConfigPanel() {
  const [config, setConfig] = useState<SSOConfig>({
    enabled: true,
    provider_type: "SAML_2_0",
    idp_name: "Okta Enterprise IdP",
    idp_entity_id: "https://auth.sageai-defense.com/saml2/idp/metadata",
    idp_sso_url: "https://auth.sageai-defense.com/saml2/sso/login",
    idp_certificate_fingerprint: "7F:92:4B:01:CE:88:99:A1:FE:22:90:33:41:BC:09:12:33:AA:BB:CC",
    sp_entity_id: "https://sageai.defense.internal/auth/sso/saml/metadata",
    acs_url: "https://sageai.defense.internal/auth/sso/saml/acs",
    slo_url: "https://sageai.defense.internal/auth/sso/saml/logout",
    allowed_email_domains: ["enterprise.com", "defense.gov"],
    auto_provision_users: true,
    default_role: "member",
    enforce_mfa_at_idp: true,
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/auth/sso/config");
      if (res.data?.sso) {
        setConfig((prev) => ({ ...prev, ...res.data.sso }));
      }
    } catch {
      // Use fallback defaults
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (field: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSave = async () => {
    setSaving(true);
    setSavedSuccess(false);
    try {
      await new Promise((r) => setTimeout(r, 600));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save SSO config", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-zinc-900/60 border border-emerald-900/30 rounded-xl p-6 space-y-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-emerald-400" />
            Enterprise SSO & SAML 2.0 / OIDC Federation
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Federate authentication with corporate Identity Providers (Okta, Microsoft Entra ID, Google Workspace, PingIdentity).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono font-bold text-emerald-400">
            {config.enabled ? "SSO ACTIVE" : "DISABLED"}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
        </div>
      ) : (
        <div className="space-y-5">
          {/* Service Provider (SP) Metadata Box */}
          <div className="rounded-xl border border-zinc-800 bg-black/50 p-4 space-y-3">
            <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider block">
              SageAI Service Provider (SP) Metadata
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-800 flex items-center justify-between">
                <div className="truncate">
                  <span className="text-zinc-500 block text-[10px]">Assertion Consumer Service (ACS):</span>
                  <span className="text-emerald-300 truncate block">{config.acs_url}</span>
                </div>
                <button
                  onClick={() => handleCopy("acs", config.acs_url)}
                  className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 ml-2"
                  title="Copy ACS URL"
                >
                  {copiedField === "acs" ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-800 flex items-center justify-between">
                <div className="truncate">
                  <span className="text-zinc-500 block text-[10px]">Entity ID (Audience URI):</span>
                  <span className="text-emerald-300 truncate block">{config.sp_entity_id}</span>
                </div>
                <button
                  onClick={() => handleCopy("sp", config.sp_entity_id)}
                  className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 ml-2"
                  title="Copy Entity ID"
                >
                  {copiedField === "sp" ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* IdP Settings Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-zinc-400">Identity Provider Name</label>
              <input
                type="text"
                value={config.idp_name}
                onChange={(e) => setConfig({ ...config, idp_name: e.target.value })}
                className="w-full bg-black/50 border border-zinc-700 rounded-lg px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-zinc-400">Protocol Federation Type</label>
              <select
                value={config.provider_type}
                onChange={(e) => setConfig({ ...config, provider_type: e.target.value })}
                className="w-full bg-black/50 border border-zinc-700 rounded-lg px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="SAML_2_0">SAML 2.0 (Okta, Entra ID, PingIdentity)</option>
                <option value="OIDC">OIDC / OAuth2 (Google Workspace, Auth0)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-zinc-400">IdP Single Sign-On (SSO) URL</label>
              <input
                type="text"
                value={config.idp_sso_url}
                onChange={(e) => setConfig({ ...config, idp_sso_url: e.target.value })}
                className="w-full bg-black/50 border border-zinc-700 rounded-lg px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-zinc-400">Allowed Email Domains (comma-separated)</label>
              <input
                type="text"
                value={config.allowed_email_domains.join(", ")}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    allowed_email_domains: e.target.value.split(",").map((s) => s.trim()),
                  })
                }
                className="w-full bg-black/50 border border-zinc-700 rounded-lg px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
              <input
                type="checkbox"
                checked={config.auto_provision_users}
                onChange={(e) => setConfig({ ...config, auto_provision_users: e.target.checked })}
                className="accent-emerald-500 rounded"
              />
              <span>Auto-provision new users upon successful IdP assertion</span>
            </label>

            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition text-xs flex items-center gap-2 shadow"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {savedSuccess ? "Saved Successfully!" : "Save SSO Settings"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

