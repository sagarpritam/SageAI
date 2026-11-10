"use client";

import { Sparkles, Check, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import {
  PLATFORM_VERSION,
  PLATFORM_WAVES_RANGE,
  PLATFORM_CAPABILITIES_COUNT,
  PLATFORM_DASHBOARD_MODULES_COUNT,
} from "@/lib/platform";

export default function PricingPage() {
  const router = useRouter();

  const handleCheckout = async (planName: string) => {
    posthog.capture('checkout_started', { tier: planName });
    try {
      // Call our Stripe checkout API proxy
      const res = await fetch(`/api/checkout?plan=${planName}`, { method: "POST" });
      
      if (res.status === 401) {
        router.push("/login?redirect=/pricing");
        return;
      }
      
      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      }
    } catch (e) {
      console.error("Checkout failed", e);
    }
  };

  return (
    <div className="min-h-screen bg-black text-emerald-50 py-24 flex items-center justify-center">
      <div className="max-w-6xl mx-auto px-4 w-full">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono uppercase tracking-widest">
            <Shield className="w-3.5 h-3.5" />
            SageAI v{PLATFORM_VERSION} &bull; {PLATFORM_WAVES_RANGE} &bull; {PLATFORM_CAPABILITIES_COUNT} Capabilities
          </div>
          <h1 className="text-5xl font-black text-emerald-400 font-mono">Unlock Sovereign Mode</h1>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Scale from instant perimeter scans and PDF/SARIF exports to the full{" "}
            {PLATFORM_DASHBOARD_MODULES_COUNT}-studio Sovereign Defense Grid, 5-LLM Consensus,
            SagePatch AST Auto-Fix, and Post-Quantum Zero-Egress Enclaves.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Starter Tier */}
          <Card className="bg-zinc-950 border-emerald-900/30">
            <CardContent className="p-8 flex flex-col h-full justify-between">
              <div>
                <h3 className="text-xl font-bold font-mono text-zinc-300 mb-2">Starter</h3>
                <p className="text-3xl font-black mb-6">
                  $199<span className="text-sm font-normal text-zinc-500">/ month</span>
                </p>

                <ul className="space-y-4 mb-8 text-sm text-zinc-400">
                  <li className="flex items-center"><Check className="h-4 w-4 mr-2 shrink-0 text-emerald-500" /> 20 Autonomous Scans / month</li>
                  <li className="flex items-center"><Check className="h-4 w-4 mr-2 shrink-0 text-emerald-500" /> Up to 5 Team Members</li>
                  <li className="flex items-center"><Check className="h-4 w-4 mr-2 shrink-0 text-emerald-500" /> CISA KEV &amp; NVD Vulnerability Feed</li>
                  <li className="flex items-center"><Check className="h-4 w-4 mr-2 shrink-0 text-emerald-500" /> PDF &amp; SARIF Report Exports</li>
                </ul>
              </div>

              <Button onClick={() => handleCheckout("starter")} variant="outline" className="w-full border-zinc-700 text-zinc-300">
                Get Started
              </Button>
            </CardContent>
          </Card>

          {/* Pro Tier */}
          <Card className="bg-emerald-900/10 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.1)] relative overflow-hidden transform md:-translate-y-4">
            <div className="absolute top-0 right-0 bg-emerald-500 text-black text-xs font-bold px-3 py-1 font-mono">
              RECOMMENDED
            </div>
            <CardContent className="p-8 flex flex-col h-full justify-between">
              <div>
                <h3 className="text-xl font-bold font-mono text-emerald-400 mb-2 flex items-center">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Pro
                </h3>
                <p className="text-3xl font-black mb-6 text-white">
                  $499<span className="text-sm font-normal text-emerald-500/80">/ month</span>
                </p>

                <ul className="space-y-4 mb-8 text-sm text-emerald-100">
                  <li className="flex items-center"><Check className="h-4 w-4 mr-2 shrink-0 text-emerald-400" /> 100 Scans / month</li>
                  <li className="flex items-center"><Check className="h-4 w-4 mr-2 shrink-0 text-emerald-400" /> Up to 15 Users &amp; RBAC</li>
                  <li className="flex items-center"><Check className="h-4 w-4 mr-2 shrink-0 text-emerald-400" /> THE ABYSS 9-Module Deep Search</li>
                  <li className="flex items-center"><Check className="h-4 w-4 mr-2 shrink-0 text-emerald-400" /> 5-LLM Consensus &amp; SagePatch PRs</li>
                  <li className="flex items-center"><Check className="h-4 w-4 mr-2 shrink-0 text-emerald-400" /> Continuous ASM &amp; Slack/Jira Alerts</li>
                </ul>
              </div>

              <Button
                onClick={() => handleCheckout("pro")}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold h-12"
              >
                Upgrade to Pro
              </Button>
            </CardContent>
          </Card>

          {/* Enterprise Tier */}
          <Card className="bg-zinc-950 border-emerald-900/30">
            <CardContent className="p-8 flex flex-col h-full justify-between">
              <div>
                <h3 className="text-xl font-bold font-mono text-zinc-300 mb-2">Enterprise</h3>
                <p className="text-3xl font-black mb-6">
                  $2,000<span className="text-sm font-normal text-zinc-500">/ month</span>
                </p>

                <ul className="space-y-4 mb-8 text-sm text-zinc-400">
                  <li className="flex items-center"><Check className="h-4 w-4 mr-2 shrink-0 text-emerald-500" /> Unlimited Scans &amp; Unlimited Users</li>
                  <li className="flex items-center"><Check className="h-4 w-4 mr-2 shrink-0 text-emerald-500" /> All {PLATFORM_DASHBOARD_MODULES_COUNT} Studios ({PLATFORM_WAVES_RANGE})</li>
                  <li className="flex items-center"><Check className="h-4 w-4 mr-2 shrink-0 text-emerald-500" /> 10-Pillar Sovereign Defense Grid &amp; SOAR</li>
                  <li className="flex items-center"><Check className="h-4 w-4 mr-2 shrink-0 text-emerald-500" /> Zero-Egress Enclaves &amp; PQC FIPS 203/204</li>
                  <li className="flex items-center"><Check className="h-4 w-4 mr-2 shrink-0 text-emerald-500" /> SAML 2.0 SSO, Merkle Ledger &amp; SLA</li>
                </ul>
              </div>

              <Button onClick={() => handleCheckout("enterprise")} variant="outline" className="w-full border-zinc-700 text-zinc-300">
                Contact Sales
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
