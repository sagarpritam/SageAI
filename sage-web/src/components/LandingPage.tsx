"use client";

import Link from "next/link";
import {
  Shield, Radar, Bot, GitBranch, Activity, Clock,
  Zap, Lock, ChevronRight, Globe, Target, ShieldAlert
} from "lucide-react";
import {
  PLATFORM_VERSION,
  PLATFORM_WAVES_RANGE,
  PLATFORM_CAPABILITIES_COUNT,
  PLATFORM_DASHBOARD_MODULES_COUNT,
} from "@/lib/platform";

const features = [
  { icon: Shield, title: "10-Pillar Sovereign Defense Grid", desc: "Reverse Engineering Sandbox, Deception Honeypots, Next-Gen WAF, NIDS, UEBA, SOAR & Merkle Chain", color: "text-emerald-400" },
  { icon: Bot, title: "5-LLM Multi-Model Consensus", desc: "GPT-4o, Claude 3.7 Sonnet, DeepSeek R1, Nemotron 70B & Gemini 2.5 Pro debate & verify findings", color: "text-blue-400" },
  { icon: Radar, title: "THE ABYSS 9-Module OSINT Hub", desc: "Shodan, Censys, Intel X, Maltego, Babel X Darkweb, SpiderFoot & Social Links in one sweep", color: "text-purple-400" },
  { icon: ShieldAlert, title: "Autonomous AI Red-Teaming", desc: "NeMo Guardrails, Colang 2.0 synthesis & frontier jailbreak probes across your AI models", color: "text-red-400" },
  { icon: GitBranch, title: "SagePatch AST Self-Healing Code", desc: "SAST + AST sandbox validation -> GitHub PR with human-in-the-loop approval gates", color: "text-amber-400" },
  { icon: Activity, title: "eBPF Kernel SIEM & ASM", desc: "<0.2% CPU syscall telemetry, continuous attack surface monitoring & live War Room alerts", color: "text-cyan-400" },
  { icon: Clock, title: "Post-Quantum Zero-Egress Enclaves", desc: "NIST FIPS 203 ML-KEM-768, FIPS 204 ML-DSA-65 & AES-256-GCM regional isolation (US/EU/APAC)", color: "text-indigo-400" },
  { icon: Lock, title: `Trans-Century Frontier (Waves 11–29)`, desc: "M-Theory G2 (Cap 107), HaPPY Holographic QEC (Cap 108) & K-Theory D-Branes (Cap 109)", color: "text-pink-400" },
];

const stats = [
  { value: `${PLATFORM_DASHBOARD_MODULES_COUNT}`, label: "Command Center Studios" },
  { value: `${PLATFORM_CAPABILITIES_COUNT}`, label: `Capabilities (${PLATFORM_WAVES_RANGE})` },
  { value: "< 60s", label: "Average Autonomous Scan" },
  { value: `v${PLATFORM_VERSION}`, label: "Sovereign Core Release" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-black to-black" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      {/* Hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 bg-emerald-900/20 border border-emerald-700/30 rounded-full px-4 py-1.5 mb-8">
          <Zap className="w-3 h-3 text-emerald-400" />
          <span className="text-xs font-mono text-emerald-400">
            SageAI v{PLATFORM_VERSION} &bull; {PLATFORM_WAVES_RANGE} &bull; Sovereign Cybersecurity Platform
          </span>
        </div>
        <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-tight mb-6">
          <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-400 bg-clip-text text-transparent">
            See Every Threat.
          </span>
          <br />
          <span className="text-white/90">Fix Before They Strike.</span>
        </h1>
        <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          SageAI v{PLATFORM_VERSION} combines <strong className="text-zinc-200">THE ABYSS 9-module OSINT intelligence</strong>, <strong className="text-zinc-200">5-LLM multi-model consensus</strong>, <strong className="text-zinc-200">NIST FIPS 203/204 Post-Quantum enclaves</strong>, and <strong className="text-zinc-200">SagePatch AST self-healing PRs</strong> across {PLATFORM_DASHBOARD_MODULES_COUNT} active Command Center modules.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/login"
            className="group bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 py-3.5 rounded-xl transition-all text-sm flex items-center gap-2 shadow-lg shadow-emerald-900/30">
            Start Free Scan <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/pricing"
            className="border border-zinc-700 hover:border-emerald-700 text-zinc-300 hover:text-emerald-400 font-bold px-8 py-3.5 rounded-xl transition-all text-sm">
            View Pricing
          </Link>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative z-10 border-y border-zinc-800/50 bg-zinc-950/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {stats.map(s => (
            <div key={s.label}>
              <p className="text-3xl font-black text-emerald-400">{s.value}</p>
              <p className="text-xs text-zinc-500 font-mono mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-white mb-3">Everything You Need to Defend</h2>
          <p className="text-zinc-500 text-sm font-mono max-w-lg mx-auto">From reconnaissance to Post-Quantum containment and AST remediation — {PLATFORM_CAPABILITIES_COUNT} Sovereign Capabilities across {PLATFORM_WAVES_RANGE}.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map(f => (
            <div key={f.title} className="group bg-zinc-900/40 border border-zinc-800 hover:border-emerald-900/50 rounded-xl p-5 transition-all hover:-translate-y-1">
              <f.icon className={`w-8 h-8 ${f.color} mb-3 group-hover:scale-110 transition-transform`} />
              <h3 className="text-sm font-bold text-white mb-1">{f.title}</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-black text-white text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            { step: "01", icon: Globe, title: "Enter Target", desc: "Domain, IP, email, repo, or cloud asset — SageAI maps every external vector." },
            { step: "02", icon: Target, title: "5-LLM Consensus & Scans", desc: "9 OSINT modules + 5 frontier LLMs + WAF/NIDS telemetry validate real threats." },
            { step: "03", icon: Shield, title: "Seal & Auto-Patch", desc: "Enclave-scrubbed secrets, PQC FIPS 203/204 seals, and AST-verified SagePatch PRs." },
          ].map(s => (
            <div key={s.step} className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-900/30 border border-emerald-800/30 flex items-center justify-center mx-auto mb-4">
                <s.icon className="w-6 h-6 text-emerald-400" />
              </div>
              <span className="text-[10px] font-mono text-emerald-600">{s.step}</span>
              <h3 className="text-lg font-bold text-white mt-1 mb-2">{s.title}</h3>
              <p className="text-xs text-zinc-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-br from-emerald-900/30 to-emerald-950/50 border border-emerald-800/30 rounded-2xl p-10 text-center">
          <h2 className="text-3xl font-black text-white mb-3">Ready to Secure Your Stack?</h2>
          <p className="text-zinc-400 text-sm mb-8 max-w-md mx-auto">
            Deploy SageAI v{PLATFORM_VERSION} and command all {PLATFORM_DASHBOARD_MODULES_COUNT} autonomous defense studios in under 60 seconds.
          </p>
          <Link href="/login"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-10 py-4 rounded-xl transition-all text-sm shadow-lg shadow-emerald-900/30">
            Get Started Free <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-900 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-xs text-zinc-600 font-mono">
          <span>© 2026 SageAI Security Inc. &bull; v{PLATFORM_VERSION} ({PLATFORM_WAVES_RANGE})</span>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="hover:text-emerald-400 transition-colors">Pricing</Link>
            <Link href="/login" className="hover:text-emerald-400 transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
