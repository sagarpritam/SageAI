"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, User, Send, Loader2, Sparkles, Shield, AlertTriangle, Terminal } from "lucide-react";
import axios from "axios";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: Array<{ title: string; type?: string }>;
}

export function AICopilot({ scanId }: { scanId?: string }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "👋 I'm your **SageAI Security Copilot** backed by live **CISA KEV** threat intelligence and verified scanning tools.\n\nAsk me to analyze vulnerabilities, generate safe non-destructive curl verification probes, or check actively exploited CVEs in the wild.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (customText?: string) => {
    const msg = (customText || input).trim();
    if (!msg || loading) return;

    if (!customText) setInput("");
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setLoading(true);

    try {
      // Connect to Phase 02 Copilot API
      const r = await axios.post("/api/copilot/chat", {
        message: msg,
        context: scanId ? { scan_id: scanId } : undefined,
        stream: false,
      });
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: r.data.reply || "No response received.",
          sources: r.data.sources,
        },
      ]);
    } catch {
      // Fallback
      try {
        const fallbackRes = await axios.post("/api/ai/chat", {
          message: msg,
          context: scanId ? { scan_id: scanId } : undefined,
        });
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: fallbackRes.data.reply },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "⚠️ AI service unavailable. Check that the FastAPI backend is running and you have an authenticated session.",
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[640px] bg-zinc-950/70 border border-emerald-900/40 rounded-xl overflow-hidden shadow-2xl backdrop-blur-sm">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded bg-emerald-950 border border-emerald-500/40 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div>
            <span className="text-sm font-bold text-white tracking-tight">SageAI Copilot</span>
            <span className="ml-2 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-800/50 rounded">
              Phase 02 KEV
            </span>
          </div>
        </div>
        {scanId && (
          <span className="text-xs text-zinc-400 font-mono bg-zinc-900 px-2.5 py-1 rounded border border-zinc-800">
            Scan: <span className="text-emerald-400">{scanId.substring(0, 8)}…</span>
          </span>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 font-sans">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
            {m.role === "assistant" && (
              <div className="w-7 h-7 rounded-md bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4 text-emerald-400" />
              </div>
            )}
            <div
              className={`max-w-[82%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-emerald-600/20 border border-emerald-700/40 text-emerald-100"
                  : "bg-zinc-900/70 border border-zinc-800 text-zinc-200"
              }`}
            >
              <div
                className="whitespace-pre-wrap break-words"
                dangerouslySetInnerHTML={{
                  __html: m.content
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
                    .replace(/```bash([\s\S]*?)```/g, '<div class="my-2 p-2.5 rounded bg-black/80 font-mono text-emerald-400 text-xs border border-zinc-800 overflow-x-auto">$1</div>')
                    .replace(/```([\s\S]*?)```/g, '<div class="my-2 p-2.5 rounded bg-black/80 font-mono text-zinc-200 text-xs border border-zinc-800 overflow-x-auto">$1</div>')
                    .replace(/`([^`]+)`/g, '<code class="bg-zinc-800/90 text-emerald-300 px-1 py-0.5 rounded font-mono text-xs">$1</code>')
                    .replace(/\n/g, "<br/>"),
                }}
              />

              {m.sources && m.sources.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-zinc-800 flex flex-wrap gap-1.5 items-center">
                  <span className="text-[10px] text-zinc-500 font-mono uppercase">Verified Sources:</span>
                  {m.sources.map((s, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-zinc-800 text-emerald-400 border border-zinc-700"
                    >
                      <Shield className="w-2.5 h-2.5" /> {s.title}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {m.role === "user" && (
              <div className="w-7 h-7 rounded-md bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4 text-zinc-400" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 items-center text-xs text-emerald-400 font-mono">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
            <span>Copilot analyzing threat feeds & scan context...</span>
          </div>
        )}
      </div>

      {/* Suggestion Chips */}
      <div className="px-5 py-2 bg-zinc-900/40 border-t border-zinc-800/70 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <button
          onClick={() => handleSend("Explain CVE-2024-21887 and check CISA KEV exploitation")}
          className="px-2.5 py-1 rounded-full text-[11px] bg-zinc-900 text-zinc-300 border border-zinc-700 hover:border-emerald-500/50 hover:text-white shrink-0 transition-colors"
        >
          🚨 CISA KEV Exploits
        </button>
        <button
          onClick={() => handleSend("Generate safe non-destructive curl command to check for missing security headers")}
          className="px-2.5 py-1 rounded-full text-[11px] bg-zinc-900 text-zinc-300 border border-zinc-700 hover:border-emerald-500/50 hover:text-white shrink-0 transition-colors"
        >
          🛡️ Safe PoC Curl
        </button>
        <button
          onClick={() => handleSend("Summarize the latest scan results and high severity findings")}
          className="px-2.5 py-1 rounded-full text-[11px] bg-zinc-900 text-zinc-300 border border-zinc-700 hover:border-emerald-500/50 hover:text-white shrink-0 transition-colors"
        >
          🔍 Scan Summary
        </button>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-zinc-800 bg-zinc-900/60">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Ask Copilot (e.g., explain CVE-2024-3400, safe curl PoC, remediation)..."
            className="flex-1 bg-black/60 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-white font-mono placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            aria-label="Send message"
            className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
