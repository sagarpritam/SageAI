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

const tabs = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "enterprise", label: "Enterprise Hub", icon: ShieldCheck },
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
          {activeTab === "enterprise" && <EnterpriseSecurityHub />}
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
