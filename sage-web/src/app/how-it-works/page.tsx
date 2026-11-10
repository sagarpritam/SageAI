"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Shield,
  Zap,
  Target,
  Binary,
  Flag,
  Lock,
  Cpu,
  GitBranch,
} from "lucide-react";
import {
  PLATFORM_VERSION,
  PLATFORM_WAVES_RANGE,
  PLATFORM_CAPABILITIES_COUNT,
  PLATFORM_DASHBOARD_MODULES_COUNT,
} from "@/lib/platform";

export default function HowItWorks() {
  const steps = [
    {
      icon: <Target className="w-6 h-6 text-emerald-400" />,
      tag: "Phase 01 // THE ABYSS OSINT",
      title: "1. Recursive Reconnaissance & Asset Mapping",
      description:
        "SageAI launches 9 autonomous OSINT engines (Shodan, Censys, Intel X, Maltego Link Graphs, Babel X Darkweb, SpiderFoot, Recon-ng, Social Links, OSINT Industries) alongside Shadow IT EASM to map domains, APIs, cloud buckets, and leaked credentials without mandatory paid API keys.",
    },
    {
      icon: <Cpu className="w-6 h-6 text-emerald-400" />,
      tag: "Phase 02 // eBPF, WAF & Deception Mesh",
      title: "2. In-Line Detection & Kernel Telemetry",
      description:
        "Next-Gen WAF inspects HTTP payloads (SQLi, XSS, CMDi, SSRF, BOLA), NIDS detects low-jitter C2 beacons (CV < 0.25) and DNS tunneling, deception canaries trap active intruders with zero false positives, and eBPF kernel SIEM watches ring-0 syscalls at <0.2% CPU overhead.",
    },
    {
      icon: <Binary className="w-6 h-6 text-emerald-400" />,
      tag: "Phase 03 // 5-LLM Consensus Council",
      title: "3. Multi-Model Reasoning & Attack Path Graphing",
      description:
        "Findings enter our 5-LLM Consensus Arena (GPT-4o, Claude 3.7 Sonnet, DeepSeek R1, NVIDIA Nemotron 70B, and Gemini 2.5 Pro). Models cross-examine logic flaws, AD privilege paths (BloodHound/CART), and live CISA KEV correlations to eliminate hallucinations.",
    },
    {
      icon: <Zap className="w-6 h-6 text-emerald-400" />,
      tag: "Phase 04 // Safe Exploitation & AI Red-Team",
      title: "4. Controlled Proof & Cyber Range Drills",
      description:
        "The autonomous exploit engine validates vulnerabilities non-destructively while the Cyber Range executes full multi-stage APT kill-chain drills and NeMo Guardrails probes audit enterprise LLM endpoints for jailbreaks and data exfiltration.",
    },
    {
      icon: <Lock className="w-6 h-6 text-emerald-400" />,
      tag: "Phase 05 // Zero-Egress PQC FIPS 203/204",
      title: "5. Post-Quantum & Regional Enclave Sealing",
      description:
        "Every sensitive telemetry packet is scrubbed of credentials by our Shannon-entropy sanitizer inside US, EU, or APAC Zero Data Egress Enclaves and wrapped in NIST FIPS 203 (ML-KEM-768) and FIPS 204 (ML-DSA-65) hybrid post-quantum envelopes.",
    },
    {
      icon: <GitBranch className="w-6 h-6 text-emerald-400" />,
      tag: "Phase 06 // SagePatch AST & Merkle Ledger",
      title: "6. Self-Healing PRs & Cryptographic Audit Proof",
      description:
        "SagePatch validates minimal remediation diffs through an isolated Python AST sandbox, enforces human-in-the-loop approval before opening GitHub PRs, and seals every SOAR action in a tamper-evident SHA-256 Merkle chain with Groth16 zk-SNARK compliance certificates.",
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
          <Link href="/features" className="hover:text-white transition-colors">
            Features
          </Link>
          <Link href="/how-it-works" className="text-emerald-400 transition-colors">
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

      <main className="pt-32 pb-24 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono uppercase tracking-widest mb-6">
            <Flag className="w-3.5 h-3.5" />
            v{PLATFORM_VERSION} &bull; {PLATFORM_WAVES_RANGE} &bull; {PLATFORM_CAPABILITIES_COUNT} Capabilities
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold mb-6 tracking-tighter"
          >
            The Autonomous <br />
            <span className="gradient-text">Defense Loop.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-zinc-400 max-w-2xl mx-auto"
          >
            How SageAI unites offensive Red Teaming, 5-LLM Consensus, Post-Quantum Enclaves, and
            AST self-healing across {PLATFORM_DASHBOARD_MODULES_COUNT} integrated modules.
          </motion.p>
        </div>

        <div className="space-y-8">
          {steps.map((step, index) => (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: index * 0.08 }}
              key={index}
              className="relative p-8 bento-card flex gap-8 md:flex-row flex-col items-start"
            >
              <div className="w-16 h-16 shrink-0 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                {step.icon}
              </div>
              <div>
                <div className="text-[11px] font-mono text-emerald-400 uppercase tracking-widest mb-2">
                  {step.tag}
                </div>
                <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                <p className="text-base md:text-lg text-zinc-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <Link
            href="/login"
            className="px-10 py-4 bg-emerald-500 text-black rounded-full font-bold hover:bg-emerald-400 transition-colors inline-block text-lg"
          >
            Start Free Scan
          </Link>
        </div>
      </main>
    </div>
  );
}
