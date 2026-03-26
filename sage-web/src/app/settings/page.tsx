"use client";

import { useState } from "react";
import { Settings, Building2, Users, Key, Lock } from "lucide-react";
import { OrgSettings } from "@/components/OrgSettings";
import { TeamManager } from "@/components/TeamManager";
import { APIKeyManager } from "@/components/APIKeyManager";
import { SecuritySettings } from "@/components/SecuritySettings";
import { IntegrationManager } from "@/components/IntegrationManager";
import { WebhookManager } from "@/components/WebhookManager";
import { AuditLog } from "@/components/AuditLog";
import { DataExport } from "@/components/DataExport";
import { Briefcase, ScrollText, HardDriveDownload } from "lucide-react";

const tabs = [
  { id: "org", label: "Organization", icon: Building2 },
  { id: "team", label: "Team", icon: Users },
  { id: "keys", label: "API Keys", icon: Key },
  { id: "security", label: "Security", icon: Lock },
  { id: "enterprise", label: "Enterprise", icon: Briefcase },
  { id: "audit", label: "Audit Log", icon: ScrollText },
  { id: "export", label: "Export", icon: HardDriveDownload },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("org");

  return (
    <main className="min-h-screen bg-black text-emerald-50 font-sans selection:bg-emerald-500/30">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/10 via-black to-black z-0 pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-emerald-900/30 rounded-lg">
            <Settings className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">Settings</h1>
            <p className="text-xs text-zinc-500 font-mono">Manage your organization, team, and API access</p>
          </div>
        </div>

        {/* Tab Nav */}
        <div className="flex gap-1 mb-8 overflow-x-auto pb-1 border-b border-zinc-800">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-bold transition-all whitespace-nowrap ${
                  isActive ? "bg-emerald-900/30 text-emerald-400 border-b-2 border-emerald-500" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/40"
                }`}>
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="min-h-[400px]">
          {activeTab === "org" && <OrgSettings />}
          {activeTab === "team" && <TeamManager />}
          {activeTab === "keys" && <APIKeyManager />}
          {activeTab === "security" && <SecuritySettings />}
          {activeTab === "enterprise" && (
            <div className="space-y-6">
              <IntegrationManager />
              <WebhookManager />
            </div>
          )}
          {activeTab === "audit" && <AuditLog />}
          {activeTab === "export" && <DataExport />}
        </div>
      </div>
    </main>
  );
}
