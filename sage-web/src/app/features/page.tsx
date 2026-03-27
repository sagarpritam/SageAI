"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, Terminal, Zap, Lock, Search, Network } from 'lucide-react';

export default function Features() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const features = [
    {
      icon: <Network className="w-8 h-8 text-emerald-400" />,
      title: "Attack Surface Discovery",
      description: "Continuously maps your entire infrastructure, finding forgotten subdomains, exposed APIs, and rogue cloud buckets before attackers do."
    },
    {
      icon: <Terminal className="w-8 h-8 text-emerald-400" />,
      title: "LLM Reasoning Engine",
      description: "Powered by custom-trained AI models that understand context and logic flaws, not just signature matching. It thinks like a human hacker."
    },
    {
      icon: <Lock className="w-8 h-8 text-emerald-400" />,
      title: "Zero False Positives",
      description: "Every vulnerability is validated through safe, controlled exploitation. If you see it on the dashboard, it is a real threat."
    },
    {
      icon: <Shield className="w-8 h-8 text-emerald-400" />,
      title: "SOC2 & ISO27001 Mapping",
      description: "Automatically maps findings to compliance frameworks, generating auditor-ready reports with a single click."
    },
    {
      icon: <Zap className="w-8 h-8 text-emerald-400" />,
      title: "CI/CD Pipeline Native",
      description: "Blocks vulnerable code before it hits production. Integrates directly with GitHub Actions, GitLab CI, and Bitbucket."
    },
    {
      icon: <Search className="w-8 h-8 text-emerald-400" />,
      title: "Deep OSINT Reconnaissance",
      description: "Scours the dark web, GitHub repos, and public databases for leaked credentials and exposed secrets linked to your domain."
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
          <Link href="/features" className="text-emerald-400 transition-colors">Features</Link>
          <Link href="/how-it-works" className="hover:text-white transition-colors">How It Works</Link>
          <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
        </div>
        <Link href="/dashboard" className="px-6 py-2 bg-emerald-500/10 text-emerald-400 rounded-full font-bold hover:bg-emerald-500/20 border border-emerald-500/20 transition-all text-sm">
          Login
        </Link>
      </nav>

      <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold mb-6 tracking-tighter"
          >
            Capabilities that scale <br/>
            <span className="gradient-text">beyond human limits.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-zinc-400 max-w-2xl mx-auto"
          >
            SageAI utilizes a swarm of autonomous agents to execute complex, multi-stage attacks across your entire infrastructure.
          </motion.p>
        </div>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, i) => (
            <motion.div 
              key={i}
              variants={item}
              className="bento-card p-8 group"
            >
              <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-zinc-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 p-12 glass-enhanced rounded-3xl text-center border border-emerald-500/20"
        >
          <h2 className="text-3xl font-bold mb-6">Ready to secure your infrastructure?</h2>
          <p className="text-zinc-400 mb-8 max-w-xl mx-auto">
            Deploy SageAI in less than 60 seconds and instantly uncover vulnerabilities that traditional scanners miss.
          </p>
          <Link href="/dashboard" className="px-10 py-4 bg-emerald-500 text-black rounded-full font-bold hover:bg-emerald-400 transition-colors inline-block text-lg">
            Start Free Scan
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
