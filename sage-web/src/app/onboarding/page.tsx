"use client";

import { Suspense } from "react";
import { Shield, Sparkles } from "lucide-react";

function OnboardingContent() {
  return (
    <main className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-md w-full space-y-4 p-8 rounded-2xl bg-zinc-950/80 border border-emerald-500/30 backdrop-blur-md shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
          <Shield className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-black text-white tracking-wide">
          Enterprise Pilot Sandbox Initialized
        </h1>
        <p className="text-xs text-zinc-400 leading-relaxed font-mono">
          Cryptographic token verified. Please complete your domain challenge in the pilot wizard overlay to activate autonomous perimeter defense.
        </p>
        <div className="pt-2 flex items-center justify-center gap-2 text-[11px] font-mono text-emerald-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>SOC 2 Type II | ISO 27001 | FIPS 203/204 PQC</span>
        </div>
      </div>
    </main>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <OnboardingContent />
    </Suspense>
  );
}

