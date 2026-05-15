"use client";

import { Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";

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
      <div className="max-w-4xl mx-auto px-4 w-full">
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-5xl font-black text-emerald-400 font-mono">Unlock Founder Mode</h1>
          <p className="text-zinc-400 max-w-lg mx-auto">Get unlimited autonomous pentests, complete vulnerability reports, and interactive attack graphs.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Starter Tier */}
          <Card className="bg-zinc-950 border-emerald-900/30 opacity-80">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold font-mono text-zinc-300 mb-2">Starter</h3>
              <p className="text-3xl font-black mb-6">$199<span className="text-sm font-normal text-zinc-500">/ month</span></p>
              
              <ul className="space-y-4 mb-8 text-sm text-zinc-400">
                <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-emerald-500" /> 20 Scans per month</li>
                <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-emerald-500" /> Up to 5 users</li>
                <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-emerald-500" /> Basic vulnerability list</li>
                <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-emerald-500" /> PDF Reports</li>
              </ul>
              
              <Button onClick={() => handleCheckout("starter")} variant="outline" className="w-full border-zinc-700 text-zinc-300">
                Get Started
              </Button>
            </CardContent>
          </Card>

          {/* Pro Tier */}
          <Card className="bg-emerald-900/10 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.1)] relative overflow-hidden transform md:-translate-y-4">
            <div className="absolute top-0 right-0 bg-emerald-500 text-black text-xs font-bold px-3 py-1 font-mono transform translate-x-2 -translate-y-0">
              RECOMMENDED
            </div>
            <CardContent className="p-8">
              <h3 className="text-xl font-bold font-mono text-emerald-400 mb-2 flex items-center">
                <Sparkles className="h-4 w-4 mr-2" />
                Pro
              </h3>
              <p className="text-3xl font-black mb-6 text-white">$499<span className="text-sm font-normal text-emerald-500/80">/ month</span></p>
              
              <ul className="space-y-4 mb-8 text-sm text-emerald-100">
                <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-emerald-400" /> 100 Scans per month</li>
                <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-emerald-400" /> Up to 15 users</li>
                <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-emerald-400" /> Deep Search integration</li>
                <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-emerald-400" /> AI Explanations</li>
                <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-emerald-400" /> Priority Support</li>
              </ul>
              
              <Button 
                onClick={() => handleCheckout("pro")} 
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold h-12"
              >
                Upgrade to Pro
              </Button>
            </CardContent>
          </Card>

          {/* Enterprise Tier */}
          <Card className="bg-zinc-950 border-emerald-900/30 opacity-80">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold font-mono text-zinc-300 mb-2">Enterprise</h3>
              <p className="text-3xl font-black mb-6">$2,000<span className="text-sm font-normal text-zinc-500">/ month</span></p>
              
              <ul className="space-y-4 mb-8 text-sm text-zinc-400">
                <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-emerald-500" /> Unlimited Scans</li>
                <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-emerald-500" /> Unlimited users</li>
                <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-emerald-500" /> Continuous Monitoring</li>
                <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-emerald-500" /> API Access & SSO</li>
                <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-emerald-500" /> Dedicated SLA</li>
              </ul>
              
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
