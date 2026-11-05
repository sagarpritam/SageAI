"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Clock,
  Activity,
  GitBranch,
  Shield,
  Sparkles,
  Radar,
  ShieldAlert,
  FileCheck,
  HeartPulse,
  Rss,
  Globe,
  Swords,
  Radio,
  AlertTriangle,
  Flame,
  Biohazard,
  ScrollText,
  Network,
  Crosshair,
  ShieldCheck,
  Lock,
  Cpu,
  Terminal,
  Cloud,
  Package,
  Search,
  AlertOctagon,
  Database,
  Share2,
  GitPullRequest,
  Fingerprint,
  PackageCheck,
  Bot,
  KeyRound,
  Microscope,
  Coins,
  Zap,
  Skull,
  FileCheck2,
  Grid3X3,
} from "lucide-react";
import { DashboardOverview } from "@/components/DashboardOverview";
import { ScheduleManager } from "@/components/ScheduleManager";
import { ASMTimeline } from "@/components/ASMTimeline";
import { AutoFixPanel } from "@/components/AutoFixPanel";
import { AICopilot } from "@/components/AICopilot";
import { IntelligenceHub } from "@/components/IntelligenceHub";
import { RedTeamPanel } from "@/components/RedTeamPanel";
import { ComplianceCenter } from "@/components/ComplianceCenter";
import { SystemHealth } from "@/components/SystemHealth";
import { ThreatFeed } from "@/components/ThreatFeed";
import { SecurityPosture } from "@/components/SecurityPosture";
import { WarRoom } from "@/components/WarRoom";
import { ObservabilityDashboard } from "@/components/ObservabilityDashboard";
import { HoneypotCenter } from "@/components/HoneypotCenter";
import { AIConsensusArena } from "@/components/AIConsensusArena";
import { DeepAnalysisPanel } from "@/components/DeepAnalysisPanel";
import { DetonationChamber } from "@/components/DetonationChamber";
import { ThreatRuleSynthesizer } from "@/components/ThreatRuleSynthesizer";
import { IncidentCenter } from "@/components/IncidentCenter";
import { DefenseGridMonitor } from "@/components/DefenseGridMonitor";
import { CyberRangeArena } from "@/components/CyberRangeArena";
import { EnterpriseSecurityHub } from "@/components/EnterpriseSecurityHub";
import { ZeroEgressEnclave } from "@/components/ZeroEgressEnclave";
import { ThreatModelingStudio } from "@/components/ThreatModelingStudio";
import { QuantumSafeStudio } from "@/components/QuantumSafeStudio";
import { EBPFTelemetryMonitor } from "@/components/EBPFTelemetryMonitor";
import { CSPMHub } from "@/components/CSPMHub";
import { SupplyChainStudio } from "@/components/SupplyChainStudio";
import { ZTNAManager } from "@/components/ZTNAManager";
import { AdversaryMatrixViewer } from "@/components/AdversaryMatrixViewer";
import { EASMHunter } from "@/components/EASMHunter";
import { AISOCCommandCenter } from "@/components/AISOCCommandCenter";
import { ThreatHuntingStudio } from "@/components/ThreatHuntingStudio";
import { AntiRansomwareShield } from "@/components/AntiRansomwareShield";
import { DSPMHub } from "@/components/DSPMHub";
import { CTIHub } from "@/components/CTIHub";
import { AdversaryEmulationStudio } from "@/components/AdversaryEmulationStudio";
import { IaCDriftEngine } from "@/components/IaCDriftEngine";
import { SBOMVexStudio } from "@/components/SBOMVexStudio";
import { ITDRCommandCenter } from "@/components/ITDRCommandCenter";
import { CARTHub } from "@/components/CARTHub";
import { AISPMCommandCenter } from "@/components/AISPMCommandCenter";
import { KMSHSMStudio } from "@/components/KMSHSMStudio";
import { BloodHoundStudio } from "@/components/BloodHoundStudio";
import { ForensicsLab } from "@/components/ForensicsLab";
import { APIShieldCenter } from "@/components/APIShieldCenter";
import { Web3SecurityStudio } from "@/components/Web3SecurityStudio";
import { SDNShieldStudio } from "@/components/SDNShieldStudio";
import { DarkWebRadarCenter } from "@/components/DarkWebRadarCenter";
import { ZKPComplianceStudio } from "@/components/ZKPComplianceStudio";
import { D3FENDMatrixViewer } from "@/components/D3FENDMatrixViewer";
import { HardwareEnclaveStudio } from "@/components/HardwareEnclaveStudio";
import { ThreatHuntingSwarmStudio } from "@/components/ThreatHuntingSwarmStudio";
import { CanaryFabricCenter } from "@/components/CanaryFabricCenter";

const tabs = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "hunting-swarm", label: "Hunter Swarm", icon: Bot },
  { id: "canary-fabric", label: "Canary Fabric", icon: Radio },
  { id: "hardware-enclave", label: "Hardware Enclave", icon: Cpu },
  { id: "web3-security", label: "Web3 Security", icon: Coins },
  { id: "sdn-shield", label: "SDN Micro-Shield", icon: Zap },
  { id: "darkweb-radar", label: "Dark Web Radar", icon: Skull },
  { id: "zkp-compliance", label: "ZKP Attestation", icon: FileCheck2 },
  { id: "d3fend-matrix", label: "MITRE D3FEND", icon: Grid3X3 },
  { id: "ai-spm", label: "AI-SPM & LLMs", icon: Bot },
  { id: "kms-hsm", label: "KMS HSM & Shamir", icon: KeyRound },
  { id: "bloodhound", label: "Active Directory", icon: Network },
  { id: "forensics", label: "Live Forensics", icon: Microscope },
  { id: "api-shield", label: "API Shield (BOLA)", icon: ShieldAlert },
  { id: "adversary-emulation", label: "Adversary Emulation", icon: Crosshair },
  { id: "iac-drift", label: "IaC Drift Engine", icon: GitPullRequest },
  { id: "sbom-vex", label: "SBOM & OpenVEX", icon: PackageCheck },
  { id: "itdr", label: "Identity (ITDR)", icon: Fingerprint },
  { id: "cart-paths", label: "Attack Paths (CART)", icon: GitBranch },
  { id: "ai-soc", label: "AI SOC Triage", icon: ShieldAlert },
  { id: "threat-hunting", label: "Threat Hunting", icon: Search },
  { id: "anti-ransomware", label: "Anti-Ransomware", icon: AlertOctagon },
  { id: "dspm", label: "Cloud DSPM", icon: Database },
  { id: "cti-hub", label: "CTI & STIX", icon: Share2 },
  { id: "enterprise", label: "Enterprise Hub", icon: ShieldCheck },
  { id: "enclave", label: "Zero Egress Enclave", icon: Lock },
  { id: "threat-modeling", label: "Threat Modeling", icon: FileCheck },
  { id: "quantum-safe", label: "Quantum Safe PQC", icon: Cpu },
  { id: "ebpf-telemetry", label: "eBPF SIEM", icon: Terminal },
  { id: "cspm", label: "Cloud Posture", icon: Cloud },
  { id: "supply-chain", label: "Supply Chain", icon: Package },
  { id: "ztna", label: "Zero-Trust", icon: Network },
  { id: "adversary-matrix", label: "MITRE ATT&CK", icon: Swords },
  { id: "easm", label: "Shadow IT", icon: Globe },
  { id: "consensus", label: "Multi-AI Debate", icon: Swords },
  { id: "deep-analysis", label: "Deep Attacks", icon: Flame },
  { id: "detonation", label: "Malware Lab", icon: Biohazard },
  { id: "rules", label: "Rule Forge", icon: ScrollText },
  { id: "deception", label: "Honeypots", icon: Radio },
  { id: "defense-grid", label: "Defense Grid", icon: Network },
  { id: "cyber-range", label: "Cyber Range", icon: Crosshair },
  { id: "incidents", label: "Incidents & SOAR", icon: AlertTriangle },
  { id: "observability", label: "Observability", icon: Activity },
  { id: "posture", label: "Security Shield", icon: Shield },
  { id: "copilot", label: "AI Copilot", icon: Sparkles },
  { id: "intel", label: "Intel Hub", icon: Radar },
  { id: "redteam", label: "Red Team", icon: ShieldAlert },
  { id: "schedules", label: "Schedules", icon: Clock },
  { id: "asm", label: "ASM", icon: Activity },
  { id: "autofix", label: "Auto-Fix", icon: GitBranch },
  { id: "compliance", label: "Compliance", icon: FileCheck },
  { id: "health", label: "Health", icon: HeartPulse },
  { id: "threats", label: "Threats", icon: Rss },
  { id: "warroom", label: "War Room", icon: Globe },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  return (
    <main className="min-h-screen bg-black text-emerald-50 font-sans selection:bg-emerald-500/30">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/10 via-black to-black z-0 pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-emerald-900/30 rounded-lg">
            <Shield className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">Command Center</h1>
            <p className="text-xs text-zinc-500 font-mono">SageAI Enterprise Defense Grid</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-8 overflow-x-auto pb-1 border-b border-zinc-800">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-emerald-900/30 text-emerald-400 border-b-2 border-emerald-500"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/40"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="min-h-[500px]">
          {activeTab === "overview" && <DashboardOverview />}
          {activeTab === "hunting-swarm" && <ThreatHuntingSwarmStudio />}
          {activeTab === "canary-fabric" && <CanaryFabricCenter />}
          {activeTab === "hardware-enclave" && <HardwareEnclaveStudio />}
          {activeTab === "web3-security" && <Web3SecurityStudio />}
          {activeTab === "sdn-shield" && <SDNShieldStudio />}
          {activeTab === "darkweb-radar" && <DarkWebRadarCenter />}
          {activeTab === "zkp-compliance" && <ZKPComplianceStudio />}
          {activeTab === "d3fend-matrix" && <D3FENDMatrixViewer />}
          {activeTab === "ai-spm" && <AISPMCommandCenter />}
          {activeTab === "kms-hsm" && <KMSHSMStudio />}
          {activeTab === "bloodhound" && <BloodHoundStudio />}
          {activeTab === "forensics" && <ForensicsLab />}
          {activeTab === "api-shield" && <APIShieldCenter />}
          {activeTab === "adversary-emulation" && <AdversaryEmulationStudio />}
          {activeTab === "iac-drift" && <IaCDriftEngine />}
          {activeTab === "sbom-vex" && <SBOMVexStudio />}
          {activeTab === "itdr" && <ITDRCommandCenter />}
          {activeTab === "cart-paths" && <CARTHub />}
          {activeTab === "ai-soc" && <AISOCCommandCenter />}
          {activeTab === "threat-hunting" && <ThreatHuntingStudio />}
          {activeTab === "anti-ransomware" && <AntiRansomwareShield />}
          {activeTab === "dspm" && <DSPMHub />}
          {activeTab === "cti-hub" && <CTIHub />}
          {activeTab === "enterprise" && <EnterpriseSecurityHub />}
          {activeTab === "enclave" && <ZeroEgressEnclave />}
          {activeTab === "threat-modeling" && <ThreatModelingStudio />}
          {activeTab === "quantum-safe" && <QuantumSafeStudio />}
          {activeTab === "ebpf-telemetry" && <EBPFTelemetryMonitor />}
          {activeTab === "cspm" && <CSPMHub />}
          {activeTab === "supply-chain" && <SupplyChainStudio />}
          {activeTab === "ztna" && <ZTNAManager />}
          {activeTab === "adversary-matrix" && <AdversaryMatrixViewer />}
          {activeTab === "easm" && <EASMHunter />}
          {activeTab === "consensus" && <AIConsensusArena />}
          {activeTab === "deep-analysis" && <DeepAnalysisPanel />}
          {activeTab === "detonation" && <DetonationChamber />}
          {activeTab === "rules" && <ThreatRuleSynthesizer />}
          {activeTab === "deception" && <HoneypotCenter />}
          {activeTab === "defense-grid" && <DefenseGridMonitor />}
          {activeTab === "cyber-range" && <CyberRangeArena />}
          {activeTab === "incidents" && <IncidentCenter />}
          {activeTab === "observability" && <ObservabilityDashboard />}
          {activeTab === "posture" && <SecurityPosture />}
          {activeTab === "copilot" && <AICopilot />}
          {activeTab === "intel" && <IntelligenceHub />}
          {activeTab === "redteam" && <RedTeamPanel />}
          {activeTab === "schedules" && <ScheduleManager />}
          {activeTab === "asm" && <ASMTimeline />}
          {activeTab === "autofix" && <AutoFixPanel />}
          {activeTab === "compliance" && <ComplianceCenter />}
          {activeTab === "health" && <SystemHealth />}
          {activeTab === "threats" && <ThreatFeed />}
          {activeTab === "warroom" && <WarRoom />}
        </div>
      </div>
    </main>
  );
}
