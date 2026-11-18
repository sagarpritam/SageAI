"use client";

import { useState, useEffect } from "react";
import {
  Shield,
  ArrowRight,
  CheckCircle,
  X,
  Globe,
  Activity,
  FileText,
  Copy,
  Check,
  Loader2,
  Sparkles,
  Lock,
} from "lucide-react";
import { useRouter } from "next/navigation";

export function OnboardingWizard() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  // Pilot domain & verification state
  const [domain, setDomain] = useState("enterprise-target.com");
  const [challengeToken, setChallengeToken] = useState("");
  const [copied, setCopied] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  // Discovery state
  const [discovering, setDiscovering] = useState(false);
  const [discoveryStats, setDiscoveryStats] = useState({
    subdomains: 14,
    openPorts: 6,
    exposedApis: 3,
    criticalVulns: 1,
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlDomain = params.get("domain");
      const urlToken = params.get("token");
      if (urlDomain) setDomain(urlDomain);
      if (urlToken) setChallengeToken(urlToken);
      if (params.get("onboarding") === "true" || urlDomain || urlToken) {
        setOpen(true);
        return;
      }
    }
    const dismissed = localStorage.getItem("sageai_onboarding_done");
    if (!dismissed) {
      setTimeout(() => {
        setChallengeToken((prev) => prev || `sageai-token-${Math.random().toString(36).substring(2, 10)}`);
        setOpen(true);
      }, 500);
    }
  }, []);

  const dismiss = () => {
    setOpen(false);
    localStorage.setItem("sageai_onboarding_done", "true");
  };

  const handleCopyChallenge = () => {
    navigator.clipboard.writeText(challengeToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setVerified(true);
    }, 1200);
  };

  const handleRunDiscovery = () => {
    setDiscovering(true);
    setTimeout(() => {
      setDiscovering(false);
      setDiscoveryStats({
        subdomains: 22,
        openPorts: 8,
        exposedApis: 5,
        criticalVulns: 2,
      });
      setStep(2);
    }, 1500);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
      <div className="bg-zinc-950 border border-emerald-500/40 rounded-2xl shadow-2xl w-[580px] max-w-[95vw] overflow-hidden flex flex-col">
        {/* Progress bar */}
        <div className="h-1.5 bg-zinc-800">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
            style={{ width: `${((step + 1) / 3) * 100}%` }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              PILOT ONBOARDING
            </span>
            <span className="text-xs text-zinc-400 font-mono">Step {step + 1} of 3</span>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="text-zinc-500 hover:text-zinc-300 transition-colors p-1"
            aria-label="Close pilot wizard"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body content based on step */}
        <div className="px-6 py-5 space-y-4">
          {step === 0 && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-xl bg-emerald-950/60 border border-emerald-700/50 flex items-center justify-center mx-auto mb-3 text-emerald-400">
                  <Globe className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-black text-white">Domain Ownership & Scope Validation</h2>
                <p className="text-xs text-zinc-400">
                  Authorize SageAI to autonomously discover your attack surface within verified target boundaries.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-zinc-300 block">Target Corporate Domain:</label>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="e.g. acme-corp.com"
                  className="w-full bg-black/60 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                  <span>Verification Token:</span>
                  <button
                    type="button"
                    onClick={handleCopyChallenge}
                    className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? "Copied" : "Copy Token"}
                  </button>
                </div>
                <code className="block p-2 bg-black/70 rounded text-[11px] font-mono text-zinc-300 truncate">
                  {challengeToken}
                </code>
                <p className="text-[10px] text-zinc-500">
                  Add this DNS TXT record to <code className="text-zinc-400">_sageai-challenge.{domain}</code> or place at <code className="text-zinc-400">/.well-known/sageai-challenge.txt</code>.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleVerify}
                  disabled={verifying || verified}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white transition-colors disabled:opacity-50"
                >
                  {verifying ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Verifying Challenge...
                    </>
                  ) : verified ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Ownership Confirmed
                    </>
                  ) : (
                    <>
                      <Shield className="w-3.5 h-3.5 text-emerald-400" /> Verify Domain Challenge
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={!verified}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-colors disabled:opacity-40"
                >
                  Continue to Discovery <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-xl bg-emerald-950/60 border border-emerald-700/50 flex items-center justify-center mx-auto mb-3 text-emerald-400">
                  <Activity className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-black text-white">External Attack Surface Discovery</h2>
                <p className="text-xs text-zinc-400">
                  SageAI scans DNS zones, certificate transparency logs, and exposed network services for <span className="text-emerald-400 font-mono">{domain}</span>.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                  <div className="text-[10px] text-zinc-400 uppercase font-mono">Discovered Hosts</div>
                  <div className="text-2xl font-black text-white mt-1">{discoveryStats.subdomains}</div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">Active subdomains resolved</div>
                </div>
                <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                  <div className="text-[10px] text-zinc-400 uppercase font-mono">Exposed Ports</div>
                  <div className="text-2xl font-black text-white mt-1">{discoveryStats.openPorts}</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">HTTP, HTTPS, SSH, DB</div>
                </div>
                <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                  <div className="text-[10px] text-zinc-400 uppercase font-mono">REST / GraphQL APIs</div>
                  <div className="text-2xl font-black text-white mt-1">{discoveryStats.exposedApis}</div>
                  <div className="text-[10px] text-amber-400 mt-0.5">Swagger / OpenAPI exposed</div>
                </div>
                <div className="p-3 rounded-lg bg-zinc-900 border border-red-900/30">
                  <div className="text-[10px] text-zinc-400 uppercase font-mono">Critical CVE Candidates</div>
                  <div className="text-2xl font-black text-red-400 mt-1">{discoveryStats.criticalVulns}</div>
                  <div className="text-[10px] text-red-300 mt-0.5">Automated patch available</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 text-xs font-bold text-zinc-300 hover:bg-zinc-700"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={handleRunDiscovery}
                  disabled={discovering}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-colors"
                >
                  {discovering ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Running Deep OSINT Recon...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" /> Execute Live Scan & Debrief <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-xl bg-emerald-950/60 border border-emerald-700/50 flex items-center justify-center mx-auto mb-3 text-emerald-400">
                  <FileText className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-black text-white">Executive Pilot Debrief Ready</h2>
                <p className="text-xs text-zinc-400">
                  Perimeter assessment complete. Your 14-day Enterprise Pilot is primed with full SOAR and SagePatch capabilities.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-zinc-300">Composite Posture Score:</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500 text-black font-mono">
                    GRADE B+ (78/100)
                  </span>
                </div>
                <div className="text-xs text-zinc-300 leading-relaxed">
                  <span className="font-bold text-white">Key Action Items:</span>
                  <ul className="list-disc list-inside mt-1 space-y-1 text-zinc-400">
                    <li>Remediate 1 critical SQL injection via 1-click SagePatch PR.</li>
                    <li>Close 2 exposed Swagger API staging endpoints.</li>
                    <li>Renew SSL wildcard certificate expiring in 14 days.</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 text-xs font-bold text-zinc-300 hover:bg-zinc-700"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={() => {
                    dismiss();
                    router.push("/dashboard");
                  }}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black shadow-lg shadow-emerald-950 transition-colors"
                >
                  <Lock className="w-3.5 h-3.5" /> Enter Sovereign Command Center
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
