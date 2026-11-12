"use client";

import React, { useState } from "react";
import {
  Coins,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Play,
  FileCode,
  Copy,
  Check,
  ExternalLink,
  Code2,
  Terminal,
  Cpu,
  RefreshCw,
} from "lucide-react";

const SAMPLE_VULNERABLE_CONTRACT = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract EtherVault {
    mapping(address => uint256) public balances;

    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }

    // SWC-107: Reentrancy vulnerability - state updated after external call
    function withdrawAll() public {
        uint256 bal = balances[msg.sender];
        require(bal > 0, "Zero balance");

        (bool sent, ) = msg.sender.call{value: bal}("");
        require(sent, "Failed to send Ether");

        balances[msg.sender] = 0;
    }

    // SWC-105: Missing access control on emergency drain
    function emergencyDrain(address payable recipient) public {
        recipient.transfer(address(this).balance);
    }
}`;

export function Web3SecurityStudio() {
  const [sourceCode, setSourceCode] = useState(SAMPLE_VULNERABLE_CONTRACT);
  const [contractName, setContractName] = useState("EtherVault.sol");
  const [chain, setChain] = useState("Ethereum (EVM)");
  const [loading, setLoading] = useState(false);
  const [pocLoading, setPocLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);
  const [pocResult, setPocResult] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState<"audit" | "poc">("audit");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const runAudit = async () => {
    setLoading(true);
    setPocResult(null);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/web3-security/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contract_name: contractName,
          source_code: sourceCode,
          chain: chain,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAuditResult(data.audit_report);
      } else {
        setErrorMsg(`Smart contract audit failed (HTTP ${res.status}).`);
      }
    } catch {
      setErrorMsg("Unable to reach Web3 smart contract audit backend.");
    } finally {
      setLoading(false);
    }
  };

  const generatePoC = async (vulnType: string = "REENTRANCY_DRAIN") => {
    setPocLoading(true);
    setActiveTab("poc");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/web3-security/poc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contract_name: contractName,
          vulnerability_type: vulnType,
          chain: chain,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setPocResult(data.foundry_poc);
      } else {
        setErrorMsg(`Foundry PoC synthesis failed (HTTP ${res.status}).`);
      }
    } catch {
      setErrorMsg("Foundry PoC synthesis request failed.");
    } finally {
      setPocLoading(false);
    }
  };

  const copyPoCToClipboard = async () => {
    if (!pocResult?.foundry_code) return;
    setErrorMsg(null);
    if (!navigator?.clipboard?.writeText) {
      setErrorMsg("Clipboard write unavailable in this browser context.");
      return;
    }
    try {
      await navigator.clipboard.writeText(pocResult.foundry_code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      setErrorMsg("Clipboard write blocked by browser.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-slate-900 border border-amber-500/20 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Web3 & Smart Contract Security Auditor
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono border border-amber-500/30">
                EVM / Solana / Move
              </span>
            </h2>
            <p className="text-sm text-slate-400">
              Autonomous bytecode and AST auditor detecting SWC-107 reentrancy, access control drains, and flash loan price manipulation with automated Foundry PoC test harnesses.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setSourceCode(SAMPLE_VULNERABLE_CONTRACT);
              setContractName("EtherVault.sol");
            }}
            className="px-3 py-1.5 text-xs font-mono rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition"
          >
            Load Vulnerable Sample
          </button>
          <button
            type="button"
            onClick={runAudit}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-sm transition shadow-lg shadow-amber-600/20 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {loading ? "Auditing Bytecode..." : "Execute Security Audit"}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="px-4 py-3 rounded-xl bg-red-950/40 border border-red-700/50 text-xs font-mono text-red-300 flex items-center gap-2"
        >
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Code Editor & Target Settings */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Target Settings</span>
              <span className="text-xs text-amber-400 font-mono">Solidity ^0.8.20</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Contract Name</label>
                <input
                  type="text"
                  value={contractName}
                  onChange={(e) => setContractName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:border-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Target Chain</label>
                <select
                  value={chain}
                  onChange={(e) => setChain(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:border-amber-500 outline-none"
                >
                  <option>Ethereum (EVM)</option>
                  <option>Arbitrum One</option>
                  <option>Polygon PoS</option>
                  <option>Solana (SVM / Rust)</option>
                  <option>Aptos (Move)</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-slate-400">Smart Contract Source</label>
                <span className="text-[10px] text-slate-500 font-mono">{sourceCode.split("\n").length} lines</span>
              </div>
              <textarea
                value={sourceCode}
                onChange={(e) => setSourceCode(e.target.value)}
                rows={16}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-amber-200/90 focus:border-amber-500 outline-none resize-none leading-relaxed"
                placeholder="Paste Solidity contract here..."
              />
            </div>
          </div>
        </div>

        {/* Right Column: Audit Findings & Foundry PoC */}
        <div className="lg:col-span-7 space-y-4">
          {/* Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <button
              type="button"
              onClick={() => setActiveTab("audit")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === "audit"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Audit Findings ({auditResult?.vulnerabilities_detected ?? 0})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("poc")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === "poc"
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              Foundry PoC Test Harness
            </button>
          </div>

          {activeTab === "audit" && (
            <div className="space-y-4">
              {auditResult ? (
                <>
                  {/* Score & Summary Banner */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-xs text-slate-400">Security Score</div>
                      <div className="text-2xl font-bold font-mono mt-1 text-red-400">
                        {auditResult.web3_security_score} / 100
                      </div>
                      <div className="text-[10px] text-red-400 mt-1">High Risk Contract</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-xs text-slate-400">Critical SWCs</div>
                      <div className="text-2xl font-bold font-mono mt-1 text-amber-400">
                        {auditResult.critical_vulnerabilities}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">Immediate Exploit Path</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-xs text-slate-400">Formal Verification</div>
                      <div className="text-2xl font-bold font-mono mt-1 text-emerald-400">
                        READY
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">Certora / Foundry</div>
                    </div>
                  </div>

                  {/* Vulnerability Cards */}
                  <div className="space-y-3">
                    {auditResult.findings?.map((f: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-slate-900/80 border border-red-500/20 space-y-2 hover:border-red-500/40 transition"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-mono font-bold">
                              {f.swc_id || "SWC"}
                            </span>
                            <span className="text-sm font-semibold text-white">{f.name || f.title}</span>
                          </div>
                          <span className="text-xs text-red-400 font-mono uppercase font-bold">
                            {f.severity || "CRITICAL"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{f.description}</p>
                        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400">
                          <span className="text-slate-500">Fix Recommendation: </span>
                          {f.recommendation || f.remediation}
                        </div>
                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => generatePoC(f.name || "REENTRANCY_DRAIN")}
                            className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-mono transition"
                          >
                            <Terminal className="w-3 h-3" />
                            Synthesize Foundry Exploit Test →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="p-12 text-center rounded-xl bg-slate-900/40 border border-slate-800 text-slate-500 space-y-2">
                  <Coins className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                  <p className="text-sm">Click "Execute Security Audit" to inspect contract AST and identify SWC exploits.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "poc" && (
            <div className="space-y-4">
              {pocLoading ? (
                <div className="p-12 text-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400 space-y-3">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-purple-400" />
                  <p className="text-xs font-mono">Synthesizing Foundry test harness (forge-std/Test.sol)...</p>
                </div>
              ) : pocResult ? (
                <div className="p-4 rounded-xl bg-slate-900/90 border border-purple-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-purple-400" />
                      <span className="text-xs font-mono text-purple-300 font-bold">
                        {pocResult.poc_file || "test/ExploitPoC.t.sol"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={copyPoCToClipboard}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition"
                    >
                      {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copiedCode ? "Copied" : "Copy Code"}
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-950 rounded-lg text-xs font-mono text-purple-200 overflow-x-auto max-h-96 border border-slate-800">
                    {pocResult.foundry_code}
                  </pre>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between font-mono pt-1">
                    <span>Framework: {pocResult.test_framework || "Foundry (Forge 0.2.0)"}</span>
                    <span className="text-emerald-400">Run with: forge test -vvvv</span>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center rounded-xl bg-slate-900/40 border border-slate-800 text-slate-500 space-y-2">
                  <Terminal className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                  <p className="text-sm">Click "Synthesize Foundry Exploit Test" from any vulnerability finding to generate PoC.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

