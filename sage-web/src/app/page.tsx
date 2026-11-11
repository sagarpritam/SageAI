"use client";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion';
import Link from 'next/link';
import { SovereignArchitectureShowcase } from '@/components/SovereignArchitectureShowcase';
import {
  PLATFORM_VERSION,
  PLATFORM_MILESTONE,
  PLATFORM_WAVES_RANGE,
  PLATFORM_CAPABILITIES_COUNT,
  PLATFORM_DASHBOARD_MODULES_COUNT,
} from '@/lib/platform';
import {
  Shield,
  Terminal as TerminalIcon,
  Zap,
  Lock,
  Search,
  Cpu,
  FileText,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Activity,
  Menu,
  X,
  Target,
  Layers,
  Eye,
  Database,
  ArrowUpRight,
  ChevronUp,
  ShieldCheck,
  Github,
  MessageSquare,
  Cloud,
  Box,
  Plus,
  Quote,
  ArrowRight,
} from 'lucide-react';

const CYBER_PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  x: `${(i * 37 + 13) % 94 + 3}%`,
  y: `${(i * 53 + 7) % 92 + 4}%`,
  duration: 5 + (i % 5),
  delay: (i * 0.45) % 4.5,
}));

const MATRIX_CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF';
const MATRIX_COLUMNS = Array.from({ length: 10 }, (_, colIdx) => ({
  opacity: 0.25 + ((colIdx * 7) % 5) * 0.1,
  text: Array.from(
    { length: 50 },
    (__, rowIdx) => MATRIX_CHARS[(colIdx * 17 + rowIdx * 11) % MATRIX_CHARS.length]
  ).join(''),
}));

// --- Components ---

const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 2;
      });
    }, 30);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[10000] bg-black flex flex-col items-center justify-center p-6"
    >
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-4">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="w-16 h-16 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full"
          />
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-emerald-500" />
            <span className="text-2xl font-bold tracking-tighter">SAGE<span className="text-emerald-400">AI</span></span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
            <span>Initializing Core...</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-emerald-500 shadow-[0_0_15px_#10b981]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {['THE_ABYSS_OSINT', 'FIVE_LLM_COUNCIL', 'PQC_FIPS_203_204', `GRID_v${PLATFORM_VERSION}`].map((module, i) => (
            <div key={module} className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${progress > (i + 1) * 20 ? 'bg-emerald-500 shadow-[0_0_5px_#10b981]' : 'bg-zinc-800'}`} />
              <span className="text-[8px] font-mono text-zinc-600 tracking-widest">{module}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      const target = e.target as HTMLElement;
      setIsPointer(window.getComputedStyle(target).cursor === 'pointer');
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <motion.div
      animate={{ 
        x: position.x - 12, 
        y: position.y - 12,
        scale: isPointer ? 1.5 : 1,
        backgroundColor: isPointer ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.1)'
      }}
      transition={{ type: 'spring', damping: 25, stiffness: 250, mass: 0.5 }}
      className="fixed top-0 left-0 w-6 h-6 rounded-full border border-emerald-500/50 pointer-events-none z-[9999] hidden md:block"
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-1 h-1 bg-emerald-500 rounded-full" />
      </div>
    </motion.div>
  );
};

const NoiseOverlay = () => <div className="fixed inset-0 noise z-[100] pointer-events-none" />;

const ScanlineEffect = () => <div className="absolute inset-0 overflow-hidden pointer-events-none z-20"><div className="scanline" /></div>;

const Pointer = ({ x, y, label, description }: { x: string, y: string, label: string, description: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div 
      className="absolute z-30" 
      style={{ left: x, top: y }}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <div className="relative">
        <motion.div 
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-4 h-4 bg-emerald-500 rounded-full cursor-pointer shadow-[0_0_15px_#10b981]"
        />
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-48 p-4 glass rounded-xl border-emerald-500/30 shadow-2xl pointer-events-none"
            >
              <div className="text-emerald-400 font-bold text-xs uppercase tracking-widest mb-1">{label}</div>
              <div className="text-zinc-400 text-[10px] leading-relaxed">{description}</div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-emerald-500/30" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const CyberGlow = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/5 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-emerald-500/5 blur-[100px] rounded-full animate-pulse" style={{ animationDelay: '4s' }} />
    </div>
  );
};

const CyberHUD = () => {
  const { scrollYProgress } = useScroll();
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 360]);
  
  return (
    <div className="fixed top-1/2 right-8 -translate-y-1/2 z-40 hidden 2xl:block">
      <div className="relative w-32 h-32">
        <motion.div 
          style={{ rotate }}
          className="absolute inset-0 border border-emerald-500/20 rounded-full"
        />
        <motion.div 
          style={{ rotate: useTransform(scrollYProgress, [0, 1], [360, 0]) }}
          className="absolute inset-4 border border-dashed border-emerald-500/10 rounded-full"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-[8px] font-mono text-emerald-500 uppercase tracking-widest mb-1">Scroll_Pos</div>
          <motion.div className="text-xs font-bold text-white">
            {useTransform(scrollYProgress, (v) => Math.round(v * 100))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const AttackMap = () => {
  const [threats, setThreats] = useState([
    { id: 1, type: 'CVE-2026-0322 RCE', target: '192.168.1.45', origin: 'Moscow, RU' },
    { id: 2, type: 'IMDSv2 SSRF', target: 'api.stark.io', origin: 'Beijing, CN' },
    { id: 3, type: 'C2 Beacon', target: 'prod.oscorp.com', origin: 'Berlin, DE' }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setThreats(prev => {
        const newThreat = {
          id: Date.now(),
          type: ['SQLi', 'XSS', 'CVE-2026-88772', 'Prompt Injection', 'C2 Beacon'][Math.floor(Math.random() * 5)],
          target: ['10.0.0.1', '172.16.0.5', '192.168.1.100', 'api.sage.ai'][Math.floor(Math.random() * 4)],
          origin: ['Tokyo, JP', 'London, UK', 'New York, US', 'Paris, FR', 'Seoul, KR'][Math.floor(Math.random() * 5)]
        };
        return [newThreat, ...prev.slice(0, 2)];
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full aspect-[1/1] md:aspect-[2/1] bg-zinc-950/50 rounded-[2rem] md:rounded-[3rem] border border-white/5 overflow-hidden group">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05),transparent_70%)]" />
      
      {/* Mock Map Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/map/1920/1080')] bg-cover bg-center mix-blend-overlay grayscale" />
      </div>

      {/* Central Node */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
        <div className="relative">
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="w-12 h-12 bg-emerald-500 rounded-full blur-md"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Shield className="w-6 h-6 text-black" />
          </div>
        </div>
      </div>

      {/* Animated Attack Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        {[
          { x1: "10", y1: "20", x2: "50", y2: "50", delay: 0 },
          { x1: "80", y1: "30", x2: "50", y2: "50", delay: 1.5 },
          { x1: "20", y1: "70", x2: "50", y2: "50", delay: 0.8 },
          { x1: "90", y1: "80", x2: "50", y2: "50", delay: 2.2 },
          { x1: "15", y1: "50", x2: "50", y2: "50", delay: 3.1 },
        ].map((line, i) => (
          <g key={i}>
            <motion.path
              d={`M ${line.x1} ${line.y1} L ${line.x2} ${line.y2}`}
              stroke="rgba(16, 185, 129, 0.2)"
              strokeWidth="1"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 3, delay: line.delay, ease: "linear" }}
            />
            <motion.circle
              r="2"
              fill="#10b981"
              initial={{ offset: 0, opacity: 0 }}
              animate={{ 
                cx: [line.x1, line.x2], 
                cy: [line.y1, line.y2],
                opacity: [0, 1, 0]
              }}
              transition={{ repeat: Infinity, duration: 3, delay: line.delay, ease: "linear" }}
            />
          </g>
        ))}
      </svg>

      {/* Stats Overlay */}
      <div className="absolute bottom-8 left-8 z-30 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">Live Threat Feed</span>
        </div>
        <div className="glass p-4 rounded-xl border-white/5 space-y-2 min-w-[240px]">
          <AnimatePresence mode="popLayout">
            {threats.map((threat) => (
              <motion.div 
                key={threat.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-0.5"
              >
                <div className="text-[10px] text-zinc-500 font-mono uppercase">DETECTED: {threat.type} @ {threat.target}</div>
                <div className="text-[10px] text-emerald-400 font-mono uppercase">NEUTRALIZED: SageAI Core v{PLATFORM_VERSION}</div>
                <div className="text-[8px] text-zinc-600 font-mono uppercase">ORIGIN: {threat.origin}</div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const CyberBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05),transparent_70%)]" />
      
      {/* Cyber Scan Line */}
      <motion.div 
        animate={{ y: ['-100%', '200%'] }}
        transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
        className="absolute top-0 left-0 w-full h-1 bg-emerald-500/20 blur-[2px] z-10"
      />

      {CYBER_PARTICLES.map((p, i) => (
        <motion.div
          key={i}
          initial={{
            x: p.x,
            y: p.y,
            opacity: 0
          }}
          animate={{
            opacity: [0, 0.2, 0],
            scale: [1, 1.5, 1]
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay
          }}
          className="absolute w-1 h-1 bg-emerald-500 rounded-full blur-[1px]"
        />
      ))}
    </div>
  );
};

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 z-50 w-12 h-12 bg-emerald-500 text-black rounded-full flex items-center justify-center shadow-2xl hover:bg-emerald-400 transition-all"
        >
          <ChevronUp className="w-6 h-6" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

const Comparison = () => {
  return (
    <div className="max-w-5xl mx-auto px-6 py-24">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold mb-4">The <span className="text-emerald-400">SageAI</span> Advantage</h2>
        <p className="text-zinc-500">Why wait weeks for a report when you can have it in seconds?</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Traditional Pen-test */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="p-8 glass rounded-3xl border-white/5 opacity-50 grayscale hover:grayscale-0 transition-all"
        >
          <h3 className="text-xl font-bold mb-8 text-zinc-400">Traditional Pen-testing</h3>
          <div className="space-y-6">
            {[
              { label: 'Cost', value: '$15,000 - $25,000', icon: X },
              { label: 'Time', value: '2 - 4 Weeks', icon: X },
              { label: 'Frequency', value: 'Once a Year', icon: X },
              { label: 'Reporting', value: 'Static PDF', icon: X },
              { label: 'Verification', value: 'Manual / Human', icon: X }
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between border-b border-white/5 pb-4">
                <span className="text-sm text-zinc-500">{item.label}</span>
                <div className="flex items-center gap-2 text-zinc-400 font-bold">
                  <item.icon className="w-4 h-4 text-red-500/50" />
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* SageAI */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="p-8 glass rounded-3xl border-emerald-500/30 bg-emerald-500/5 shadow-[0_0_50px_rgba(16,185,129,0.1)] relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-6">
            <Zap className="w-8 h-8 text-emerald-500 animate-pulse" />
          </div>
          <h3 className="text-xl font-bold mb-8 text-emerald-400">SageAI Autonomous</h3>
          <div className="space-y-6">
            {[
              { label: 'Starting Cost', value: '$199 / month', icon: CheckCircle2 },
              { label: 'Time', value: '60 Seconds', icon: CheckCircle2 },
              { label: 'Modules & Studios', value: `${PLATFORM_DASHBOARD_MODULES_COUNT} Active Studios`, icon: CheckCircle2 },
              { label: 'Reporting', value: 'SARIF, PDF & Merkle ZKP', icon: CheckCircle2 },
              { label: 'Verification', value: '5-LLM Consensus & AST PRs', icon: CheckCircle2 }
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between border-b border-emerald-500/10 pb-4">
                <span className="text-sm text-zinc-400">{item.label}</span>
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <item.icon className="w-4 h-4 text-emerald-500" />
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail('');
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-24 text-center">
      <div className="glass p-12 md:p-20 rounded-[3rem] border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent -z-10" />
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-8">
          <FileText className="w-3 h-3" />
          Security Research
        </div>
        <h2 className="text-3xl md:text-5xl font-bold mb-6">Get the latest <span className="text-emerald-400">vulnerability</span> reports.</h2>
        <p className="text-zinc-500 mb-10 max-w-lg mx-auto">
          Receive weekly CISA KEV advisories, post-quantum migration notes, and zero-day research straight from SageAI Core v{PLATFORM_VERSION}.
        </p>
        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="hacker@startup.io"
            className="flex-grow bg-zinc-950 border border-white/10 rounded-full px-6 py-4 text-white focus:border-emerald-500/50 focus:ring-0 transition-all outline-none"
          />
          <button
            type="submit"
            className="px-8 py-4 bg-emerald-500 text-black rounded-full font-bold hover:bg-emerald-400 transition-all"
          >
            Subscribe
          </button>
        </form>
        {subscribed && (
          <p className="mt-4 text-xs font-mono text-emerald-400">
            [+] Subscribed — weekly CISA KEV &amp; zero-day digest queued.
          </p>
        )}
      </div>
    </div>
  );
};

const SystemStatusBar = () => {
  return (
    <div className="bg-emerald-500/10 border-b border-emerald-500/20 py-2 px-6 overflow-hidden">
      <div className="flex items-center gap-8 animate-marquee whitespace-nowrap">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 text-[10px] font-mono text-emerald-400 uppercase tracking-widest">
            <span className="flex items-center gap-1"><div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" /> SAGEAI_CORE: v{PLATFORM_VERSION} ({PLATFORM_WAVES_RANGE})</span>
            <span className="text-zinc-600">|</span>
            <span>CAPABILITIES: {PLATFORM_CAPABILITIES_COUNT}</span>
            <span className="text-zinc-600">|</span>
            <span>COMMAND_STUDIOS: {PLATFORM_DASHBOARD_MODULES_COUNT}</span>
            <span className="text-zinc-600">|</span>
            <span>CISA_KEV: 1,780_CVES</span>
            <span className="text-zinc-600">|</span>
            <span>PQC: FIPS_203/204_ACTIVE</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const InteractiveTerminal = () => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([
    `[+] SageAI v${PLATFORM_VERSION} (${PLATFORM_MILESTONE} · ${PLATFORM_WAVES_RANGE}) initialized.`,
    `[+] ${PLATFORM_CAPABILITIES_COUNT} Capabilities | ${PLATFORM_DASHBOARD_MODULES_COUNT} Command Studios | 10-Pillar Sovereign Defense Grid online.`,
    '[+] Type "help" for commands: scan, waves, pillars, pqc, status, clear, whoami.'
  ]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.toLowerCase().trim();
    let response = '';

    if (cmd === 'scan') {
      response = '[!] Dispatching THE ABYSS (9 OSINT modules) + 5-LLM Consensus sweep... [!] Found: 1 IMDSv2 SSRF, 1 HNDL TLS key, 2 CISA KEV matches -> SagePatch PR ready.';
    } else if (cmd === 'waves') {
      response = `[+] ${PLATFORM_WAVES_RANGE} Active: Caps 1-${PLATFORM_CAPABILITIES_COUNT} including Amplituhedron (Cap 110), Twistor Holonomy (Cap 111), Causal Set Poset (Cap 112), and Schwinger Vacuum Harvester.`;
    } else if (cmd === 'pillars') {
      response = '[+] 10/10 Defense Pillars nominal: RevEng | Deception | WAF | NIDS/C2 | CISA KEV | UEBA | SOAR | AI Red-Team | Cyber Range | Merkle Audit Chain.';
    } else if (cmd === 'pqc') {
      response = '[+] NIST FIPS 203 (ML-KEM-768) + FIPS 204 (ML-DSA-65) hybrid PQC active across US, EU & APAC Zero-Egress Enclaves.';
    } else if (cmd === 'help') {
      response = 'Available commands: scan, waves, pillars, pqc, status, clear, help, whoami';
    } else if (cmd === 'status') {
      response = `[+] All systems nominal (v${PLATFORM_VERSION}). 5-LLM Consensus Council & ${PLATFORM_DASHBOARD_MODULES_COUNT} UI Studios ready.`;
    } else if (cmd === 'clear') {
      setHistory([]);
      setInput('');
      return;
    } else if (cmd === 'whoami') {
      response = 'Authorized Security Researcher - Session ID: ' + Math.random().toString(36).substring(7);
    } else {
      response = `[-] Command not found: ${cmd}`;
    }

    setHistory(prev => [...prev, `> ${input}`, response]);
    setInput('');
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-24">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold mb-4">Try the <span className="text-emerald-400">Terminal</span></h2>
        <p className="text-zinc-500">Interact with the SageAI core engine directly.</p>
      </div>

      <div className="glass rounded-2xl border-white/5 overflow-hidden shadow-2xl">
        <div className="bg-zinc-900/50 px-4 py-2 flex items-center justify-between border-b border-white/5">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/40" />
          </div>
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">sage_ai_terminal.sh</div>
          <TerminalIcon className="w-3 h-3 text-zinc-500" />
        </div>
        <div className="p-6 h-[400px] overflow-y-auto font-mono text-sm space-y-2 bg-black/60 scrollbar-hide">
          {history.map((line, i) => (
            <div key={i} className={`${line.startsWith('>') ? 'text-zinc-400' : line.startsWith('[-]') ? 'text-red-400' : 'text-emerald-400'}`}>
              {line}
            </div>
          ))}
          <form onSubmit={handleCommand} className="flex items-center gap-2">
            <span className="text-emerald-500">$</span>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-grow bg-transparent border-none outline-none text-emerald-400 placeholder:text-emerald-900/30"
              placeholder="type a command..."
              autoFocus
            />
          </form>
        </div>
      </div>
    </div>
  );
};

const Integrations = () => {
  const tools = [
    { name: 'GitHub', icon: Github },
    { name: 'Slack', icon: MessageSquare },
    { name: 'Jira', icon: FileText },
    { name: 'AWS', icon: Cloud },
    { name: 'Docker', icon: Box },
    { name: 'Kubernetes', icon: Layers }
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-24">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold mb-4">Seamless <span className="text-emerald-400">Integrations</span></h2>
        <p className="text-zinc-500">SageAI fits perfectly into your existing security stack.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
        {tools.map((tool) => (
          <div key={tool.name} className="glass p-8 rounded-2xl border-white/5 flex flex-col items-center justify-center group hover:border-emerald-500/30 transition-all">
            <tool.icon className="w-8 h-8 text-zinc-600 group-hover:text-emerald-400 transition-all mb-4" />
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest group-hover:text-white transition-colors">{tool.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const SecurityScore = () => {
  const [score, setScore] = useState(45);
  
  return (
    <div className="max-w-4xl mx-auto px-6 py-24">
      <div className="glass p-12 rounded-[3rem] border-white/5 grid md:grid-cols-2 gap-12 items-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
        
        <div className="space-y-8">
          <h2 className="text-3xl font-bold">Check Your <br /> <span className="text-emerald-400">Security Posture</span></h2>
          <div className="space-y-6">
            {[
              { label: 'CI/CD Scanning', weight: 15 },
              { label: 'Cloud Config Audit', weight: 20 },
              { label: 'External Attack Surface', weight: 20 }
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-4">
                <button 
                  onClick={() => setScore(prev => Math.min(100, prev + item.weight))}
                  className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center hover:bg-emerald-500 hover:text-black transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <span className="text-sm text-zinc-400 font-mono uppercase tracking-widest">{item.label}</span>
              </div>
            ))}
          </div>
          <button 
            onClick={() => setScore(45)}
            className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest hover:text-white transition-colors"
          >
            Reset Assessment
          </button>
        </div>

        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="relative w-48 h-48">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="8"
                className="text-zinc-900"
              />
              <motion.circle
                cx="96"
                cy="96"
                r="88"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray={552.92}
                animate={{ strokeDashoffset: 552.92 - (552.92 * score) / 100 }}
                className="text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-bold tracking-tighter">{score}</span>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Score</span>
            </div>
          </div>
          <div className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
            score > 80 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
            score > 60 ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
            'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}>
            {score > 80 ? 'SECURE' : score > 60 ? 'MODERATE' : 'CRITICAL RISK'}
          </div>
        </div>
      </div>
    </div>
  );
};

const HackerNews = () => {
  const news = [
    { title: 'Wave 30 Amplituhedron & Twistors Live', time: '2m ago' },
    { title: '1,780 CISA KEV CVEs Synced', time: '15m ago' },
    { title: 'FIPS 203 ML-KEM Enclaves Verified', time: '1h ago' }
  ];

  return (
    <div className="fixed top-24 right-8 z-40 hidden xl:block">
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass p-4 rounded-2xl border-emerald-500/20 space-y-4 min-w-[220px]"
      >
        <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-500 uppercase tracking-widest">
          <Zap className="w-3 h-3" />
          Live Threat Feed
        </div>
        <div className="space-y-3">
          {news.map((item, i) => (
            <div key={i} className="space-y-1">
              <div className="text-[10px] text-white font-bold leading-tight">{item.title}</div>
              <div className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest">{item.time}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

const CaseStudies = () => {
  const cases = [
    {
      company: 'FintechFlow',
      challenge: 'Manual pen-tests took 3 weeks and delayed every release cycle.',
      solution: 'Deployed 5-LLM Consensus & SagePatch AST Auto-Fix PRs across GitHub CI/CD.',
      result: '90% faster security sign-off.'
    },
    {
      company: 'HealthSecure',
      challenge: `Needed GDPR Art. 44, HIPAA & SOC 2 evidence across ${PLATFORM_DASHBOARD_MODULES_COUNT} microservices.`,
      solution: 'Enabled EU Zero-Egress Enclaves with SHA-256 Merkle & Groth16 ZK-SNARK proofs.',
      result: 'Audit-ready in 48 hours.'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-24">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold mb-4">Success <span className="text-emerald-400">Stories</span></h2>
        <p className="text-zinc-500">How SageAI is transforming security for high-growth startups.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {cases.map((c) => (
          <div key={c.company} className="glass p-8 rounded-[2rem] border-white/5 relative group overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Quote className="w-24 h-24 text-emerald-500" />
            </div>
            <div className="relative z-10">
              <div className="text-emerald-400 font-bold mb-6 text-xl tracking-tighter">{c.company}</div>
              <div className="space-y-6">
                <div>
                  <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2">The Challenge</div>
                  <p className="text-zinc-300 text-sm leading-relaxed">{c.challenge}</p>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-emerald-500/50 uppercase tracking-widest mb-2">The Solution</div>
                  <p className="text-zinc-300 text-sm leading-relaxed">{c.solution}</p>
                </div>
                <div className="pt-6 border-t border-white/5">
                  <div className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest mb-2">The Result</div>
                  <div className="text-2xl font-bold text-white">{c.result}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const VulnerabilityDatabase = () => {
  const vulns = [
    { id: 'CVE-2026-0322', title: 'PAN-OS Code Injection', severity: 'CRITICAL', description: 'Unauthenticated root code execution in perimeter firewall endpoints tracked via CISA KEV.' },
    { id: 'CVE-2026-88772', title: 'NetScaler Memory RCE', severity: 'CRITICAL', description: 'Out-of-bounds buffer flaw enabling pre-auth gateway takeover and C2 pivoting.' },
    { id: 'CVE-2026-104935', title: 'Connect Secure Bypass', severity: 'HIGH', description: 'Authentication spoofing allowing command execution across edge VPN appliances.' },
    { id: 'CVE-2026-76519', title: 'Cisco SEG Path Traversal', severity: 'HIGH', description: 'Relative path traversal enabling arbitrary file write on enterprise email gateways.' }
  ];

  return (
    <div id="vuln-db" className="max-w-6xl mx-auto px-6 py-24">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold mb-4">Vulnerability <span className="text-emerald-400">Database</span></h2>
        <p className="text-zinc-500">Live-synced across 1,780+ CISA KEV advisories &amp; 50,000+ NVD vulnerability signatures.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {vulns.map((vuln) => (
          <motion.div
            key={vuln.id}
            whileHover={{ y: -5 }}
            className="glass p-6 rounded-2xl border-white/5 hover:border-emerald-500/30 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-mono text-zinc-500">{vuln.id}</span>
                <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${
                  vuln.severity === 'CRITICAL' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                  vuln.severity === 'HIGH' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' :
                  'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                }`}>
                  {vuln.severity}
                </span>
              </div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-emerald-400 transition-colors">{vuln.title}</h3>
              <p className="text-xs text-zinc-500 leading-relaxed mb-4">{vuln.description}</p>
            </div>
            <Link
              href="/dashboard"
              className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all"
            >
              Inspect in Intel Hub <ArrowRight className="w-3 h-3" />
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const Team = () => {
  const members = [
    { name: 'Alex Rivera', role: 'Chief Security Architect', icon: Shield },
    { name: 'Sarah Chen', role: 'AI Engineering Lead', icon: Cpu },
    { name: 'Marcus Thorne', role: 'Offensive Security', icon: Target },
    { name: 'Elena Vance', role: 'Product Design', icon: Layers }
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-24">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold mb-4">The <span className="text-emerald-400">Architects</span></h2>
        <p className="text-zinc-500">Built by world-class security researchers and AI engineers.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {members.map((member) => (
          <div key={member.name} className="text-center group">
            <div className="relative mb-6 inline-block">
              <div className="w-32 h-32 rounded-3xl bg-zinc-900 border border-white/5 flex items-center justify-center group-hover:border-emerald-500/50 transition-all relative overflow-hidden">
                <member.icon className="w-12 h-12 text-zinc-700 group-hover:text-emerald-500 transition-all" />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-black opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">{member.name}</h3>
            <p className="text-xs text-zinc-500 uppercase tracking-widest">{member.role}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const RiskCalculator = () => {
  const [employees, setEmployees] = useState(50);
  const [dataSensitivity, setDataSensitivity] = useState(5); // 1-10
  
  const estimatedLoss = Math.round(employees * dataSensitivity * 1500);
  const sageAICost = 2388; // Starter annual ($199 * 12)

  return (
    <div className="max-w-4xl mx-auto px-6 py-24">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold mb-4">Calculate Your <span className="text-emerald-400">Exposure</span></h2>
        <p className="text-zinc-500">See the real cost of a data breach vs. proactive protection.</p>
      </div>

      <div className="glass p-8 md:p-12 rounded-[3rem] border-white/5 grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-12">
          <div className="space-y-4">
            <div className="flex justify-between text-sm font-mono text-zinc-400 uppercase tracking-widest">
              <span>Employee Count</span>
              <span className="text-emerald-400">{employees}</span>
            </div>
            <input 
              type="range" 
              min="10" 
              max="1000" 
              step="10"
              value={employees}
              onChange={(e) => setEmployees(parseInt(e.target.value))}
              className="w-full h-1.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between text-sm font-mono text-zinc-400 uppercase tracking-widest">
              <span>Data Sensitivity</span>
              <span className="text-emerald-400">{dataSensitivity}/10</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="10" 
              step="1"
              value={dataSensitivity}
              onChange={(e) => setDataSensitivity(parseInt(e.target.value))}
              className="w-full h-1.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
        </div>

        <div className="space-y-8 p-8 bg-black/40 rounded-3xl border border-white/5">
          <div className="space-y-2">
            <div className="text-[10px] font-mono text-red-500 uppercase tracking-widest">Potential Breach Loss</div>
            <div className="text-4xl md:text-5xl font-bold text-white tracking-tighter">
              ${estimatedLoss.toLocaleString()}
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest">SageAI Annual Protection</div>
            <div className="text-2xl font-bold text-emerald-400 tracking-tighter">
              ${sageAICost.toLocaleString()}
            </div>
          </div>
          <div className="pt-4 border-t border-white/5">
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2">ROI Potential</div>
            <div className="text-xl font-bold text-white">
              {Math.round((estimatedLoss / sageAICost) * 100)}% <span className="text-emerald-400 text-sm">Risk Reduction</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FloatingHUD = () => {
  const [stats, setStats] = useState({
    packets: 1240,
    threats: 0,
    uptime: '99.99%'
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        packets: prev.packets + Math.floor(Math.random() * 50)
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-8 left-8 z-40 hidden lg:block">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass p-4 rounded-2xl border-emerald-500/20 space-y-3 min-w-[180px]"
      >
        <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-500 uppercase tracking-widest">
          <Activity className="w-3 h-3" />
          Live Network Stats
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-mono text-zinc-500">
            <span>PACKETS_IN</span>
            <span className="text-white">{stats.packets.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-[10px] font-mono text-zinc-500">
            <span>THREATS_BLOCKED</span>
            <span className="text-emerald-400">{stats.threats}</span>
          </div>
          <div className="flex justify-between text-[10px] font-mono text-zinc-500">
            <span>CORE_UPTIME</span>
            <span className="text-white">{stats.uptime}</span>
          </div>
        </div>
        <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
          <motion.div 
            animate={{ x: [-100, 100] }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="w-1/2 h-full bg-emerald-500/50"
          />
        </div>
      </motion.div>
    </div>
  );
};

const DashboardPreview = () => {
  return (
    <div className="relative w-full max-w-6xl mx-auto py-24 px-6">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold mb-4">Actionable <span className="text-emerald-400">Intelligence</span></h2>
        <p className="text-zinc-500">Stop drowning in alerts. Get the exact evidence you need to fix vulnerabilities fast.</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative glass rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl"
      >
        {/* Dashboard Header */}
        <div className="bg-zinc-900/50 px-8 py-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/20" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
              <div className="w-3 h-3 rounded-full bg-green-500/20" />
            </div>
            <div className="h-4 w-px bg-white/10 mx-2" />
            <div className="text-xs font-mono text-zinc-500 tracking-widest uppercase">Command Center / {PLATFORM_DASHBOARD_MODULES_COUNT} Modules</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-8 grid md:grid-cols-12 gap-8">
          {/* Sidebar Mock */}
          <div className="md:col-span-3 space-y-6">
            <div className="space-y-2">
              <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-4">Active Studios</div>
              {['Defense Grid (10/10)', '5-LLM Consensus', 'Quantum Safe PQC', 'SagePatch Auto-Fix', 'Wave 30 Amplituhedron'].map((item, i) => (
                <div key={item} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${i === 1 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}>
                  {item}
                </div>
              ))}
            </div>
            <div className="pt-8 border-t border-white/5">
              <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-4">Monitored Enclaves</div>
              {['us-east-1 (FedRAMP)', 'eu-central-1 (GDPR)', 'ap-southeast-1 (PDPA)'].map((target) => (
                <div key={target} className="px-4 py-2 text-xs font-mono text-zinc-500 hover:text-emerald-400 transition-colors cursor-pointer truncate">
                  {target}
                </div>
              ))}
            </div>
          </div>

          {/* Main Content Mock */}
          <div className="md:col-span-9 space-y-8">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Critical KEV', value: '1', color: 'text-red-500' },
                { label: 'PQC Risks', value: '3', color: 'text-orange-500' },
                { label: 'AST PRs Ready', value: '12', color: 'text-emerald-400' }
              ].map((stat) => (
                <div key={stat.label} className="p-6 glass rounded-2xl border border-white/5">
                  <div className={`text-3xl font-bold mb-1 ${stat.color}`}>{stat.value}</div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="glass rounded-2xl border border-white/5 overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 bg-white/2 flex items-center justify-between">
                <div className="text-xs font-bold uppercase tracking-widest text-zinc-400">Consensus &amp; Defense Log</div>
                <div className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">LIVE v{PLATFORM_VERSION}</div>
              </div>
              <div className="divide-y divide-white/5">
                {[
                  { title: "PAN-OS CVE-2026-0322 Mitigated (Virtual WAF)", severity: "CRITICAL", target: "gateway.prod", time: "2m ago" },
                  { title: "HNDL TLS RSA-2048 -> ML-KEM-768 Migration", severity: "HIGH", target: "ingress-mesh", time: "12m ago" },
                  { title: "AWS_SECRET_KEY Scrubbed in EU Enclave", severity: "HIGH", target: "eu-central-1", time: "41m ago" },
                  { title: "SagePatch AST PR #142 Merged (SQLi Fix)", severity: "MEDIUM", target: "api/auth.py", time: "2h ago" }
                ].map((vuln, i) => (
                  <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-white/2 transition-colors group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <motion.div 
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
                        className={`w-2 h-2 rounded-full ${vuln.severity === 'CRITICAL' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : vuln.severity === 'HIGH' ? 'bg-orange-500' : 'bg-yellow-500'}`} 
                      />
                      <div>
                        <div className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">{vuln.title}</div>
                        <div className="text-[10px] text-zinc-500 font-mono">{vuln.target}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-[10px] font-bold mb-1 ${vuln.severity === 'CRITICAL' ? 'text-red-500' : 'text-zinc-500'}`}>{vuln.severity}</div>
                      <div className="text-[10px] text-zinc-600 font-mono">{vuln.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Glow */}
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full" />
      </motion.div>
    </div>
  );
};

const SystemAnatomy = () => {
  return (
    <div className="relative w-full max-w-5xl mx-auto py-24 px-6">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold mb-4">System <span className="text-emerald-400">Anatomy</span></h2>
        <p className="text-zinc-500">Hover over the core components to see our autonomous engine in action.</p>
      </div>
      
      <div className="relative aspect-video glass rounded-[2rem] border-white/5 overflow-hidden flex items-center justify-center bg-zinc-950/50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_70%)]" />
        
        {/* Animated Data Beams (SVG) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          {/* Path from Ingress to Core */}
          <motion.path
            d="M 250 250 L 400 250"
            stroke="url(#beam-gradient)"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          />
          {/* Path from Core to Database */}
          <motion.path
            d="M 600 250 L 750 250"
            stroke="url(#beam-gradient)"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 2, delay: 1, ease: "linear" }}
          />
          <defs>
            <linearGradient id="beam-gradient" x1="0" y1="0" x2="100" y2="0">
              <stop offset="0" stopColor="transparent" />
              <stop offset="50" stopColor="#10b981" />
              <stop offset="100" stopColor="transparent" />
            </linearGradient>
          </defs>
        </svg>

        {/* Mock Architecture Diagram */}
        <div className="relative z-10 grid grid-cols-3 gap-12 md:gap-32 items-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 glass rounded-2xl flex items-center justify-center border-emerald-500/20 relative">
              <div className="absolute inset-0 bg-emerald-500/5 animate-pulse rounded-2xl" />
              <Globe className="w-10 h-10 text-emerald-400 relative z-10" />
            </div>
            <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Ingress</div>
          </div>
          
          <div className="relative">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
              className="w-40 h-40 border-2 border-dashed border-emerald-500/20 rounded-full flex items-center justify-center"
            >
              <div className="w-32 h-32 border border-emerald-500/40 rounded-full flex items-center justify-center bg-emerald-500/5">
                <Cpu className="w-12 h-12 text-emerald-400 animate-pulse" />
              </div>
            </motion.div>
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-mono text-zinc-500 uppercase tracking-widest whitespace-nowrap">Core Engine</div>
          </div>
          
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 glass rounded-2xl flex items-center justify-center border-emerald-500/20 relative">
              <div className="absolute inset-0 bg-emerald-500/5 animate-pulse rounded-2xl" />
              <Database className="w-10 h-10 text-emerald-400 relative z-10" />
            </div>
            <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Storage</div>
          </div>
        </div>
        
        {/* Pointers */}
        <Pointer x="25%" y="40%" label="THE ABYSS + eBPF Ingress" description="Runs 9 OSINT engines + ring-0 eBPF syscall monitoring & Deception canaries." />
        <Pointer x="50%" y="30%" label="5-LLM Consensus Council" description="GPT-4o, Claude 3.7, DeepSeek R1, Nemotron 70B & Gemini 2.5 debate exploit chains." />
        <Pointer x="75%" y="45%" label="CISA KEV + PQC Enclave" description="1,780+ live KEVs sealed inside NIST FIPS 203/204 Zero-Egress Enclaves." />
        <Pointer x="50%" y="70%" label="SagePatch AST & Merkle" description="Sandboxed AST verification opens human-gated PRs with SHA-256 Merkle proofs." />
      </div>
    </div>
  );
};

const BentoGrid = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 max-w-7xl mx-auto px-6 py-24">
      {/* Large Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="md:col-span-8 bento-card p-10 flex flex-col justify-between group"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] -z-10 group-hover:bg-emerald-500/10 transition-all" />
        <div>
          <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6">
            <Target className="w-6 h-6 text-emerald-400" />
          </div>
          <h3 className="text-3xl font-bold mb-4 glitch">10-Pillar Sovereign Defense Grid &amp; OSINT Hub</h3>
          <p className="text-zinc-400 max-w-xl leading-relaxed">
            Unites continuous EASM &amp; THE ABYSS (9 OSINT engines) with Reverse Engineering, Deception Canaries, Inline WAF, NIDS/C2 Beacons, UEBA &amp; SOAR containment.
          </p>
        </div>
        <div className="mt-12 flex items-center gap-4">
          <div className="flex -space-x-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-zinc-800 flex items-center justify-center text-[10px] font-bold">
                {i === 4 ? `+${PLATFORM_CAPABILITIES_COUNT}` : <div className="w-full h-full rounded-full bg-emerald-500/20" />}
              </div>
            ))}
          </div>
          <div className="text-xs text-zinc-500 font-mono">
            {PLATFORM_DASHBOARD_MODULES_COUNT} Command Center studios &bull; {PLATFORM_CAPABILITIES_COUNT} Capabilities ({PLATFORM_WAVES_RANGE})
          </div>
        </div>
      </motion.div>

      {/* Small Card 1 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="md:col-span-4 bento-card p-10 group"
      >
        <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6">
          <Layers className="w-6 h-6 text-emerald-400" />
        </div>
        <h3 className="text-xl font-bold mb-3 glitch">5-LLM Consensus &amp; SagePatch PRs</h3>
        <p className="text-zinc-400 text-sm leading-relaxed">
          Multi-AI debate across GPT-4o, Claude 3.7, DeepSeek R1, Nemotron 70B &amp; Gemini 2.5 Pro with sandboxed AST GitHub PRs.
        </p>
        <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
          <span className="text-xs font-mono text-zinc-500">v{PLATFORM_VERSION} ({PLATFORM_WAVES_RANGE})</span>
          <ArrowUpRight className="w-4 h-4 text-emerald-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
        </div>
      </motion.div>

      {/* Small Card 2 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="md:col-span-4 bento-card p-10 group"
      >
        <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6">
          <Lock className="w-6 h-6 text-emerald-400" />
        </div>
        <h3 className="text-xl font-bold mb-3 glitch">PQC FIPS 203/204 &amp; Zero-Egress</h3>
        <p className="text-zinc-400 text-sm leading-relaxed">
          ML-KEM-768 + ML-DSA-65 post-quantum envelopes enforced across US, EU &amp; APAC enclaves with real-time secret scrubbing.
        </p>
      </motion.div>

      {/* Medium Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="md:col-span-8 bento-card p-10 flex flex-col md:flex-row gap-10 items-center group"
      >
        <div className="flex-1">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6">
            <FileText className="w-6 h-6 text-emerald-400" />
          </div>
          <h3 className="text-2xl font-bold mb-4 glitch">Merkle &amp; Groth16 zk-SNARK Compliance</h3>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Immutable SHA-256 hash chains and verifiable zero-knowledge proofs mapping SARIF/VEX findings to SOC 2 Type II, ISO/IEC 27001:2022, FedRAMP High, HIPAA, GDPR &amp; CNSA 2.0.
          </p>
        </div>
        <div className="w-full md:w-64 aspect-square glass rounded-2xl border-emerald-500/10 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-emerald-500/5 animate-pulse" />
          <FileText className="w-20 h-20 text-emerald-500/20" />
          <div className="absolute bottom-4 left-4 right-4 h-2 bg-emerald-500/20 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: ["0%", "85%", "85%"] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="h-full bg-emerald-500"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const Navbar = () => {
  const [threatLevel, setThreatLevel] = useState('ELEVATED');
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const levels = ['LOW', 'ELEVATED', 'HIGH', 'CRITICAL'];
      setThreatLevel(levels[Math.floor(Math.random() * levels.length)]);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const searchResults = [
    { id: 'CVE-2026-0322', title: 'PAN-OS Code Injection (CISA KEV)' },
    { id: 'CVE-2026-88772', title: 'Citrix NetScaler Buffer RCE' },
    { id: 'CVE-2026-104935', title: 'Ivanti Connect Secure Bypass' },
    { id: 'HNDL-PQC-2030', title: 'NIST FIPS 203/204 Readiness' }
  ].filter(res => res.title.toLowerCase().includes(searchQuery.toLowerCase()) || res.id.toLowerCase().includes(searchQuery.toLowerCase()));

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-black/80 backdrop-blur-md border-b border-white/10 py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.5)]">
            <Shield className="text-black w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tighter">SAGE<span className="text-emerald-400">AI</span></span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500 group-focus-within:text-emerald-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Search Vulnerabilities..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              className="bg-zinc-900/50 border border-white/5 rounded-full pl-8 pr-4 py-1.5 text-[10px] font-mono focus:border-emerald-500/50 outline-none transition-all w-48 focus:w-64"
            />
            <AnimatePresence>
              {isSearchFocused && searchQuery && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-2 glass rounded-xl border border-white/10 overflow-hidden shadow-2xl"
                >
                  {searchResults.length > 0 ? (
                    searchResults.map((res) => (
                      <a
                        key={res.id}
                        href="#vuln-db"
                        className="block px-4 py-3 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-none"
                      >
                        <div className="text-[10px] text-emerald-400 font-mono mb-1">{res.id}</div>
                        <div className="text-xs text-white font-bold">{res.title}</div>
                      </a>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-[10px] text-zinc-500 font-mono">No results found.</div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-md border text-[10px] font-mono transition-all duration-500 ${
            threatLevel === 'LOW' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
            threatLevel === 'ELEVATED' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500 animate-pulse' :
            threatLevel === 'HIGH' ? 'bg-orange-500/10 border-orange-500/20 text-orange-500 animate-pulse' :
            'bg-red-500/10 border-red-500/20 text-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.3)]'
          }`}>
            <AlertTriangle className="w-3 h-3" />
            GLOBAL RISK: {threatLevel}
          </div>
          <Link href="/features" className="hover:text-emerald-400 transition-colors">Features</Link>
          <Link href="/how-it-works" className="hover:text-emerald-400 transition-colors">How it Works</Link>
          <Link href="/pricing" className="hover:text-emerald-400 transition-colors">Pricing</Link>
          <Link href="/login" className="hover:text-emerald-400 transition-colors">Sign In</Link>
          <Link href="/login" className="px-5 py-2 bg-white text-black rounded-full hover:bg-emerald-400 transition-all font-semibold">
            Get Started
          </Link>
        </div>

        <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-zinc-950 border-b border-white/10 p-6 flex flex-col gap-4 md:hidden"
          >
            <Link href="/features" onClick={() => setMobileMenuOpen(false)} className="text-zinc-400 hover:text-emerald-400 transition-colors">Features</Link>
            <Link href="/how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-zinc-400 hover:text-emerald-400 transition-colors">How it Works</Link>
            <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className="text-zinc-400 hover:text-emerald-400 transition-colors">Pricing</Link>
            <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-zinc-400 hover:text-emerald-400 transition-colors">Sign In</Link>
            <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full px-5 py-3 bg-emerald-500 text-black rounded-lg font-semibold text-center">
              Get Started
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

interface TypewriterLineProps {
  text: string;
  onComplete: () => void;
  key?: any;
}

const TypewriterLine = ({ text, onComplete }: TypewriterLineProps) => {
  const [displayText, setDisplayText] = useState('');
  
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayText(prev => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(timer);
        onComplete();
      }
    }, 30);
    return () => clearInterval(timer);
  }, [text, onComplete]);

  return (
    <div className={`mb-1 ${text.includes('[!]') ? 'text-emerald-400' : 'text-zinc-400'}`}>
      <span className="text-emerald-500/50 mr-2">$</span>
      {displayText}
    </div>
  );
};

const SAGE_LOG_LINES = [
  `[+] Initializing SageAI v${PLATFORM_VERSION} Core (${PLATFORM_WAVES_RANGE})...`,
  "[+] Target: staging.startup-app.io",
  "[+] Launching THE ABYSS 9 OSINT modules + CISA KEV (1,780 CVEs)...",
  "[+] eBPF Kernel SIEM: ring-0 syscall hooks attached (<0.2% CPU)",
  "[!] Port 8080 open + PAN-OS CVE-2026-0322 perimeter mismatch",
  "[+] Convening 5-LLM Consensus (GPT-4o / Claude 3.7 / DeepSeek R1 / Nemotron 70B / Gemini 2.5)...",
  "[+] Auditing TLS & KMS for HNDL Quantum Risk (FIPS 203 ML-KEM-768)...",
  "[!] CRITICAL: AWS_SECRET_KEY scrubbed inside Zero-Egress Enclave",
  "[+] Validating SagePatch Phase 04 AST remediation PR #142...",
  `[+] SHA-256 Merkle Seal anchored. ${PLATFORM_DASHBOARD_MODULES_COUNT} Studios nominal.`
];

const Terminal = () => {
  const [activeLines, setActiveLines] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleLineComplete = () => {
    if (currentIndex < SAGE_LOG_LINES.length - 1) {
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setActiveLines(prev => [...prev, SAGE_LOG_LINES[currentIndex]]);
      }, 400);
    }
  };

  useEffect(() => {
    setActiveLines([SAGE_LOG_LINES[0]]);
  }, []);

  return (
    <div className="w-full max-w-2xl glass rounded-xl overflow-hidden border border-emerald-500/20 shadow-2xl">
      <div className="bg-zinc-900/50 px-4 py-2 flex items-center gap-2 border-b border-white/5">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/50" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
          <div className="w-3 h-3 rounded-full bg-green-500/50" />
        </div>
        <div className="flex items-center gap-2 ml-4">
          <TerminalIcon className="w-3 h-3 text-zinc-500" />
          <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">sage-scanner-v{PLATFORM_VERSION}</span>
        </div>
      </div>
      <div className="p-6 font-mono text-sm h-64 overflow-y-auto scrollbar-hide">
        {activeLines.map((line, idx) => (
          idx === activeLines.length - 1 ? (
            <TypewriterLine key={idx} text={line} onComplete={handleLineComplete} />
          ) : (
            <div key={idx} className={`mb-1 ${line.includes('[!]') ? 'text-emerald-400' : 'text-zinc-400'}`}>
              <span className="text-emerald-500/50 mr-2">$</span>
              {line}
            </div>
          )
        ))}
        {currentIndex === SAGE_LOG_LINES.length - 1 && activeLines.length === SAGE_LOG_LINES.length && (
           <div className="text-zinc-400">
             <span className="text-emerald-500/50 mr-2">$</span>
             <motion.div 
               animate={{ opacity: [1, 0] }}
               transition={{ repeat: Infinity, duration: 0.8 }}
               className="inline-block w-2 h-4 bg-emerald-500 translate-y-0.5"
             />
           </div>
        )}
      </div>
    </div>
  );
};

const Radar = () => {
  const [riskScore, setRiskScore] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      const interval = setInterval(() => {
        setRiskScore(prev => {
          if (prev < 92) return prev + 1;
          return 92;
        });
      }, 30);
      return () => clearInterval(interval);
    }
  }, [isInView]);

  return (
    <div ref={ref} className="relative w-full max-w-4xl mx-auto py-20">
      <div className="absolute inset-0 bg-emerald-500/5 blur-[120px] rounded-full" />
      
      <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
        <div className="flex justify-center">
          <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full border border-emerald-500/20 flex items-center justify-center">
            {/* SVG Gauge Fill */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <motion.circle
                cx="50"
                cy="50"
                r="48"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="100 100"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={isInView ? { pathLength: riskScore / 100, opacity: 0.5 } : {}}
                transition={{ duration: 0.5, ease: "linear" }}
                className="text-emerald-500"
              />
            </svg>

            {/* Radar Rings */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={isInView ? { scale: 1, opacity: 1 } : {}}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute inset-4 rounded-full border border-emerald-500/10" 
            />
            <motion.div 
              initial={{ scale: 0.6, opacity: 0 }}
              animate={isInView ? { scale: 1, opacity: 1 } : {}}
              transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
              className="absolute inset-12 rounded-full border border-emerald-500/10" 
            />
            <motion.div 
              initial={{ scale: 0.4, opacity: 0 }}
              animate={isInView ? { scale: 1, opacity: 1 } : {}}
              transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
              className="absolute inset-24 rounded-full border border-emerald-500/10" 
            />
            
            {/* Radar Line */}
            <div className="absolute inset-0 animate-scan origin-center">
              <div className="w-1/2 h-full bg-gradient-to-r from-emerald-500/20 to-transparent" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 50%)' }} />
            </div>

            {/* Blips */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: [0, 1, 0] } : {}}
              transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
              className="absolute top-1/4 right-1/3 w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_10px_#10b981]"
            />
            <motion.div 
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: [0, 1, 0] } : {}}
              transition={{ repeat: Infinity, duration: 2, delay: 1.2 }}
              className="absolute bottom-1/3 left-1/4 w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_10px_#10b981]"
            />

            <div className="text-center">
              <motion.span 
                className={`text-6xl md:text-7xl font-bold block transition-colors duration-500 ${riskScore >= 90 ? 'text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]' : 'text-emerald-400'}`}
              >
                {riskScore}
              </motion.span>
              <span className={`text-xs uppercase tracking-[0.2em] font-semibold transition-colors duration-500 ${riskScore >= 90 ? 'text-red-500' : 'text-zinc-500'}`}>
                {riskScore >= 90 ? 'Critical Risk' : 'Risk Score'}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Activity className="w-3 h-3" />
            Live Analysis
          </div>
          <h2 className="text-3xl md:text-4xl font-bold leading-tight">
            Real-time <span className="text-emerald-400">Threat Intelligence</span>
          </h2>
          <p className="text-zinc-400 text-lg">
            Our agents don't just scan; they think. SageAI simulates complex multi-step attacks to uncover vulnerabilities that traditional scanners miss.
          </p>
          
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="p-4 glass rounded-xl border-emerald-500/10">
              <div className="text-2xl font-bold text-white mb-1">1.2ms</div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider">Latency</div>
            </div>
            <div className="p-4 glass rounded-xl border-emerald-500/10">
              <div className="text-2xl font-bold text-white mb-1">99.9%</div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider">Accuracy</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, description, delay }: { icon: any, title: string, description: string, delay: number }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay }}
    whileHover={{ 
      y: -8, 
      borderColor: 'rgba(16, 185, 129, 0.5)',
      boxShadow: '0 0 30px rgba(16, 185, 129, 0.15)'
    }}
    className="p-8 glass rounded-2xl border border-white/5 transition-all duration-300 group relative overflow-hidden"
  >
    {/* Subtle gradient glow on hover */}
    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    
    <div className="relative z-10">
      <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition-colors duration-300">
        <Icon className="w-6 h-6 text-emerald-400" />
      </div>
      <h3 className="text-xl font-bold mb-3 text-white group-hover:text-emerald-400 transition-colors duration-300">{title}</h3>
      <p className="text-zinc-400 text-sm leading-relaxed">
        {description}
      </p>
    </div>
  </motion.div>
);

const PricingCard = ({
  tier,
  price,
  features,
  highlighted = false,
  href = "/pricing",
  ctaLabel,
}: {
  tier: string;
  price: string;
  features: string[];
  highlighted?: boolean;
  href?: string;
  ctaLabel?: string;
}) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className={`p-8 rounded-3xl border ${highlighted ? 'bg-zinc-900 border-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.1)]' : 'bg-zinc-950 border-white/5'} flex flex-col`}
  >
    <div className="mb-8">
      <h3 className={`text-sm font-bold uppercase tracking-widest mb-2 ${highlighted ? 'text-emerald-400' : 'text-zinc-500'}`}>{tier}</h3>
      <div className="flex items-baseline gap-1">
        <span className="text-4xl font-bold text-white">{price}</span>
        {price !== 'Free' && <span className="text-zinc-500 text-sm">/mo</span>}
      </div>
    </div>

    <div className="space-y-4 mb-10 flex-grow">
      {features.map((f, i) => (
        <div key={i} className="flex items-center gap-3 text-sm text-zinc-400">
          <CheckCircle2 className={`w-4 h-4 shrink-0 ${highlighted ? 'text-emerald-400' : 'text-zinc-600'}`} />
          {f}
        </div>
      ))}
    </div>

    <Link
      href={href}
      className={`w-full py-4 rounded-xl font-bold transition-all text-center ${highlighted ? 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-white/5 text-white hover:bg-white/10'}`}
    >
      {ctaLabel || (highlighted ? 'Upgrade to Pro' : `Select ${tier}`)}
    </Link>
  </motion.div>
);

const LandingPage = () => {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  return (
    <>
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <ScanlineEffect />
        <CyberBackground />
        {/* Background Grid with Parallax */}
        <motion.div 
          style={{ y: useTransform(scrollYProgress, [0, 1], [0, 200]) }}
          className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" 
        />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div 
            style={{ opacity, scale }}
            className="flex flex-col items-center text-center space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest"
            >
              <Zap className="w-3 h-3 fill-current" />
              SageAI v{PLATFORM_VERSION} &bull; {PLATFORM_WAVES_RANGE} &bull; {PLATFORM_CAPABILITIES_COUNT} Capabilities
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-8xl font-bold tracking-tight max-w-4xl leading-[1.1]"
            >
              The AI Hacker <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600 glitch">That Never Sleeps.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-zinc-400 text-lg md:text-xl max-w-2xl leading-relaxed"
            >
              Sovereign cybersecurity engineered with our 10-Pillar Defense Grid, 5-LLM Consensus, NIST FIPS 203/204 Post-Quantum Enclaves, and SagePatch AST Auto-Fix across {PLATFORM_DASHBOARD_MODULES_COUNT} active Command Center studios.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="w-full max-w-xl pt-8"
            >
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-emerald-500/0 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                <div className="relative flex items-center bg-zinc-950 border border-white/10 rounded-full p-1 pl-6 focus-within:border-emerald-500/50 transition-all">
                  <Search className="w-5 h-5 text-zinc-500" />
                  <input 
                    type="text" 
                    placeholder="Enter your domain (e.g. startup.io)" 
                    className="bg-transparent border-none focus:ring-0 text-white placeholder-zinc-600 flex-grow px-4 py-3 text-sm font-mono"
                  />
                  <Link href="/login"
                    className="px-6 py-3 bg-emerald-500 text-black rounded-full font-bold text-sm hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                  >
                    Start Free Scan
                  </Link>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-center gap-6 text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex-wrap">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  {PLATFORM_CAPABILITIES_COUNT} Sovereign Capabilities
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  SOC 2 &bull; ISO 27001 &bull; FedRAMP
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  PQC FIPS 203/204 Ready
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="pt-20 w-full flex justify-center"
            >
              <Terminal />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Logo Cloud */}
      <section className="py-12 border-y border-white/5 bg-zinc-950/50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-zinc-500 text-xs font-bold uppercase tracking-[0.3em] mb-10">Trusted by security-first engineering teams</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
            {['Cyberdyne', 'Stark Industries', 'Wayne Corp', 'Oscorp', 'Umbrella', 'Aperture'].map((logo) => (
              <div key={logo} className="text-xl md:text-2xl font-black tracking-tighter text-white hover:text-emerald-400 transition-colors cursor-default">
                {logo.toUpperCase()}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bento Grid Section */}
      <section id="features" className="py-24 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-emerald-500/5 blur-[150px] -z-10" />
        <div className="max-w-7xl mx-auto px-6 text-center mb-16">
          <h2 className="text-3xl md:text-6xl font-bold mb-6 tracking-tight">Everything you need <br /> to <span className="text-emerald-400">stay secure.</span></h2>
          <p className="text-zinc-500 max-w-2xl mx-auto">
            A complete security suite powered by autonomous agents that map, test, and verify your infrastructure 24/7.
          </p>
        </div>
        <BentoGrid />
      </section>

      {/* Sovereign Defense Grid & Waves 1-30 Showcase */}
      <SovereignArchitectureShowcase />

      {/* System Anatomy Section */}
      <section className="py-24 bg-zinc-950/30 border-y border-white/5">
        <SystemAnatomy />
      </section>

      {/* Dashboard Preview Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 blur-[150px] -z-10" />
        <DashboardPreview />
      </section>

      {/* Comparison Section */}
      <section className="py-24 bg-zinc-950/30 border-y border-white/5">
        <Comparison />
      </section>

      {/* Global Threat Map Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Global <span className="text-emerald-400">Threat Neutralization</span></h2>
            <p className="text-zinc-500 max-w-2xl mx-auto">
              Our autonomous agents are active across 50+ regions, identifying and neutralizing threats in real-time.
            </p>
          </div>
          <AttackMap />
        </div>
      </section>

      {/* Radar Section */}
      <section id="how-it-works" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <Radar />
        </div>
      </section>

      {/* Interactive Terminal Section */}
      <section className="py-24 bg-zinc-950/50 border-y border-white/5">
        <InteractiveTerminal />
      </section>

      {/* Integrations Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent -z-10" />
        <Integrations />
      </section>

      {/* Security Score Section */}
      <section className="py-24 relative overflow-hidden">
        <SecurityScore />
      </section>

      {/* Case Studies Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] -z-10" />
        <CaseStudies />
      </section>

      {/* Vulnerability Database Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 blur-[180px] -z-10" />
        <VulnerabilityDatabase />
      </section>

      {/* Team Section */}
      <section className="py-24 bg-zinc-950/30 border-y border-white/5">
        <Team />
      </section>

      {/* Risk Calculator Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/5 blur-[150px] -z-10" />
        <RiskCalculator />
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] -z-10" />
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Simple, <span className="text-emerald-400">Transparent</span> Pricing</h2>
            <p className="text-zinc-500 max-w-2xl mx-auto">
              Start with a free evaluation scan on sign-up, then scale cleanly across Starter, Pro, and full Enterprise Sovereign Defense Grid clusters.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <PricingCard
              tier="Starter"
              price="$199"
              href="/pricing"
              ctaLabel="Get Starter"
              features={[
                "20 Autonomous Scans / month",
                "Up to 5 Users",
                "CISA KEV & NVD Vulnerability Feed",
                "PDF & SARIF Exports"
              ]}
            />
            <PricingCard
              tier="Pro"
              price="$499"
              highlighted
              href="/pricing"
              ctaLabel="Upgrade to Pro"
              features={[
                "100 Autonomous Scans / month",
                "Up to 15 Users & RBAC",
                "THE ABYSS 9-Module Deep Search",
                "5-LLM Consensus & SagePatch AST PRs",
                "Continuous ASM & Slack/Jira Alerts"
              ]}
            />
            <PricingCard
              tier="Enterprise"
              price="$2,000"
              href="/pricing"
              ctaLabel="Deploy Sovereign Grid"
              features={[
                "Unlimited Scans & Unlimited Users",
                `All ${PLATFORM_DASHBOARD_MODULES_COUNT} Studios (${PLATFORM_WAVES_RANGE})`,
                "10-Pillar Sovereign Defense Grid & SOAR",
                "Zero-Egress Enclaves & PQC FIPS 203/204",
                "SAML 2.0 SSO, Merkle Ledger & Dedicated SLA"
              ]}
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Loved by <span className="text-emerald-400">Security Engineers</span></h2>
            <p className="text-zinc-500 max-w-2xl mx-auto">
              Join hundreds of teams who have automated their security posture with SageAI.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Chen",
                role: "CTO at StealthHealth",
                content: "SageAI found a critical S3 bucket misconfiguration in 10 minutes that our previous manual audit missed entirely. It's a game changer.",
                avatar: "SC"
              },
              {
                name: "Marcus Thorne",
                role: "Head of Security at FinFlow",
                content: "The LLM reasoning engine is what sets this apart. It doesn't just give you a list of CVEs; it actually explains how someone would exploit them.",
                avatar: "MT"
              },
              {
                name: "Elena Rodriguez",
                role: "Lead Engineer at CloudScale",
                content: "Integrating SageAI into our CI/CD pipeline was seamless. Now we scan every PR, ensuring no new vulnerabilities reach production.",
                avatar: "ER"
              }
            ].map((t, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 glass rounded-3xl border border-white/5 relative group"
              >
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Shield className="w-12 h-12 text-emerald-500" />
                </div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-white">{t.name}</div>
                    <div className="text-xs text-zinc-500">{t.role}</div>
                  </div>
                </div>
                <p className="text-zinc-400 italic leading-relaxed">
                  "{t.content}"
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Standards Section */}
      <section className="py-24 bg-zinc-950/50 border-y border-white/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-6">
                <ShieldCheck className="w-3 h-3" />
                Zero-Egress &amp; Post-Quantum Ready
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Security is not an <br /><span className="text-emerald-400">afterthought.</span></h2>
              <p className="text-zinc-400 text-lg mb-8">
                SageAI v{PLATFORM_VERSION} is engineered for air-gapped sovereignty, Post-Quantum Cryptography (FIPS 203/204), and continuous compliance attestation across your entire stack.
              </p>
              <div className="flex flex-wrap gap-3">
                {[
                  'SOC 2 Type II',
                  'ISO/IEC 27001:2022',
                  'FedRAMP High',
                  'CNSA 2.0 / PQC FIPS 203-204',
                  'HIPAA',
                  'GDPR Art. 44-49',
                  'PCI DSS',
                ].map((std) => (
                  <motion.div
                    key={std}
                    whileHover={{ scale: 1.05, borderColor: 'rgba(16, 185, 129, 0.5)' }}
                    className="px-4 py-2 glass rounded-lg border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest cursor-default"
                  >
                    {std}
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="relative aspect-square w-full max-w-md flex items-center justify-center">
              {/* Pulsing Security Rings */}
              <div className="absolute inset-0 flex items-center justify-center">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.1, 0, 0.1]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      delay: i * 1.3,
                      ease: "easeInOut"
                    }}
                    className="absolute w-full h-full border border-emerald-500/20 rounded-full"
                  />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-6 relative z-10">
                {[
                  { icon: Lock, title: "PQC & AES-256-GCM", desc: "ML-KEM-768 / ML-DSA-65 encryption & TLS 1.3 transport." },
                  { icon: Shield, title: "Zero-Egress Enclaves", desc: "SAML 2.0 SSO, RBAC & 0-byte outbound telemetry mode." },
                  { icon: Eye, title: "Merkle Audit Ledger", desc: "Tamper-evident cryptographic logs & SARIF/VEX bundles." },
                  { icon: Activity, title: "Autonomous SOAR", desc: `Real-time attack-path quarantine across ${PLATFORM_DASHBOARD_MODULES_COUNT} studios.` }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -5 }}
                    className="p-6 glass rounded-2xl border border-white/5"
                  >
                    <item.icon className="w-6 h-6 text-emerald-400 mb-4" />
                    <h4 className="font-bold text-white mb-2">{item.title}</h4>
                    <p className="text-zinc-500 text-[10px] leading-relaxed">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Frequently Asked <span className="text-emerald-400">Questions</span></h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Is SageAI safe to run on production?",
                a: "Yes. SageAI uses non-destructive exploit simulations, deterministic proof-of-concept checks, and configurable Safe Mode guardrails so you verify real attack paths without downtime or data loss."
              },
              {
                q: "How does the 5-LLM Multi-Model Consensus engine work?",
                a: "Findings are cross-verified across 5 independent frontier models (Claude Sonnet 4, GPT-4o, Gemini Pro, Llama-3.3-70B, and DeepSeek R1) alongside 1,780+ live CISA KEV signatures—eliminating noise and chaining complex multi-hop attack paths."
              },
              {
                q: "What are Zero-Egress Enclaves and Post-Quantum FIPS 203/204 readiness?",
                a: "Enterprise deployments run with zero external telemetry egress inside isolated enclaves while scanning TLS stacks, JWT signers, and keystores for NIST FIPS 203 (ML-KEM) & FIPS 204 (ML-DSA) readiness across our 10-Pillar Sovereign Defense Grid."
              },
              {
                q: "Can SageAI open autonomous fix PRs and integrate with my existing tools?",
                a: `Yes. SagePatch generates compiler-verified AST diffs and opens GitHub or GitLab pull requests automatically, while streaming SARIF/VEX reports, Merkle audit proofs, and SOAR alerts across Jira, Slack, Discord, and SAML 2.0 SSO across all ${PLATFORM_DASHBOARD_MODULES_COUNT} studios.`
              }
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl border border-white/5 overflow-hidden group"
              >
                <details className="group">
                  <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                    <span className="font-bold text-zinc-200 group-hover:text-emerald-400 transition-colors">{faq.q}</span>
                    <ChevronRight className="w-5 h-5 text-zinc-500 group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="px-6 pb-6 text-zinc-400 text-sm leading-relaxed border-t border-white/5 pt-4">
                    {faq.a}
                  </div>
                </details>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none overflow-hidden">
          <div className="flex justify-around h-full">
            {MATRIX_COLUMNS.map((col, i) => (
              <div
                key={i}
                className="matrix-rain text-emerald-500/30 font-mono text-[10px] whitespace-nowrap"
                style={{
                  writingMode: 'vertical-rl',
                  animationDelay: `${i * 2}s`,
                  opacity: col.opacity
                }}
              >
                {col.text}
              </div>
            ))}
          </div>
        </div>
        <div className="absolute inset-0 bg-emerald-500/10 blur-[150px] -z-10" />
        <div className="max-w-4xl mx-auto px-6 text-center glass p-12 md:p-20 rounded-[3rem] border-emerald-500/20 relative z-10">
          <div className="absolute top-0 right-0 p-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
              className="w-24 h-24 border border-emerald-500/20 rounded-full flex items-center justify-center"
            >
              <Shield className="w-8 h-8 text-emerald-500/40" />
            </motion.div>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight">Ready to secure your <br /> <span className="text-emerald-400">infrastructure?</span></h2>
          <p className="text-zinc-400 text-lg mb-10 max-w-xl mx-auto">
            Deploy SageAI v{PLATFORM_VERSION} ({PLATFORM_WAVES_RANGE}) with {PLATFORM_CAPABILITIES_COUNT} Sovereign Capabilities across {PLATFORM_DASHBOARD_MODULES_COUNT} autonomous command studios.
          </p>

          <Link href="/dashboard" className="px-10 py-5 bg-white text-black rounded-full font-bold text-xl hover:bg-emerald-400 transition-all shadow-2xl block w-max mx-auto">
            Launch SageAI Workspace
          </Link>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-24 relative overflow-hidden">
        <Newsletter />
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 bg-black relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-black" />
                </div>
                <span className="text-xl font-bold tracking-tighter">SAGE<span className="text-emerald-400">AI</span></span>
              </div>
              <p className="text-zinc-500 max-w-sm mb-8">
                Autonomous multi-LLM cybersecurity &amp; sovereign defense mesh ({PLATFORM_WAVES_RANGE} &middot; {PLATFORM_CAPABILITIES_COUNT} capabilities across {PLATFORM_DASHBOARD_MODULES_COUNT} studios).
              </p>
              <div className="flex flex-wrap items-center gap-6 text-[10px] font-mono text-zinc-600">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  SYSTEM STATUS: NOMINAL
                </div>
                <div>UPTIME: 99.99%</div>
                <div>VERSION: {PLATFORM_VERSION}-STABLE</div>
                <div>{PLATFORM_MILESTONE.toUpperCase()}</div>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-zinc-400">Product</h4>
              <ul className="space-y-4 text-zinc-500 text-sm">
                <li><Link href="/features" className="hover:text-emerald-400 transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-emerald-400 transition-colors">Pricing</Link></li>
                <li><Link href="/how-it-works" className="hover:text-emerald-400 transition-colors">How It Works</Link></li>
                <li><Link href="/dashboard" className="hover:text-emerald-400 transition-colors">Command Center</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-zinc-400">Company</h4>
              <ul className="space-y-4 text-zinc-500 text-sm">
                <li><Link href="/how-it-works" className="hover:text-emerald-400 transition-colors">Architecture</Link></li>
                <li><Link href="/features" className="hover:text-emerald-400 transition-colors">Capabilities</Link></li>
                <li><Link href="/deep-search" className="hover:text-emerald-400 transition-colors">THE ABYSS</Link></li>
                <li><Link href="/login" className="hover:text-emerald-400 transition-colors">Sign In</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-zinc-600 text-xs">
              &copy; 2026 SageAI Security Inc. All rights reserved.
            </p>
            <div className="flex gap-8 text-xs text-zinc-600">
              <Link href="/privacy" className="hover:text-zinc-400 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-zinc-400 transition-colors">Terms of Service</Link>
              <Link href="/privacy" className="hover:text-zinc-400 transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </footer>
      <ScrollToTop />
    </>
  );
};

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    
      <div className="min-h-screen bg-black text-white selection:bg-emerald-500/30 selection:text-emerald-400">
        <AnimatePresence>
          {isLoading && <LoadingScreen />}
        </AnimatePresence>
        <div className="fixed inset-0 pointer-events-none z-[60] border-[20px] border-emerald-500/5 opacity-50" />
        <CyberHUD />
        <CyberGlow />
        <SystemStatusBar />
        <CustomCursor />
        <FloatingHUD />
        <HackerNews />
        <NoiseOverlay />
        <Navbar />

              <LandingPage />

      </div>
    
  );
}
