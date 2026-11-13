"use client";

import React, { useState } from "react";
import {
  Globe,
  ShieldCheck,
  Share2,
  Users,
  Copy,
  Check,
  Layers,
  FileJson,
  Download,
  AlertTriangle,
  RefreshCw,
  Zap,
} from "lucide-react";

export function CTIHub() {
  const [selectedActor, setSelectedActor] = useState("APT28 (Fancy Bear / Strontium)");
  const [campaignName, setCampaignName] = useState("Targeted Defense Sector Espionage 2026");
  const [indicatorsText, setIndicatorsText] = useState(
    "sha256:8f7e6d5c4b3a21098f7e6d5c4b3a21098f7e6d5c4b3a21098f7e6d5c4b3a2109\nip:198.51.100.89\ndomain:c2-command.dark-node.ru"
  );
  const [loading, setLoading] = useState(false);
  const [stixBundle, setStixBundle] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const actors = [
    { name: "APT28 (Fancy Bear / Strontium)", origin: "Russian Federation (GRU)", motivation: "ESPIONAGE", tools: ["X-Agent", "Zebrocy", "Mimikatz"] },
    { name: "Lazarus Group (HIDDEN COBRA)", origin: "DPRK (RGB)", motivation: "FINANCIAL_AND_ESPIONAGE", tools: ["Brambul", "Joanap", "Fallchill"] },
    { name: "Scattered Spider (UNC3944)", origin: "Transnational Cybercrime Syndicate", motivation: "EXTORTION_AND_DATA_THEFT", tools: ["Sliver", "AnyDesk", "Mimikatz"] },
    { name: "LockBit 3.0 (LockBit Black)", origin: "RaaS Syndicate", motivation: "FINANCIAL_EXTORTION", tools: ["LockBit 3.0 Encryptor", "StealBit"] },
  ];

  const taxiiCollections = [
    { id: "col-cisa-kev", title: "CISA Known Exploited Vulnerabilities (KEV)", access: "READ_ONLY", format: "STIX 2.1 JSON" },
    { id: "col-sageai-honeypot-mesh", title: "SageAI Honeypot & Deception Tripwire IOCs", access: "READ_WRITE", format: "STIX 2.1 JSON" },
    { id: "col-apt-campaigns", title: "Global APT Threat Campaigns 2026", access: "READ_ONLY", format: "STIX 2.1 JSON" },
  ];

  const generateStix = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const parsedIndicators = indicatorsText
        .split("\n")
        .filter((l) => l.includes(":"))
        .map((l) => {
          const [type, val] = l.split(":");
          return { type: type.trim(), value: val.trim() };
        });

      const res = await fetch("/api/cti/bundle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actor_name: selectedActor,
          campaign_name: campaignName,
          indicators: parsedIndicators,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setStixBundle(data);
      } else {
        setErrorMsg(`Failed to generate STIX 2.1 bundle (HTTP ${res.status}).`);
      }
    } catch (e: unknown) {
      setErrorMsg(
        e instanceof Error
          ? e.message
          : "Unable to generate STIX 2.1 bundle. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const copyBundle = async () => {
    if (!stixBundle?.stix_bundle) return;
    const payload = JSON.stringify(stixBundle.stix_bundle, null, 2);
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(payload);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        setErrorMsg("Clipboard access is unavailable in this browser context.");
      }
    } catch {
      setErrorMsg("Failed to copy STIX 2.1 bundle to clipboard.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-950/40 via-zinc-950 to-zinc-900 border border-blue-900/40 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Decentralized Cyber Threat Intelligence (CTI) &amp; STIX 2.1 / TAXII 2.1 Hub
                <span className="text-xs font-mono px-2 py-0.5 bg-blue-950 border border-blue-700/60 rounded text-blue-300">
                  OASIS Open Standard
                </span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Automated STIX 2.1 JSON bundle serialization, TAXII 2.1 feed distribution, and nation-state threat actor profiling.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={generateStix}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-blue-950/40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Generate STIX 2.1 Bundle
          </button>
        </div>

        {/* Threat Actor Quick Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-6">
          {actors.map((act, idx) => (
            <button
              type="button"
              key={idx}
              onClick={() => setSelectedActor(act.name)}
              className={`p-3 rounded-lg border text-left transition-all ${
                selectedActor === act.name
                  ? "bg-blue-950/40 border-blue-500/60 shadow-md shadow-blue-950/30"
                  : "bg-black/40 border-zinc-800 hover:bg-black/70"
              }`}
            >
              <div className="text-xs font-bold text-white truncate">{act.name}</div>
              <div className="text-[10px] text-zinc-400 mt-1 truncate">{act.origin}</div>
              <div className="text-[10px] text-blue-400 font-mono mt-0.5">{act.motivation}</div>
            </button>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-xl border border-red-500/40 bg-red-950/50 px-4 py-3 text-xs font-mono text-red-300"
        >
          <span className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            {errorMsg}
          </span>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-red-300/80 hover:text-red-200 font-semibold shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Input Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-3">
          <label className="text-xs font-bold text-zinc-300">Associated Attack Campaign Name:</label>
          <input
            type="text"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            className="w-full bg-black border border-zinc-800 rounded-lg p-2.5 text-white text-xs font-mono"
          />

          <div className="pt-2">
            <label className="text-xs font-bold text-zinc-300 block mb-1">
              Indicators of Compromise (type:value per line):
            </label>
            <textarea
              rows={4}
              value={indicatorsText}
              onChange={(e) => setIndicatorsText(e.target.value)}
              className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* TAXII 2.1 Collections Server */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <Share2 className="w-3.5 h-3.5 text-blue-400" />
              TAXII 2.1 Server Collections
            </h4>
            <span className="text-[10px] text-zinc-500 font-mono">/taxii2/collections/</span>
          </div>

          <div className="space-y-2">
            {taxiiCollections.map((col, idx) => (
              <div key={idx} className="p-3 bg-black/60 border border-zinc-800 rounded-lg space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-200">{col.title}</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-zinc-900 border border-zinc-700 rounded text-blue-300">
                    {col.access}
                  </span>
                </div>
                <div className="text-[10px] text-zinc-500 font-mono">ID: {col.id} | Format: {col.format}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Generated STIX Bundle */}
      {stixBundle && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <FileJson className="w-4 h-4 text-blue-400" />
                OASIS STIX 2.1 JSON Bundle ({stixBundle.objects_count} Objects Linked)
              </h4>
              <span className="text-[11px] text-zinc-500">Bundle ID: {stixBundle.bundle_id}</span>
            </div>

            <button
              type="button"
              onClick={copyBundle}
              aria-live="polite"
              className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs rounded border border-zinc-800 flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy STIX JSON"}
            </button>
          </div>

          <pre className="p-4 bg-black border border-zinc-900 rounded-lg text-xs text-zinc-300 overflow-x-auto max-h-96 whitespace-pre-wrap leading-relaxed">
            {JSON.stringify(stixBundle.stix_bundle, null, 2)}
          </pre>

          {stixBundle.merkle_seal && (
            <div className="p-3 bg-black border border-emerald-900/40 rounded-xl flex items-center justify-between text-xs font-mono text-zinc-400">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Merkle Seal Block #{stixBundle.merkle_seal.ledger_index} Cryptographically Verified</span>
              </div>
              <div className="text-zinc-500 text-[10px] truncate max-w-xs">{stixBundle.merkle_seal.record_hash}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

