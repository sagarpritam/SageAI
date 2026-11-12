"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Shield,
  Lock,
  Atom,
  Cpu,
  Network,
  Flame,
  Bot,
  Binary,
  Radio,
  Crosshair,
  GitBranch,
  Layers,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import {
  PLATFORM_VERSION,
  PLATFORM_MILESTONE,
  PLATFORM_WAVES_RANGE,
  PLATFORM_CAPABILITIES_COUNT,
  PLATFORM_DASHBOARD_MODULES_COUNT,
  PLATFORM_FASTAPI_ROUTES_COUNT,
  PLATFORM_NEXT_API_ROUTES_COUNT,
} from "@/lib/platform";

type ArchitectureTab = "pillars" | "enterprise" | "frontier";

const PILLARS = [
  {
    num: "01",
    name: "Reverse Engineering Sandbox",
    detail: "Static PE/ELF disassembly, section entropy analysis, IAT API detection & XOR de-obfuscation.",
    mitre: "T1027 · T1055",
    icon: Binary,
  },
  {
    num: "02",
    name: "Deception Honeypot Mesh",
    detail: "Synthetic /.env, /.aws/credentials & JWT decoys with 100% zero-false-positive attacker attribution.",
    mitre: "T1078 · T1552",
    icon: Radio,
  },
  {
    num: "03",
    name: "Next-Gen Inline WAF",
    detail: "Inspects SQLi, XSS, CMDi, IMDS SSRF & sliding-window credential stuffing in real time.",
    mitre: "T1190 · T1110",
    icon: Shield,
  },
  {
    num: "04",
    name: "NIDS & C2 Beacon Monitor",
    detail: "Detects low-jitter Cobalt Strike C2 heartbeats (CV < 0.25) and high-entropy DNS tunneling.",
    mitre: "T1071 · T1048",
    icon: Network,
  },
  {
    num: "05",
    name: "Threat Intel Hub & Rule Forge",
    detail: "Syncs 1,780+ CISA KEV vulnerabilities and auto-synthesizes YARA, Sigma & Nuclei templates.",
    mitre: "T1588 · T1587",
    icon: Flame,
  },
  {
    num: "06",
    name: "Behavioral UEBA Engine",
    detail: "Continuous Gaussian payload & endpoint baselines flagging Z-score > 3.0 sigma anomalies.",
    mitre: "T1030 · T1041",
    icon: Cpu,
  },
  {
    num: "07",
    name: "Automated SOAR Engine",
    detail: "Virtual WAF patching with CISO human-in-the-loop gates for host isolation & firewall blocks.",
    mitre: "T1562 · T1082",
    icon: Layers,
  },
  {
    num: "08",
    name: "Autonomous AI Red-Team",
    detail: "Adversarial prompt-injection probes across 5 frontier LLMs with automatic Colang 2.0 guardrails.",
    mitre: "AML.T0051",
    icon: Bot,
  },
  {
    num: "09",
    name: "Autonomous Cyber Range",
    detail: "Detonates multi-stage APT-29 supply chain simulations to verify end-to-end containment.",
    mitre: "T1595 · T1190",
    icon: Crosshair,
  },
  {
    num: "10",
    name: "Cryptographic Merkle Chain",
    detail: "Immutable SHA-256 hash ledger providing mathematical non-repudiation & War Room telemetry.",
    mitre: "SOC 2 · FedRAMP",
    icon: Lock,
  },
];

const ENTERPRISE_CAPABILITIES = [
  {
    tag: "Multi-AI Council",
    title: "5-LLM Consensus Arena",
    detail: "GPT-4o, Claude 3.7 Sonnet, DeepSeek R1, NVIDIA Nemotron 70B & Gemini 2.5 Pro cross-verify findings.",
  },
  {
    tag: "NIST FIPS 203 / 204",
    title: "Post-Quantum Cryptography",
    detail: "ML-KEM-768 (Kyber) + ML-DSA-65 (Dilithium) hybrid envelopes paired with HNDL 2030 readiness scans.",
  },
  {
    tag: "US · EU · APAC",
    title: "Zero Data Egress Enclaves",
    detail: "AES-256-GCM regional isolation with Shannon-entropy PII & AWS/DB secret scrubbing before transmission.",
  },
  {
    tag: "Phase 04 AST",
    title: "SagePatch Auto-Fix PRs",
    detail: "Python AST syntax & security validation blocks dangerous syscalls before opening human-gated GitHub PRs.",
  },
  {
    tag: "< 0.2% CPU Ring-0",
    title: "eBPF Kernel SIEM & Anti-Ransomware",
    detail: "Monitors execve/connect/ptrace syscalls alongside canary decoy fabrics and live memory micro-hotpatching.",
  },
  {
    tag: "Groth16 ZKP",
    title: "Cloud CSPM, ITDR, SBOM & ZK-Proofs",
    detail: "Terraform/K8s drift, BloodHound AD graphs, CycloneDX 1.5 + OpenVEX, and zero-knowledge compliance proofs.",
  },
];

const FRONTIER_WAVES = [
  {
    wave: "Waves 11–19",
    range: "Capabilities 41–79",
    title: "Critical Infrastructure, Space QKD & Geoneutrino Grid",
    detail: "SCADA kinetic shields, air-gapped LLM guards, 5G/6G RAN slicing, space-ground QKD laser meshes & cislunar relays.",
  },
  {
    wave: "Waves 20–25",
    range: "Capabilities 80–97",
    title: "Holographic Defense, Casimir Vacuum & MHD Plasma",
    detail: "Interstellar QKD meshes, Anyon braiding matrices, hyperspectral swarm interceptors & Ryu-Takayanagi entropy siphons.",
  },
  {
    wave: "Wave 26 • Century Era",
    range: "Capability 100",
    title: "Centesimal Quantum Gravity & Magneto-Inertial Fusion",
    detail: "Unified asymptotically safe RG flows, Horava-Lifshitz scaling & singularity-free metric stabilization.",
  },
  {
    wave: "Waves 27–37 • Current",
    range: "Capabilities 101–133 + Option B",
    title: `${PLATFORM_MILESTONE} (v${PLATFORM_VERSION})`,
    detail: "MERA/cMERA Tensor Renormalization Firewall, AQFT Haag-Kastler Tomita-Takesaki Shield, Skyrmion-Instanton BPST Theta-Vacuum Guard, BFSS Matrix Fuzzball & Time-Crystal Josephson Grid.",
  },
];

export function SovereignArchitectureShowcase() {
  const [activeTab, setActiveTab] = useState<ArchitectureTab>("pillars");

  return (
    <section id="architecture" className="py-24 relative overflow-hidden border-y border-white/5 bg-zinc-950/30">
      <div className="max-w-7xl mx-auto px-6">
        {/* Heading */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            v{PLATFORM_VERSION} &bull; {PLATFORM_WAVES_RANGE} Architecture
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
            One Command Center. <span className="text-emerald-400">{PLATFORM_CAPABILITIES_COUNT} Sovereign Capabilities.</span>
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            From classical DevSecOps and 9-engine THE ABYSS OSINT to NIST FIPS 203/204 Post-Quantum Enclaves and Wave 37 MERA Tensor RG, AQFT Haag-Kastler &amp; BPST Instanton Shield orchestration.
          </p>
        </div>

        {/* Live Platform Counts */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { value: `${PLATFORM_CAPABILITIES_COUNT}`, label: `Capabilities (${PLATFORM_WAVES_RANGE})` },
            { value: `${PLATFORM_DASHBOARD_MODULES_COUNT}`, label: "Command Center Studios" },
            { value: `${PLATFORM_FASTAPI_ROUTES_COUNT}`, label: "FastAPI Security Endpoints" },
            { value: `${PLATFORM_NEXT_API_ROUTES_COUNT}`, label: "Next.js Zero-Trust Routes" },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-2xl p-5 text-center border border-emerald-500/10">
              <div className="text-3xl font-black text-emerald-400 font-mono">{stat.value}</div>
              <div className="text-[11px] text-zinc-500 font-mono uppercase tracking-wider mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Interactive Tab Switcher */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          {[
            { id: "pillars" as const, label: "10-Pillar Sovereign Defense Grid", icon: Shield },
            { id: "enterprise" as const, label: "Multi-LLM, PQC & Zero-Egress Core", icon: Lock },
            { id: "frontier" as const, label: `${PLATFORM_WAVES_RANGE} · v${PLATFORM_VERSION} Milestone`, icon: Atom },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 rounded-full text-xs font-mono font-bold transition-all flex items-center gap-2 border ${
                  active
                    ? "bg-emerald-500 text-black border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.25)]"
                    : "bg-zinc-900/70 text-zinc-400 border-zinc-800 hover:text-white hover:border-emerald-500/40"
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: 10-Pillar Defense Grid */}
        {activeTab === "pillars" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
          >
            {PILLARS.map((pillar) => (
              <div
                key={pillar.num}
                className="glass rounded-2xl p-5 border border-white/5 hover:border-emerald-500/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">
                      PILLAR {pillar.num}
                    </span>
                    <pillar.icon className="w-4 h-4 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2">{pillar.name}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{pillar.detail}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 text-[10px] font-mono text-zinc-500">
                  {pillar.mitre}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Tab 2: Enterprise & Post-Quantum Core */}
        {activeTab === "enterprise" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {ENTERPRISE_CAPABILITIES.map((cap) => (
              <div
                key={cap.title}
                className="glass rounded-2xl p-6 border border-emerald-500/15 hover:border-emerald-500/40 transition-all"
              >
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
                  {cap.tag}
                </span>
                <h3 className="text-lg font-bold text-white mb-2">{cap.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{cap.detail}</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* Tab 3: Waves 1-33 Evolution */}
        {activeTab === "frontier" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {FRONTIER_WAVES.map((item) => (
              <div
                key={item.wave}
                className="glass rounded-2xl p-6 border border-white/10 hover:border-emerald-500/40 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold text-emerald-400">{item.wave}</span>
                  <span className="text-[10px] font-mono text-zinc-400 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                    {item.range}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </motion.div>
        )}

        <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/features"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            Explore all {PLATFORM_CAPABILITIES_COUNT} capabilities <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <span className="text-zinc-700">|</span>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-zinc-300 hover:text-emerald-400 transition-colors"
          >
            Open {PLATFORM_DASHBOARD_MODULES_COUNT}-Module Command Center <GitBranch className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

