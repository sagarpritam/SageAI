"use client";

import { useState } from "react";
import { Shield } from "lucide-react";
import Link from "next/link";
import { ScanInput } from "@/components/ScanInput";
import { HackerMode } from "@/components/HackerMode";
import { VulnerabilityList, Vulnerability } from "@/components/VulnerabilityList";
import { ReportView, ScanReport } from "@/components/ReportView";
import { AttackGraph, GraphData } from "@/components/AttackGraph";
import { RiskGauge } from "@/components/RiskGauge";
import { ExportButton } from "@/components/ExportButton";
import { ShareButton } from "@/components/ShareButton";
import axios from "axios";
import posthog from "posthog-js";

interface RiskData {
  risk_score: number;
  risk_level: string;
  total_findings: number;
}

export default function Home() {
  const [scanState, setScanState] = useState<"idle" | "running" | "completed">("idle");
  const [scanId, setScanId] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  
  // Results State
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [report, setReport] = useState<ScanReport | null>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [riskData, setRiskData] = useState<RiskData | null>(null);

  const startScan = async (target: string) => {
    setScanState("running");
    setLogs([]);
    posthog.capture('scan_initiated', { target });
    
    // Fallback ID if API fails
    let newScanId = "mock-scan-id";

    try {
      // Proxy through Next.js API for rate limiting 
      const res = await axios.post("/api/scan", { target });
      
      if (res.data?.limitReached) {
        setScanState("idle");
        alert("Free limit reached! Redirecting to setup Founder Mode.");
        window.location.assign("/pricing");
        return;
      }
      
      if (res.data?.scan_id) {
        newScanId = res.data.scan_id;
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      if (e.response?.status === 401) {
        setScanState("idle");
        alert("Please sign in to scan.");
        return;
      }
      if (e.response?.status === 403 && e.response?.data?.limitReached) {
        setScanState("idle");
        alert("Free limit reached! Redirecting to setup Founder Mode.");
        window.location.assign("/pricing");
        return;
      }
      console.warn("Backend not running or other error, falling back to mock scan.");
    }
    
    setScanId(newScanId);
    
    // Clear initial logs
    setLogs(["[+] Initializing neural exploit engine...", "[+] Binding to OSINT streams..."]);

    // Connect WebSocket for real-time logs
    connectWebSocket(newScanId, target);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const connectWebSocket = (id: string, target: string) => {
    const ws = new WebSocket(`ws://localhost:8000/ws/scan/${id}`);
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "ping") return;
        
        const phaseName = data.phase ? data.phase.toUpperCase() : "UNKNOWN";
        const findings = data.findings_count || 0;
        const logLine = `[+] Phase: ${phaseName} | Progress: ${data.progress}/${data.total} | Findings: ${findings}`;
        
        setLogs(prev => {
          // Avoid duplicate logs if phase doesn't change
          if (prev[prev.length - 1] === logLine) return prev;
          return [...prev, logLine];
        });
        
        if (data.status === "complete") {
          ws.close();
          fetchFinalResults(id);
        }
      } catch (e) {
        console.error("WS Parse Error", e);
      }
    };
    
    ws.onerror = (e) => {
      console.error("WebSocket error, falling back to polling", e);
      pollScan(id);
    };
  };

  const fetchFinalResults = async (id: string) => {
    try {
      const res = await axios.get(`/api/scan/${id}`);
      if (res.data.status === "completed") {
        setVulnerabilities(res.data.analyzed_findings || []);
        setReport(res.data.report || null);
        setGraphData(res.data.graph || null);
        setRiskData(res.data.risk || null);
        setScanState("completed");
        setLogs(prev => [...prev, "[!] Finalizing OSINT Aggregation...", "[+] Scan Completed Successfully!"]);
      }
    } catch (e) {
      console.error("Failed to fetch final results via proxy", e);
      setScanState("idle");
    }
  };

  // Fallback polling if WebSocket fails
  const pollScan = async (id: string) => {
    const checkStatus = async () => {
      try {
        const res = await axios.get(`/api/scan/${id}`);
        if (res.data.status === "completed") {
          setVulnerabilities(res.data.analyzed_findings || []);
          setReport(res.data.report || null);
          setGraphData(res.data.graph || null);
          setScanState("completed");
          setLogs(prev => [...prev, "[+] Scan Completed Successfully!"]);
          return;
        }
      } catch (e) {
        console.error("Poll Error", e);
      }

      setScanState(current => {
        if (current === "running") {
          setTimeout(checkStatus, 2000);
        }
        return current;
      });
    };
    checkStatus();
  };

  return (
    <main className="min-h-screen bg-black text-emerald-50 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Background aesthetics */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/10 via-black to-black z-0 pointer-events-none" />
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12 flex flex-col items-center">
        {/* Hero Section */}
        <div className="text-center mb-12 space-y-6">
          <div className="inline-flex items-center justify-center p-4 bg-emerald-900/30 rounded-full mb-4 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <Shield className="w-12 h-12 text-emerald-400" />
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-emerald-100 to-emerald-600">
            Autonomous AI Pentester
          </h1>
          <p className="text-xl text-emerald-500/80 font-mono tracking-widest uppercase shadow-sm">
            Run a full pentest in 60 seconds
          </p>
          <Link href="/history" className="text-sm font-mono text-emerald-500/50 hover:text-emerald-400 transition-colors underline underline-offset-4">
            View Past Scans →
          </Link>
        </div>

        {/* Scan Input */}
        <div className="w-full flex justify-center mb-16">
          {scanState === "idle" && (
            <ScanInput onStartScan={startScan} isLoading={false} />
          )}
          {scanState === "running" && (
            <div className="text-center space-y-4">
              <ScanInput onStartScan={() => {}} isLoading={true} />
              <div className="w-full h-2 bg-emerald-900/30 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-full rounded-full animate-[progress_7s_ease-in-out_forwards]" />
              </div>
            </div>
          )}
        </div>

        {/* Live Hacker Mode Logs */}
        {(scanState === "running" || scanState === "completed") && (
          <div className="w-full mb-16 transition-all duration-700">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
              <span className="text-emerald-500">_</span> Live Scan Feed
            </h2>
            <HackerMode logs={logs} isScanning={scanState === "running"} />
          </div>
        )}

        {/* Results Sections */}
        {scanState === "completed" && (
          <div className="w-full space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">

            {/* Risk Score Gauge */}
            {riskData && (
              <section className="flex flex-col items-center">
                <h2 className="text-3xl font-black mb-8 border-b border-white/10 pb-4 text-emerald-400 w-full">
                  Threat Assessment
                </h2>
                <RiskGauge
                  score={riskData.risk_score}
                  level={riskData.risk_level}
                  totalFindings={riskData.total_findings}
                />
              </section>
            )}
            
            {/* Viral Share Option */}
            <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-6 text-center space-y-4 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
              <h3 className="text-xl font-bold text-emerald-400">Scan Complete!</h3>
              <p className="text-zinc-300 max-w-lg mx-auto">
                Share your Hacker Mode run with the world to get a free comprehensive export.
              </p>
              <div className="flex justify-center gap-4 pt-2 flex-wrap">
                {scanId && <ShareButton scanId={scanId} />}
                {scanId && <ExportButton scanId={scanId} />}
                <a 
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("I just scanned my site with SageAI — found " + vulnerabilities.length + " vulnerabilities 😳 Run your own autonomous pentest in 60 seconds.")}&url=https://sageai.example.com`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => posthog.capture('viral_share_twitter_clicked')}
                  className="bg-[#1DA1F2] hover:bg-[#1DA1F2]/80 text-white px-6 py-2 rounded-md font-bold transition flex items-center"
                >
                  Share on Twitter
                </a>
                <a 
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=https://sageai.example.com`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => posthog.capture('viral_share_linkedin_clicked')}
                  className="bg-[#0A66C2] hover:bg-[#0A66C2]/80 text-white px-6 py-2 rounded-md font-bold transition flex items-center"
                >
                  Share on LinkedIn
                </a>
              </div>
            </div>

            {/* Vulnerabilities */}
            <section>
              <h2 className="text-3xl font-black mb-6 flex items-center gap-2 border-b border-white/10 pb-4 text-emerald-400">
                Identified Vulnerabilities
              </h2>
              <VulnerabilityList vulnerabilities={vulnerabilities} />
            </section>

            {/* AI Report */}
            {report && (
              <section>
                 <h2 className="text-3xl font-black mb-6 border-b border-white/10 pb-4 text-emerald-400">
                  AI Report Summary
                </h2>
                <ReportView report={report} />
              </section>
            )}

            {/* Attack Graph */}
            {graphData && (
              <section>
                 <h2 className="text-3xl font-black mb-6 border-b border-white/10 pb-4 text-emerald-400">
                  Attack Surface Graph
                </h2>
                <AttackGraph data={graphData} />
              </section>
            )}

          </div>
        )}
      </div>

    </main>
  );
}
