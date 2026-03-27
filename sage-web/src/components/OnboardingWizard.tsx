"use client";

import { useState, useEffect } from "react";
import { Rocket, Scan, Shield, Bell, ArrowRight, CheckCircle, X } from "lucide-react";

const steps = [
  {
    id: 1,
    title: "Run Your First Scan",
    desc: "Enter a target URL or domain to discover vulnerabilities.",
    icon: Scan,
    action: "/scan",
    actionLabel: "Start Scanning",
  },
  {
    id: 2,
    title: "Review Findings",
    desc: "Check the Dashboard for risk scores, severity breakdowns, and AI recommendations.",
    icon: Shield,
    action: "/dashboard",
    actionLabel: "Open Dashboard",
  },
  {
    id: 3,
    title: "Set Up Notifications",
    desc: "Configure email reports and webhook alerts in Settings.",
    icon: Bell,
    action: "/settings",
    actionLabel: "Go to Settings",
  },
  {
    id: 4,
    title: "Invite Your Team",
    desc: "Add team members and assign roles to collaborate on security.",
    icon: Rocket,
    action: "/settings",
    actionLabel: "Manage Team",
  },
];

export function OnboardingWizard() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const dismissed = localStorage.getItem("sageai_onboarding_done");
    if (!dismissed) {
      setTimeout(() => setOpen(true), 0);
    }
  }, []);

  const dismiss = () => {
    setOpen(false);
    localStorage.setItem("sageai_onboarding_done", "true");
  };

  if (!open) return null;

  const current = steps[step];
  const Icon = current.icon;
  const progress = ((step + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-emerald-900/40 rounded-2xl shadow-2xl w-[440px] max-w-[95vw] overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-zinc-800">
          <div 
            className="h-1 bg-emerald-500 transition-all duration-300 progress-bar-fill" 
            style={{ '--progress-width': `${progress}%` } as React.CSSProperties} 
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2">
          <span className="text-xs text-zinc-500 font-mono">Step {step + 1} of {steps.length}</span>
          <button onClick={dismiss} className="text-zinc-600 hover:text-zinc-400 transition-colors" aria-label="Close onboarding">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-900/30 flex items-center justify-center mx-auto mb-5">
            <Icon className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-xl font-black text-white mb-2">{current.title}</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">{current.desc}</p>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex items-center gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2.5 bg-zinc-800 text-zinc-300 rounded-lg text-sm font-bold hover:bg-zinc-700 transition-colors"
            >
              Back
            </button>
          )}
          <div className="flex-1" />
          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-bold transition-colors"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={dismiss}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-bold transition-colors"
            >
              <CheckCircle className="w-4 h-4" /> Get Started
            </button>
          )}
        </div>

        {/* Step dots */}
        <div className="flex justify-center gap-1.5 pb-4">
          {steps.map((_, i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === step ? "bg-emerald-400" : i < step ? "bg-emerald-700" : "bg-zinc-700"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
