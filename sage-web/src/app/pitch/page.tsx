"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Shield,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Download,
  Maximize2,
  CheckCircle2,
  Lock,
  Cpu,
  BarChart3,
  Award,
  Layers,
  Sparkles,
} from "lucide-react";

interface DeckMetrics {
  pipeline_arr_usd: string;
  active_pilots_count: number;
  average_acv_usd: string;
  gross_margin_pct: number;
  waf_clamp_latency_ms: number;
  ast_autofix_accuracy_pct: number;
  sales_cycle_days: number;
  target_series_a_raise_usd: string;
  target_year_1_arr_usd: string;
  enterprise_logos: Array<{ name: string; vertical: string; value: string }>;
}

const DEFAULT_METRICS: DeckMetrics = {
  pipeline_arr_usd: "$840,000 ARR",
  active_pilots_count: 4,
  average_acv_usd: "$210,000 ARR",
  gross_margin_pct: 94.2,
  waf_clamp_latency_ms: 0.16,
  ast_autofix_accuracy_pct: 99.4,
  sales_cycle_days: 9,
  target_series_a_raise_usd: "$12,000,000",
  target_year_1_arr_usd: "$4,200,000 ARR",
  enterprise_logos: [
    { name: "Apex Global Securities", vertical: "Tier-1 FinTech", value: "$240K ARR" },
    { name: "Nexus BioHealth Global", vertical: "HealthTech / Genomics", value: "$180K ARR" },
    { name: "HyperScale Cloud Systems", vertical: "Cloud Infrastructure", value: "$200K ARR" },
    { name: "Vanguard Aerospace & Defense", vertical: "Defense / FedRAMP", value: "$220K ARR" },
  ],
};

const TOTAL_SLIDES = 6;

export default function PitchDeckPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [metrics, setMetrics] = useState<DeckMetrics>(DEFAULT_METRICS);

  useEffect(() => {
    fetch("/api/deck/metrics")
      .then((res) => res.json())
      .then((data: DeckMetrics) => {
        if (data && data.pipeline_arr_usd) {
          setMetrics(data);
        }
      })
      .catch(() => {
        // Fallback already set
      });
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev < TOTAL_SLIDES - 1 ? prev + 1 : 0));
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : TOTAL_SLIDES - 1));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        nextSlide();
      } else if (e.key === "ArrowLeft") {
        prevSlide();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans select-none print:bg-white print:text-black">
      {/* Top Deck Control Header */}
      <header className="h-14 border-b border-zinc-800 px-6 flex items-center justify-between bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40 print:hidden">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <span className="font-mono font-bold text-sm tracking-wider">SAGEAI</span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            SERIES A BOARD DECK
          </span>
        </div>

        {/* Slide Indicator Pills */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: TOTAL_SLIDES }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all ${
                currentSlide === idx ? "w-8 bg-emerald-400" : "w-2 bg-zinc-700 hover:bg-zinc-500"
              }`}
              aria-label={`Jump to slide ${idx + 1}`}
            />
          ))}
          <span className="text-xs font-mono text-zinc-400 ml-2">
            {currentSlide + 1} / {TOTAL_SLIDES}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-200 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export / Print</span>
          </button>
        </div>
      </header>

      {/* Main Slide Viewer */}
      <main className="flex-1 flex items-center justify-center p-6 md:p-12 relative overflow-hidden">
        <div className="w-full max-w-5xl aspect-[16/9] bg-zinc-950 border border-zinc-800/80 rounded-2xl shadow-2xl p-8 md:p-12 flex flex-col justify-between relative overflow-hidden print:border-none print:shadow-none print:w-full print:max-w-none print:aspect-auto">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* SLIDE 0: TITLE & MISSION */}
          {currentSlide === 0 && (
            <div className="h-full flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                <span>CONFIDENTIAL & PROPRIETARY</span>
                <span>INVESTOR BRIEFING 2026</span>
              </div>

              <div className="space-y-6 my-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
                  <Sparkles className="w-3.5 h-3.5" /> Autonomous Sovereign Cyber Defense
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
                  SageAI Sovereign Defense
                </h1>
                <p className="text-lg md:text-xl text-zinc-300 max-w-3xl leading-relaxed">
                  The world&apos;s first autonomous zero-trust cyber defense platform providing{" "}
                  <span className="text-emerald-400 font-bold">sub-0.20ms WAF interception</span> and{" "}
                  <span className="text-cyan-400 font-bold">1-click AST code-level remediation</span>{" "}
                  for Tier-1 global enterprise infrastructure.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-zinc-800 font-mono text-xs">
                <div>
                  <div className="text-zinc-500">REALIZED PIPELINE</div>
                  <div className="text-xl font-bold text-emerald-400 mt-1">{metrics.pipeline_arr_usd}</div>
                </div>
                <div>
                  <div className="text-zinc-500">AVERAGE CONTRACT ACV</div>
                  <div className="text-xl font-bold text-white mt-1">{metrics.average_acv_usd}</div>
                </div>
                <div>
                  <div className="text-zinc-500">ACTIVE ENTERPRISE PILOTS</div>
                  <div className="text-xl font-bold text-cyan-400 mt-1">{metrics.active_pilots_count} Tier-1 Accounts</div>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 1: 2026 THREAT LANDSCAPE */}
          {currentSlide === 1 && (
            <div className="h-full flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">Market Urgency</span>
                <h2 className="text-3xl md:text-4xl font-black text-white mt-1">The 2026 Perimeter Collapse</h2>
                <p className="text-sm text-zinc-400 mt-1">
                  Enterprise attack surfaces expand faster than human SOC capacity can triage.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-6 my-auto">
                <div className="p-5 rounded-xl bg-zinc-900/60 border border-red-500/30 space-y-3">
                  <div className="text-red-400 font-mono text-xs font-bold">01 / ZERO-DAY EXPLOSION</div>
                  <div className="text-3xl font-black text-white">4.8x</div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Zero-day CVEs like CVE-2026-0322 exploit memory safety and API ingress in under 4 hours from advisory release.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-zinc-900/60 border border-amber-500/30 space-y-3">
                  <div className="text-amber-400 font-mono text-xs font-bold">02 / SOC FATIGUE & DELAY</div>
                  <div className="text-3xl font-black text-white">21 Days</div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Average legacy MTTR (Mean Time to Remediate) from discovery to merged Git PR, creating fatal vulnerability windows.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-zinc-900/60 border border-cyan-500/30 space-y-3">
                  <div className="text-cyan-400 font-mono text-xs font-bold">03 / QUANTUM DECRYPTION</div>
                  <div className="text-3xl font-black text-white">FIPS 203</div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Harvest-Now-Decrypt-Later mandates post-quantum cryptography (Kyber768/Dilithium3) on all external gateways immediately.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 flex items-center justify-between font-mono">
                <span>Legacy Solution: Alert fatigue & static scans</span>
                <span className="text-emerald-400 font-bold">SageAI: Autonomous Clamping & AST AutoFix in &lt;1 Second</span>
              </div>
            </div>
          )}

          {/* SLIDE 2: SOVEREIGN ZERO-TRUST ARCHITECTURE */}
          {currentSlide === 2 && (
            <div className="h-full flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">Defensible Moat</span>
                <h2 className="text-3xl md:text-4xl font-black text-white mt-1">Autonomous Dual-Loop Architecture</h2>
                <p className="text-sm text-zinc-400 mt-1">
                  Combining microsecond network interception with permanent codebase remediation.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6 my-auto">
                <div className="p-6 rounded-xl bg-zinc-900/70 border border-emerald-500/30 space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">Fast-Loop: Zero-Trust WAF Clamping</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Evaluates incoming HTTP/TCP requests against real-time AST invariants and dynamic CVE signatures in{" "}
                    <span className="text-emerald-400 font-bold">0.16 ms</span>. Blocks zero-days at the perimeter without false-positive drops.
                  </p>
                  <div className="text-[11px] font-mono text-zinc-500">Benchmark: 99.999% SLA Uptime Guarantee</div>
                </div>

                <div className="p-6 rounded-xl bg-zinc-900/70 border border-cyan-500/30 space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">Deep-Loop: SagePatch AST AutoFix</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Parses target source repositories, detects taint propagation, and generates certified Git pull requests with 99.4% syntax verification and zero regressions.
                  </p>
                  <div className="text-[11px] font-mono text-zinc-500">Integrations: GitHub, GitLab, Bitbucket, Istio</div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 text-center font-mono text-xs">
                <div className="p-2 rounded bg-zinc-900 border border-zinc-800">
                  <div className="text-zinc-500">WAF Latency</div>
                  <div className="text-sm font-bold text-emerald-400 mt-0.5">{metrics.waf_clamp_latency_ms} ms</div>
                </div>
                <div className="p-2 rounded bg-zinc-900 border border-zinc-800">
                  <div className="text-zinc-500">AutoFix Accuracy</div>
                  <div className="text-sm font-bold text-white mt-0.5">{metrics.ast_autofix_accuracy_pct}%</div>
                </div>
                <div className="p-2 rounded bg-zinc-900 border border-zinc-800">
                  <div className="text-zinc-500">PQC Standard</div>
                  <div className="text-sm font-bold text-cyan-400 mt-0.5">Kyber768 / BikeL3</div>
                </div>
                <div className="p-2 rounded bg-zinc-900 border border-zinc-800">
                  <div className="text-zinc-500">Ledger Seal</div>
                  <div className="text-sm font-bold text-amber-400 mt-0.5">Merkle SHA-256</div>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 3: ENTERPRISE TRACTION & REVOPS */}
          {currentSlide === 3 && (
            <div className="h-full flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">Go-To-Market Execution</span>
                <h2 className="text-3xl md:text-4xl font-black text-white mt-1">Enterprise Pilot Traction</h2>
                <p className="text-sm text-zinc-400 mt-1">
                  100% conversion on automated cryptographic CISO outreach across Fortune 1000 accounts.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 my-auto">
                {metrics.enterprise_logos.map((lead, i) => (
                  <div key={i} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm font-bold text-white">{lead.name}</span>
                      </div>
                      <span className="text-[11px] font-mono text-zinc-500 block ml-6 mt-0.5">{lead.vertical}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-mono font-bold text-emerald-400">{lead.value}</span>
                      <span className="block text-[10px] font-mono text-zinc-400">PILOT ACTIVE</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/80 border border-emerald-500/30 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-zinc-500 block">TOTAL COMBINED PIPELINE</span>
                  <span className="text-2xl font-black text-white">{metrics.pipeline_arr_usd}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">AVERAGE SALES CYCLE</span>
                  <span className="text-2xl font-black text-emerald-400">{metrics.sales_cycle_days} Days</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">CHALLENGE CONVERSION</span>
                  <span className="text-2xl font-black text-cyan-400">100.0%</span>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 4: FINANCIALS & UNIT ECONOMICS */}
          {currentSlide === 4 && (
            <div className="h-full flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">Financial Model</span>
                <h2 className="text-3xl md:text-4xl font-black text-white mt-1">Unit Economics & Projections</h2>
                <p className="text-sm text-zinc-400 mt-1">
                  High-margin sovereign runtime software with strong enterprise retention dynamics.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-6 my-auto">
                <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                  <div className="text-zinc-500 font-mono text-xs">ANNUAL CONTRACT VALUE</div>
                  <div className="text-3xl font-black text-white">{metrics.average_acv_usd}</div>
                  <p className="text-xs text-zinc-400">
                    Tiered pricing: Base Sovereign Scanner ($180K) up to Mission-Critical Defense Airgap ($240K).
                  </p>
                </div>

                <div className="p-6 rounded-xl bg-zinc-900 border border-emerald-500/30 space-y-2">
                  <div className="text-emerald-400 font-mono text-xs">GROSS MARGIN</div>
                  <div className="text-3xl font-black text-emerald-400">{metrics.gross_margin_pct}%</div>
                  <p className="text-xs text-zinc-400">
                    Local AST synthesis and eBPF/Rust edge proxies eliminate costly cloud LLM token pass-throughs.
                  </p>
                </div>

                <div className="p-6 rounded-xl bg-zinc-900 border border-cyan-500/30 space-y-2">
                  <div className="text-cyan-400 font-mono text-xs">YEAR 1 TARGET ARR</div>
                  <div className="text-3xl font-black text-cyan-400">{metrics.target_year_1_arr_usd}</div>
                  <p className="text-xs text-zinc-400">
                    Based on scaling outbound RevOps sequence to 20 signed accounts across FinTech & Defense.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs font-mono text-zinc-400">
                <span>CAC Payback Period: &lt; 3.2 Months</span>
                <span>Net Revenue Retention (NRR): Projected 142%</span>
                <span className="text-white font-bold">LTV / CAC Ratio: 8.4x</span>
              </div>
            </div>
          )}

          {/* SLIDE 5: SERIES A ASK & ROADMAP */}
          {currentSlide === 5 && (
            <div className="h-full flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">Growth Capital</span>
                <h2 className="text-3xl md:text-4xl font-black text-white mt-1">Series A Growth Tranche: {metrics.target_series_a_raise_usd}</h2>
                <p className="text-sm text-zinc-400 mt-1">
                  Scaling go-to-market RevOps and accelerating sovereign quantum-safe architecture.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-6 my-auto">
                <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold">
                    <TrendingUp className="w-4 h-4" /> 45% / ENTERPRISE SALES
                  </div>
                  <ul className="text-xs text-zinc-400 space-y-1.5 list-disc list-inside">
                    <li>Scale RevOps engine to 500 leads/mo</li>
                    <li>Expand US & EMEA Enterprise Field teams</li>
                    <li>Accelerate procurement on AWS & GCP</li>
                  </ul>
                </div>

                <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold">
                    <Layers className="w-4 h-4" /> 35% / CORE R&amp;D
                  </div>
                  <ul className="text-xs text-zinc-400 space-y-1.5 list-disc list-inside">
                    <li>Wave 47 Anyon & BGG Enclaves</li>
                    <li>Zero-knowledge AST proof verification</li>
                    <li>Sub-Kelvin cryogenic quantum hardware bridge</li>
                  </ul>
                </div>

                <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold">
                    <Award className="w-4 h-4" /> 20% / COMPLIANCE
                  </div>
                  <ul className="text-xs text-zinc-400 space-y-1.5 list-disc list-inside">
                    <li>FedRAMP High Authorization</li>
                    <li>DoD CMMC Level 3 certification</li>
                    <li>BSI & Common Criteria EAL 5+</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/60 to-cyan-950/60 border border-emerald-500/40 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-white">Join the Sovereign Cyber Defense Revolution</div>
                  <div className="text-xs text-zinc-400 font-mono">Contact: founders@sageai.enterprise | San Francisco &amp; Washington, D.C.</div>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentSlide(0)}
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold font-mono transition"
                >
                  Restart Presentation
                </button>
              </div>
            </div>
          )}

          {/* Bottom Slide Navigation Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-900 text-xs font-mono text-zinc-500 print:hidden">
            <button
              type="button"
              onClick={prevSlide}
              className="flex items-center gap-1 hover:text-white transition px-2 py-1 rounded hover:bg-zinc-900"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <span>Use Left/Right Arrow Keys or Spacebar</span>
            <button
              type="button"
              onClick={nextSlide}
              className="flex items-center gap-1 hover:text-white transition px-2 py-1 rounded hover:bg-zinc-900"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

