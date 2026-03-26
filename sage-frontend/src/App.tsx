import React, { useState, useEffect, useRef } from 'react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Terminal, ShieldAlert, ArrowRight, Activity, Globe, Loader2, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import AttackGraph from './components/AttackGraph';

const API_BASE = "http://localhost:8000";

interface ScanLog {
    id: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error' | 'ai';
    timestamp: string;
}

export default function App() {
  const [target, setTarget] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanId, setScanId] = useState<string | null>(null);
  const [status, setStatus] = useState<'pending' | 'running' | 'completed' | 'failed' | null>(null);
  const [logs, setLogs] = useState<ScanLog[]>([]);
  const [results, setResults] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const addLog = (message: string, type: ScanLog['type'] = 'info') => {
    const newLog: ScanLog = {
        id: Math.random().toString(36).substr(2, 9),
        message,
        type,
        timestamp: new Date().toLocaleTimeString([], { hour12: false })
    };
    setLogs(prev => [...prev, newLog]);
  };

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  // Polling logic
  useEffect(() => {
    let interval: number;
    if (isScanning && scanId && (status === 'pending' || status === 'running')) {
        interval = setInterval(async () => {
            try {
                const res = await fetch(`${API_BASE}/scan/${scanId}`);
                const data = await res.json();
                setStatus(data.status);
                
                if (data.status === 'completed') {
                    setResults(data);
                    setIsScanning(false);
                    addLog("Autonomous pipeline successfully executed.", "success");
                } else if (data.status === 'failed') {
                    setIsScanning(false);
                    addLog("Scan failed. Check backend logs.", "error");
                }

                // Push new iteration/action logs if available
                if (data.results && data.results.iterations) {
                    const latestIter = data.results.iterations[data.results.iterations.length - 1];
                    if (latestIter && latestIter.actions_taken && latestIter.actions_taken.length > 0) {
                        const lastAction = latestIter.actions_taken[latestIter.actions_taken.length - 1];
                        addLog(`AI Decision: ${lastAction.reason} -> Targeting ${lastAction.target}`, "ai");
                    }
                }
            } catch (err) {
                console.error("Polling error:", err);
            }
        }, 3000);
    }
    return () => clearInterval(interval);
  }, [isScanning, scanId, status]);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!target) return;
    
    setIsScanning(true);
    setLogs([]);
    setResults(null);
    setStatus('pending');
    
    addLog(`Initializing autonomous pipeline for ${target}...`, "info");

    try {
        const response = await fetch(`${API_BASE}/scan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ target })
        });
        const data = await response.json();
        setScanId(data.scan_id);
        addLog(`Scan ID assigned: ${data.scan_id}`, "info");
        addLog(`AI Planner is constructing initial attack strategy...`, "ai");
    } catch (err) {
        addLog("Failed to connect to SageAI Backend.", "error");
        setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <header className="fixed top-0 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-md z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
            <div className="h-8 w-8 bg-indigo-500 rounded-lg flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            SageAI
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
            <a href="#" className="hover:text-white transition-colors">Platform</a>
            <a href="#" className="hover:text-white transition-colors">Pricing</a>
            <a href="#" className="hover:text-white transition-colors">API</a>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-slate-300 hover:text-white">Pricing</Button>
            <Button className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold">Dashboard</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-sm font-medium mb-8 border border-indigo-500/20">
                <Activity className="w-4 h-4" />
                <span>Autonomous AI Agent Mode Active</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
                Autonomous AI Pentester <br className="hidden md:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                Found & Explain Exploits
                </span>
            </h1>
            
            <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">
                Run a logical pentest in 60 seconds. Our Decision Engine decides what to scan next, pivots dynamically, and generates audit-ready reports.
            </p>

            <form onSubmit={handleScan} className="max-w-xl mx-auto flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Globe className="w-5 h-5 text-slate-500" />
                </div>
                <Input 
                    type="text" 
                    placeholder="example.com" 
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    className="pl-10 h-14 bg-slate-900 border-slate-800 text-lg focus-visible:ring-indigo-500"
                    disabled={isScanning}
                    required
                />
                </div>
                <Button 
                    type="submit" 
                    disabled={isScanning}
                    className="h-14 px-8 text-lg font-bold bg-indigo-500 hover:bg-indigo-600 transition-all hover:scale-105"
                >
                {isScanning ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Scanning...</>
                ) : (
                    <><Terminal className="mr-2 h-5 w-5" /> Start Free Pentest</>
                )}
                </Button>
            </form>
          </div>

          {/* Hacker Mode Console */}
          <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl transition-all duration-500">
            <div className="h-12 bg-slate-900 flex items-center px-4 border-b border-slate-800">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              </div>
              <div className="mx-auto flex items-center gap-2 text-slate-500 text-xs font-mono uppercase tracking-widest">
                {isScanning ? <Activity className="w-3 h-3 animate-pulse text-indigo-500" /> : <Terminal className="w-3 h-3" />}
                Hacker Mode : {status || 'idle'}
              </div>
            </div>
            
            <div ref={scrollRef} className="h-80 overflow-y-auto p-6 font-mono text-sm leading-relaxed bg-black/40">
                {logs.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4">
                        <Terminal className="w-12 h-12 opacity-20" />
                        <p>Enter a target to initialize the autonomous AI pipeline.</p>
                    </div>
                )}
                {logs.map(log => (
                    <div key={log.id} className="flex gap-4 mb-2 animate-in fade-in slide-in-from-left-2 duration-300">
                        <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
                        <span className={
                            log.type === 'ai' ? 'text-fuchsia-400 font-bold' :
                            log.type === 'success' ? 'text-emerald-400' :
                            log.type === 'warning' ? 'text-amber-400' :
                            log.type === 'error' ? 'text-rose-500' : 'text-indigo-400'
                        }>
                            {log.type === 'ai' ? '⚡ [AI Decision Engine]' : '→'}
                        </span>
                        <span className={log.type === 'ai' ? 'text-white' : 'text-slate-300'}>
                            {log.message}
                        </span>
                    </div>
                ))}
            </div>
          </div>

          {/* Results Area */}
          {results && (
            <div className="mt-12 space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
                {/* Attack Graph Component */}
                <AttackGraph data={results.results?.attack_graph || { nodes: [], edges: [] }} />

                {/* AI Executive Summary */}
                <div className="p-8 rounded-xl border border-indigo-500/20 bg-indigo-500/5 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-bold flex items-center gap-3">
                            <FileText className="text-indigo-400" />
                            Executive Pentest Report
                        </h2>
                        <Button variant="outline" className="border-indigo-500/30 text-indigo-400">Download PDF</Button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-slate-200 uppercase tracking-wider">Strategic Summary</h3>
                            <p className="text-slate-400 leading-relaxed italic border-l-2 border-indigo-500 pl-4">
                                "{results.report?.summary}"
                            </p>
                            
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-slate-200">Critical Issues Identified</h3>
                                <div className="space-y-3">
                                    {(results.report?.critical_issues || []).map((issue: string, i: number) => (
                                        <div key={i} className="flex items-start gap-3 p-3 rounded bg-rose-500/10 border border-rose-500/20">
                                            <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                                            <span className="text-sm font-medium text-rose-100">{issue}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                             <h3 className="text-lg font-semibold text-slate-200 uppercase tracking-wider">Verified Findings</h3>
                             <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {(results.analyzed_findings || []).map((finding: any, i: number) => (
                                    <div key={i} className="p-4 rounded-lg bg-slate-900 border border-slate-800">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-indigo-300">{finding.name}</h4>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                                finding.severity.toLowerCase() === 'critical' ? 'bg-rose-500 text-white' :
                                                finding.severity.toLowerCase() === 'high' ? 'bg-orange-500 text-white' : 'bg-amber-500 text-black'
                                            }`}>
                                                {finding.severity}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-400 mb-3 line-clamp-2">{finding.reason}</p>
                                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                            AI VERIFIED EXPLOITABLE
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </div>
                    </div>
                </div>
            </div>
          )}
        </div>
      </main>

      <footer className="py-12 border-t border-white/5 text-center text-slate-500 text-sm">
        <div className="container mx-auto">
            <p>© 2026 SageAI Security. The Autonomous AI Advantage.</p>
        </div>
      </footer>
    </div>
  );
}
