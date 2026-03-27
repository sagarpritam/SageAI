"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, Zap, Target, Binary, Flag } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      icon: <Target className="w-6 h-6 text-emerald-400" />,
      title: "1. Reconnaissance & Asset Discovery",
      description: "SageAI begins by passively mapping your external attack surface. It enumerates subdomains, analyzes DNS records, identifies exposed cloud storage, and correlates OSINT data to build a complete map of your public footprint."
    },
    {
      icon: <Binary className="w-6 h-6 text-emerald-400" />,
      title: "2. Vulnerability Identification",
      description: "Using our proprietary LLM reasoning engine, the system analyzes open ports, exposed services, and web application endpoints. It doesn't just look for CVEs; it looks for logical flaws, misconfigurations, and authentication bypass opportunities."
    },
    {
      icon: <Zap className="w-6 h-6 text-emerald-400" />,
      title: "3. Safe Exploitation (Proof of Concept)",
      description: "To guarantee zero false positives, SageAI attempts a controlled exploit of identified vulnerabilities. It extracts non-destructive proof (like accessing /etc/passwd or retrieving a test database token) to mathematically prove the risk."
    },
    {
      icon: <Flag className="w-6 h-6 text-emerald-400" />,
      title: "4. Remediation & Reporting",
      description: "Findings are immediately sent to your dashboard and integrated Slack/Jira channels. Each vulnerability includes a detailed attack narrative, exact reproduction steps, and copy-paste ready remediation code."
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-emerald-500/30 font-sans">
      {/* Navigation */}
      <nav className="fixed w-full z-50 flex justify-between items-center p-6 bg-black/50 backdrop-blur-xl border-b border-white/5">
        <Link href="/" className="flex items-center gap-2 group">
          <Shield className="w-8 h-8 text-emerald-500 group-hover:text-emerald-400 transition-colors" />
          <span className="font-bold text-xl tracking-tighter">SAGE<span className="text-emerald-500">AI</span></span>
        </Link>
        <div className="hidden md:flex gap-8 text-sm font-medium text-zinc-400">
          <Link href="/features" className="hover:text-white transition-colors">Features</Link>
          <Link href="/how-it-works" className="text-emerald-400 transition-colors">How It Works</Link>
          <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
        </div>
        <Link href="/dashboard" className="px-6 py-2 bg-emerald-500/10 text-emerald-400 rounded-full font-bold hover:bg-emerald-500/20 border border-emerald-500/20 transition-all text-sm">
          Login
        </Link>
      </nav>

      <main className="pt-32 pb-24 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-20">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold mb-6 tracking-tighter"
          >
            The Autonomous <br/>
            <span className="gradient-text">Kill Chain.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-zinc-400"
          >
            How SageAI operates exactly like an elite human Red Team.
          </motion.p>
        </div>

        <div className="space-y-12">
          {steps.map((step, index) => (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: index * 0.1 }}
              key={index}
              className="relative p-8 bento-card flex gap-8 md:flex-row flex-col"
            >
              <div className="w-16 h-16 shrink-0 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                {step.icon}
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                <p className="text-lg text-zinc-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
