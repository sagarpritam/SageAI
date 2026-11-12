"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Shield,
  Terminal,
  Zap,
  Lock,
  Search,
  Network,
  Cpu,
  GitBranch,
  Bot,
  Activity,
  FileCheck2,
  Atom,
} from "lucide-react";
import {
  PLATFORM_VERSION,
  PLATFORM_MILESTONE,
  PLATFORM_WAVES_RANGE,
  PLATFORM_CAPABILITIES_COUNT,
  PLATFORM_DASHBOARD_MODULES_COUNT,
  PLATFORM_FASTAPI_ROUTES_COUNT,
} from "@/lib/platform";

export default function Features() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.06 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  const features = [
    {
      icon: <Shield className="w-8 h-8 text-emerald-400" />,
      badge: "Pillar 01–10",
      title: "10-Pillar Sovereign Defense Grid",
      description:
        "Unifies Reverse Engineering Sandbox, Deception Honeypots, Next-Gen WAF, NIDS/C2 Beacon Monitor, CISA KEV Threat Intel, UEBA, Automated SOAR, NeMo AI Red-Team, Cyber Range, and SHA-256 Merkle Audit Chain.",
    },
    {
      icon: <Terminal className="w-8 h-8 text-emerald-400" />,
      badge: "Multi-AI Council",
      title: "5-LLM Consensus Arena",
      description:
        "Pits GPT-4o, Claude 3.7 Sonnet, DeepSeek R1, NVIDIA Nemotron 70B, and Gemini 2.5 Pro against each other to debate findings, compute alignment scores, eliminate false positives, and synthesize patches.",
    },
    {
      icon: <Lock className="w-8 h-8 text-emerald-400" />,
      badge: "CNSA 2.0",
      title: "Post-Quantum Cryptography (FIPS 203/204)",
      description:
        "Deploys NIST FIPS 203 ML-KEM-768 (Kyber) and FIPS 204 ML-DSA-65 (Dilithium) hybrid key exchange and signatures alongside an HNDL Quantum Risk Scanner for zero-downtime migration.",
    },
    {
      icon: <Network className="w-8 h-8 text-emerald-400" />,
      badge: "Zero Egress",
      title: "Multi-Region Zero-Egress Enclaves",
      description:
        "Enforces strict US (FedRAMP High), EU (GDPR Art. 44–49), and APAC (PDPA/MAS) isolation with AES-256-GCM regional envelopes and real-time Shannon-entropy credential scrubbing.",
    },
    {
      icon: <GitBranch className="w-8 h-8 text-emerald-400" />,
      badge: "Phase 04 AST",
      title: "SagePatch AST Self-Healing PRs",
      description:
        "Validates AI-generated remediation patches via Python AST sandboxing, blocks unsafe syscalls and oversized diffs, and dispatches review-gated GitHub pull requests automatically.",
    },
    {
      icon: <Search className="w-8 h-8 text-emerald-400" />,
      badge: "9 OSINT Engines",
      title: "THE ABYSS Recursive OSINT Hub",
      description:
        "Aggregates Shodan, Censys, Intel X, Maltego Link Graphs, Babel X Darkweb, SpiderFoot, Recon-ng, Social Links, and OSINT Industries with zero mandatory paid API keys.",
    },
    {
      icon: <Activity className="w-8 h-8 text-emerald-400" />,
      badge: "< 0.2% CPU",
      title: "eBPF Kernel SIEM & Anti-Ransomware",
      description:
        "Monitors ring-0 execve, connect, and ptrace syscalls alongside canary decoy fabrics, micro-hotpatching eBPF probes, and behavioral Z-score (>3.0 sigma) anomaly triggers.",
    },
    {
      icon: <Bot className="w-8 h-8 text-emerald-400" />,
      badge: "OWASP LLM Top 10",
      title: "AI-SPM & Autonomous Red-Teaming",
      description:
        "Probes foundation models with automated prompt injection, RAG extraction, and training-data de-poisoning while generating Colang 2.0 runtime guardrails.",
    },
    {
      icon: <FileCheck2 className="w-8 h-8 text-emerald-400" />,
      badge: "Groth16 ZKP",
      title: "zk-SNARK & Merkle Compliance Vault",
      description:
        "Emits verifiable zero-knowledge compliance proofs and SARIF / CycloneDX 1.5 SBOM / OpenVEX attestations mapped to SOC 2 Type II, ISO/IEC 27001:2022, FedRAMP, HIPAA, GDPR, and PCI DSS.",
    },
    {
      icon: <Cpu className="w-8 h-8 text-emerald-400" />,
      badge: "Cloud & Identity",
      title: "CSPM, ITDR, BloodHound AD & CART",
      description:
        "Inspects Terraform HCL and Kubernetes drift, detects golden-ticket Kerberos attacks, runs MITRE D3FEND countermeasures, and simulates continuous attack-path risk trees.",
    },
    {
      icon: <Zap className="w-8 h-8 text-emerald-400" />,
      badge: "DevSecOps CI/CD",
      title: "CI/CD Native & War Room Telemetry",
      description:
        "Blocks vulnerable PRs across GitHub Actions, GitLab CI, and Bitbucket while streaming live Kafka/WebSocket attack telemetry and SEC 8-K regulatory briefings.",
    },
    {
      icon: <Atom className="w-8 h-8 text-emerald-400" />,
      badge: `${PLATFORM_WAVES_RANGE}`,
      title: `Trans-Century Frontier (Caps 100–${PLATFORM_CAPABILITIES_COUNT})`,
      description:
        "Includes Centesimal Quantum Gravity (Cap 100), Factorization Homology (Cap 140), Hitchin Moduli Hyperkähler (Cap 143), Geometric Satake (Cap 144), and HoTT Voevodsky Univalence (Cap 145).",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-emerald-500/30 font-sans">
      {/* Navigation */}
      <nav className="fixed w-full z-50 flex justify-between items-center p-6 bg-black/50 backdrop-blur-xl border-b border-white/5">
        <Link href="/" className="flex items-center gap-2 group">
          <Shield className="w-8 h-8 text-emerald-500 group-hover:text-emerald-400 transition-colors" />
          <span className="font-bold text-xl tracking-tighter">
            SAGE<span className="text-emerald-500">AI</span>
          </span>
        </Link>
        <div className="hidden md:flex gap-8 text-sm font-medium text-zinc-400">
          <Link href="/features" className="text-emerald-400 transition-colors">
            Features
          </Link>
          <Link href="/how-it-works" className="hover:text-white transition-colors">
            How It Works
          </Link>
          <Link href="/pricing" className="hover:text-white transition-colors">
            Pricing
          </Link>
        </div>
        <Link
          href="/dashboard"
          className="px-6 py-2 bg-emerald-500/10 text-emerald-400 rounded-full font-bold hover:bg-emerald-500/20 border border-emerald-500/20 transition-all text-sm"
        >
          Login
        </Link>
      </nav>

      <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono uppercase tracking-widest mb-6">
            <Zap className="w-3.5 h-3.5" />
            v{PLATFORM_VERSION} &bull; {PLATFORM_MILESTONE} &bull; {PLATFORM_WAVES_RANGE}
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold mb-6 tracking-tighter"
          >
            Capabilities that scale <br />
            <span className="gradient-text">beyond human limits.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-zinc-400 max-w-3xl mx-auto"
          >
            SageAI orchestrates {PLATFORM_CAPABILITIES_COUNT} sovereign capabilities across{" "}
            {PLATFORM_DASHBOARD_MODULES_COUNT} interactive Command Center studios and{" "}
            {PLATFORM_FASTAPI_ROUTES_COUNT} FastAPI endpoints — uniting offensive red-teaming,
            post-quantum defense, and AST-verified self-healing code.
          </motion.p>
        </div>

        {/* Live Platform Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[
            { value: `v${PLATFORM_VERSION}`, label: "Current Core Release" },
            { value: `${PLATFORM_CAPABILITIES_COUNT}`, label: `Capabilities (${PLATFORM_WAVES_RANGE})` },
            { value: `${PLATFORM_DASHBOARD_MODULES_COUNT}`, label: "Command Center Studios" },
            { value: `${PLATFORM_FASTAPI_ROUTES_COUNT}+`, label: "FastAPI Security Endpoints" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="glass rounded-2xl p-5 text-center border border-emerald-500/10"
            >
              <div className="text-3xl font-black text-emerald-400 font-mono">{stat.value}</div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, i) => (
            <motion.div key={i} variants={item} className="bento-card p-8 group flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-6">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    {feature.icon}
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {feature.badge}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 p-12 glass-enhanced rounded-3xl text-center border border-emerald-500/20"
        >
          <h2 className="text-3xl font-bold mb-6">Ready to command the Sovereign Defense Grid?</h2>
          <p className="text-zinc-400 mb-8 max-w-xl mx-auto">
            Deploy SageAI v{PLATFORM_VERSION} in less than 60 seconds and inspect all{" "}
            {PLATFORM_DASHBOARD_MODULES_COUNT} autonomous defense studios in one unified workspace.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/login"
              className="px-10 py-4 bg-emerald-500 text-black rounded-full font-bold hover:bg-emerald-400 transition-colors inline-block text-lg"
            >
              Start Free Scan
            </Link>
            <Link
              href="/pricing"
              className="px-8 py-4 border border-zinc-700 text-zinc-300 rounded-full font-bold hover:border-emerald-500/50 hover:text-emerald-400 transition-colors inline-block text-lg"
            >
              View Plans
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
