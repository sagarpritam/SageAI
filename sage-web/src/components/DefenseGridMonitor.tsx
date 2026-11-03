"use client";

import { useState, useEffect } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Activity,
  Network,
  Cpu,
  Lock,
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Layers,
  Database,
  ArrowRight,
} from "lucide-react";
import axios from "axios";

interface AttackDetection {
  attack_type: string;
  severity: string;
  matched_pattern: string;
  evidence: string;
  source_ip: string;
  recommendation: string;
}

interface WAFResponse {
  action: "ALLOW" | "BLOCK";
  attacks_detected: AttackDetection[];
  count: number;
}

interface AuditBlock {
  index: number;
  timestamp: string;
  actor: string;
  action: string;
  hash: string;
  prev_hash: string;
  org_id: string;
}

interface ChainVerification {
  valid: boolean;
  total_blocks: number;
  head_hash: string;
  tampered_index?: number;
  reason: string;
}

export function DefenseGridMonitor() {
  // WAF State
  const [wafPath, setWafPath] = useState("/api/v1/search");
  const [wafQuery, setWafQuery] = useState("1' UNION SELECT username, password FROM users --");
  const [wafBody, setWafBody] = useState("");
  const [wafLoading, setWafLoading] = useState(false);
  const [wafResult, setWafResult] = useState<WAFResponse | null>(null);

  // NIDS State
  const [probeIp, setProbeIp] = useState("198.51.100.88");
  const [probePort, setProbePort] = useState(22);
  const [nidsAlert, setNidsAlert] = useState<any | null>(null);
  const [nidsProbing, setNidsProbing] = useState(false);
  const [recentPorts, setRecentPorts] = useState<number[]>([]);

  // UEBA Anomaly State
  const [clientIp, setClientIp] = useState("192.0.2.77");
  const [endpoint, setEndpoint] = useState("/api/v1/transfer");
  const [payloadSize, setPayloadSize] = useState(250000);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [uebaLoading, setUebaLoading] = useState(false);

  // Audit Chain State
  const [auditVerification, setAuditVerification] = useState<ChainVerification | null>(null);
  const [ledger, setLedger] = useState<AuditBlock[]>([]);
  const [chainLoading, setChainLoading] = useState(false);

  useEffect(() => {
    fetchAuditChain();
  }, []);

  const fetchAuditChain = async () => {
    setChainLoading(true);
    try {
      const res = await axios.get("/api/intrusion/audit-chain");
      if (res.data) {
        setAuditVerification(res.data.verification);
        setLedger(res.data.recent_ledger || []);
      }
    } catch (err) {
      console.error("Failed to load audit chain", err);
    } finally {
      setChainLoading(false);
    }
  };

  const handleWafInspect = async () => {
    setWafLoading(true);
    try {
      const res = await axios.post("/api/intrusion/analyze-request", {
        path: wafPath,
        query_params: wafQuery,
        body: wafBody,
        source_ip: "203.0.113.44",
      });
      setWafResult(res.data);
      // Auto-refresh audit chain if an attack was intercepted and recorded
      if (res.data?.action === "BLOCK") {
        fetchAuditChain();
      }
    } catch (err) {
      console.error("WAF inspection error", err);
    } finally {
      setWafLoading(false);
    }
  };

  const handleNidsProbe = async (portToProbe?: number) => {
    const p = portToProbe ?? probePort;
    setNidsProbing(true);
    try {
      const res = await axios.post("/api/intrusion/nids-probe", {
        source_ip: probeIp,
        destination_port: p,
      });
      setRecentPorts((prev) => [...prev.slice(-6), p]);
      if (res.data?.alert) {
        setNidsAlert(res.data.alert);
        fetchAuditChain();
      } else {
        setNidsAlert(null);
      }
    } catch (err) {
      console.error("NIDS probe error", err);
    } finally {
      setNidsProbing(false);
    }
  };

  const handleSimulatePortScan = async () => {
    setNidsProbing(true);
    const scanPorts = [21, 22, 23, 80, 443, 3389];
    setRecentPorts([]);
    for (const p of scanPorts) {
      try {
        const res = await axios.post("/api/intrusion/nids-probe", {
          source_ip: probeIp,
          destination_port: p,
        });
        setRecentPorts((prev) => [...prev, p]);
        if (res.data?.alert) {
          setNidsAlert(res.data.alert);
          fetchAuditChain();
        }
      } catch (e) {
        // continue scan
      }
    }
    setNidsProbing(false);
  };

  const handleCheckAnomaly = async () => {
    setUebaLoading(true);
    try {
      const res = await axios.post("/api/intrusion/anomaly-check", {
        client_ip: clientIp,
        endpoint: endpoint,
        payload_bytes: Number(payloadSize),
      });
      setAnomalies(res.data?.anomalies_detected || []);
    } catch (err) {
      console.error("UEBA check error", err);
    } finally {
      setUebaLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="p-6 bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-black border border-emerald-500/20 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Pillar VI Active
            </span>
            <span className="text-zinc-500 text-xs font-mono">SOC2 Type II / ISO 27001 Cryptographic Assurance</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Network className="w-6 h-6 text-emerald-400" />
            Enterprise Defense Grid & UEBA Anomaly Mesh
          </h2>
          <p className="text-sm text-zinc-400 max-w-2xl mt-1">
            Real-time payload inspection WAF, high-fidelity NIDS port-reconnaissance sentinel, sliding-window UEBA anomaly scoring, and SHA-256 Merkle audit chains.
          </p>
        </div>

        {/* Chain Integrity Badge */}
        <div className="p-4 bg-zinc-900/90 border border-zinc-800 rounded-xl flex items-center gap-3">
          <div className={`p-2.5 rounded-lg ${auditVerification?.valid ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
            {auditVerification?.valid ? <ShieldCheck className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>
          <div>
            <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Audit Chain Integrity</div>
            <div className="text-sm font-bold text-white flex items-center gap-1.5">
              {auditVerification?.valid ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>SEALED ({auditVerification.total_blocks} Blocks)</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-red-400" />
                  <span>INTEGRITY COMPROMISED</span>
                </>
              )}
            </div>
            <div className="text-[10px] font-mono text-zinc-500 truncate max-w-[180px]">
              Head: {auditVerification?.head_hash ? auditVerification.head_hash.substring(0, 16) + "..." : "Genesis"}
            </div>
          </div>
        </div>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module 1: Ingress WAF Inspector */}
        <div className="p-6 bg-zinc-950 border border-zinc-800/80 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Ingress WAF Payload Inspector</h3>
                  <p className="text-xs text-zinc-500">Autonomous pattern matching for OWASP Top 10 exploits</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                In-line Filter
              </span>
            </div>

            {/* Quick Presets */}
            <div className="mb-4 flex flex-wrap gap-1.5">
              <button
                onClick={() => {
                  setWafPath("/api/v1/search");
                  setWafQuery("1' UNION SELECT username, password FROM users --");
                  setWafBody("");
                }}
                className="text-[11px] px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-mono transition-colors"
              >
                SQLi Payload
              </button>
              <button
                onClick={() => {
                  setWafPath("/api/v1/comments");
                  setWafQuery("");
                  setWafBody("<script>alert(document.cookie)</script>");
                }}
                className="text-[11px] px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-mono transition-colors"
              >
                XSS Vector
              </button>
              <button
                onClick={() => {
                  setWafPath("/api/v1/ping");
                  setWafQuery("; whoami && cat /etc/passwd");
                  setWafBody("");
                }}
                className="text-[11px] px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-mono transition-colors"
              >
                Command Injection
              </button>
              <button
                onClick={() => {
                  setWafPath("/api/v1/fetch");
                  setWafQuery("url=http://169.254.169.254/latest/meta-data/");
                  setWafBody("");
                }}
                className="text-[11px] px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-mono transition-colors"
              >
                Cloud SSRF
              </button>
            </div>

            {/* Form */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-mono text-zinc-400 block mb-1">Target Endpoint Path</label>
                <input
                  type="text"
                  value={wafPath}
                  onChange={(e) => setWafPath(e.target.value)}
                  className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 font-mono focus:border-emerald-500/50 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-zinc-400 block mb-1">Query String (Raw)</label>
                <input
                  type="text"
                  value={wafQuery}
                  onChange={(e) => setWafQuery(e.target.value)}
                  className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 font-mono focus:border-emerald-500/50 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-zinc-400 block mb-1">HTTP Body (JSON or Form)</label>
                <textarea
                  rows={2}
                  value={wafBody}
                  onChange={(e) => setWafBody(e.target.value)}
                  placeholder='{"comment": "Safe comment..."}'
                  className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 font-mono focus:border-emerald-500/50 outline-none resize-none"
                />
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <button
              onClick={handleWafInspect}
              disabled={wafLoading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-blue-900/20"
            >
              <Play className="w-4 h-4" />
              {wafLoading ? "Inspecting Packet..." : "Execute In-line Inspection"}
            </button>

            {/* WAF Result Card */}
            {wafResult && (
              <div
                className={`p-4 rounded-xl border ${
                  wafResult.action === "BLOCK"
                    ? "bg-red-950/30 border-red-500/30 text-red-200"
                    : "bg-emerald-950/30 border-emerald-500/30 text-emerald-200"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {wafResult.action === "BLOCK" ? (
                      <XCircle className="w-5 h-5 text-red-400" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    )}
                    <span className="font-bold text-sm tracking-wide">
                      VERDICT: {wafResult.action} ({wafResult.count} Signatures Matched)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 border border-white/10">
                    Logged to Merkle Chain
                  </span>
                </div>

                {wafResult.attacks_detected.map((atk, idx) => (
                  <div key={idx} className="mt-2 text-xs font-mono bg-black/40 p-2.5 rounded border border-white/5 space-y-1">
                    <div className="text-red-400 font-bold flex items-center justify-between">
                      <span>[{atk.attack_type}]</span>
                      <span className="text-[10px] text-zinc-400 uppercase">{atk.severity}</span>
                    </div>
                    <div className="text-zinc-400 truncate">Matched: {atk.matched_pattern}</div>
                    <div className="text-zinc-500 text-[11px] italic">{atk.recommendation}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Module 2: NIDS Reconnaissance Sentinel */}
        <div className="p-6 bg-zinc-950 border border-zinc-800/80 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">NIDS Reconnaissance Sentinel</h3>
                  <p className="text-xs text-zinc-500">Horizontal port sweeps & C2 beacon tracking</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                Layer 4 Monitor
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-mono text-zinc-400 block mb-1">Simulated Threat Source IP</label>
                <input
                  type="text"
                  value={probeIp}
                  onChange={(e) => setProbeIp(e.target.value)}
                  className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 font-mono focus:border-purple-500/50 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-zinc-400 block mb-1">Single Port Probe</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={probePort}
                    onChange={(e) => setProbePort(Number(e.target.value))}
                    className="w-32 bg-zinc-900/80 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 font-mono focus:border-purple-500/50 outline-none"
                  />
                  <button
                    onClick={() => handleNidsProbe()}
                    disabled={nidsProbing}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold rounded-lg text-xs transition-colors flex items-center gap-1.5"
                  >
                    Send SYN Probe
                  </button>
                </div>
              </div>

              {/* Port activity stream */}
              <div>
                <span className="text-xs font-mono text-zinc-500 block mb-1.5">Recent Probed Ports</span>
                <div className="flex flex-wrap gap-2">
                  {recentPorts.length === 0 ? (
                    <span className="text-xs text-zinc-600 font-mono italic">No probes recorded in window</span>
                  ) : (
                    recentPorts.map((p, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded text-xs font-mono bg-purple-950/40 text-purple-300 border border-purple-500/30">
                        :{p}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <button
              onClick={handleSimulatePortScan}
              disabled={nidsProbing}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-purple-900/20"
            >
              <Activity className="w-4 h-4" />
              {nidsProbing ? "Running Recon..." : "Simulate Automated Port Scan (6 Ports)"}
            </button>

            {/* NIDS Alert Card */}
            {nidsAlert ? (
              <div className="p-4 rounded-xl border bg-red-950/40 border-red-500/40 text-red-200 animate-in fade-in">
                <div className="flex items-center gap-2 mb-2 font-bold text-sm text-red-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span>NIDS ALERT TRIGGERED: {nidsAlert.threat_type}</span>
                </div>
                <div className="text-xs font-mono space-y-1 text-zinc-300">
                  <div>Source: <span className="text-white">{nidsAlert.source_ip}</span></div>
                  <div>Unique Ports Probed: <span className="text-red-400 font-bold">{nidsAlert.unique_ports_probed}</span></div>
                  <div>Time Window: <span className="text-zinc-400">{nidsAlert.time_window_seconds}s</span></div>
                  <div className="text-[11px] text-zinc-400 italic mt-2">{nidsAlert.action_taken}</div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-zinc-900/40 border border-zinc-800/60 rounded-xl text-xs font-mono text-zinc-500 text-center">
                Port scan threshold: 5 unique ports within 10 seconds
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: UEBA Anomaly & Cryptographic Merkle Chain */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module 3: UEBA Anomaly Engine */}
        <div className="p-6 bg-zinc-950 border border-zinc-800/80 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">UEBA Behavioral Anomaly Engine</h3>
                  <p className="text-xs text-zinc-500">Z-score sliding-window baseline deviation analysis</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                Z &gt; 3.0 Threshold
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-mono text-zinc-400 block mb-1">User / Client IP</label>
                <input
                  type="text"
                  value={clientIp}
                  onChange={(e) => setClientIp(e.target.value)}
                  className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 font-mono focus:border-amber-500/50 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-zinc-400 block mb-1">Accessed Endpoint</label>
                <input
                  type="text"
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 font-mono focus:border-amber-500/50 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-zinc-400 block mb-1">Payload Size (Bytes)</label>
                <input
                  type="number"
                  value={payloadSize}
                  onChange={(e) => setPayloadSize(Number(e.target.value))}
                  className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 font-mono focus:border-amber-500/50 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <button
              onClick={handleCheckAnomaly}
              disabled={uebaLoading}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-amber-900/20"
            >
              <Cpu className="w-4 h-4" />
              {uebaLoading ? "Evaluating Deviations..." : "Evaluate Behavioral Deviation"}
            </button>

            {anomalies.length > 0 ? (
              <div className="space-y-2">
                {anomalies.map((a, i) => (
                  <div key={i} className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl text-xs font-mono text-amber-200 space-y-1">
                    <div className="font-bold flex items-center justify-between">
                      <span>[{a.anomaly_type}]</span>
                      <span className="text-red-400">Z-Score: {a.z_score.toFixed(2)}</span>
                    </div>
                    <div className="text-zinc-300">Observed: {a.observed} | Baseline: {a.baseline_mean.toFixed(2)} &plusmn; {a.baseline_std.toFixed(2)}</div>
                    <div className="text-zinc-400 italic text-[11px]">{a.reason}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-zinc-900/40 border border-zinc-800/60 rounded-xl text-xs font-mono text-zinc-500 text-center">
                Within expected behavioral parameters (Z &le; 3.0)
              </div>
            )}
          </div>
        </div>

        {/* Module 4: Immutable Merkle Audit Ledger */}
        <div className="p-6 bg-zinc-950 border border-zinc-800/80 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Immutable Cryptographic Audit Ledger</h3>
                  <p className="text-xs text-zinc-500">Tamper-evident SHA-256 hash chaining</p>
                </div>
              </div>
              <button
                onClick={fetchAuditChain}
                disabled={chainLoading}
                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                title="Verify and refresh ledger"
              >
                <RotateCcw className={`w-4 h-4 ${chainLoading ? "animate-spin" : ""}`} />
              </button>
            </div>

            <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1">
              {ledger.length === 0 ? (
                <div className="text-xs font-mono text-zinc-600 text-center py-8">
                  Audit ledger empty or initializing...
                </div>
              ) : (
                ledger.map((b) => (
                  <div key={b.index} className="p-2.5 bg-zinc-900/70 border border-zinc-800/80 rounded-lg text-xs font-mono space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-400">Block #{b.index}</span>
                      <span className="text-[10px] text-zinc-500">{new Date(b.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="text-zinc-300 font-bold">{b.action}</div>
                    <div className="text-zinc-500 text-[11px] truncate">Actor: {b.actor}</div>
                    <div className="text-[10px] text-zinc-600 flex items-center gap-1 truncate">
                      <span>Hash:</span>
                      <span className="text-zinc-400">{b.hash.substring(0, 24)}...</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono text-zinc-500">
            <span>Merkle State: Continuous Verification</span>
            <span className="text-emerald-400 font-bold">100% Tamper Evident</span>
          </div>
        </div>
      </div>
    </div>
  );
}
