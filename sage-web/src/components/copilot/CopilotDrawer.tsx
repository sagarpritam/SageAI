"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Sparkles,
  X,
  Send,
  Loader2,
  Terminal,
  Bot,
  User,
  Copy,
  Check,
  Shield,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  Code2,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Array<{ title: string; type?: string }>;
  timestamp: string;
}

interface CopilotDrawerProps {
  initialOpen?: boolean;
  scanId?: string;
  target?: string;
  findingId?: string;
}

function renderSafeMarkdown(raw: string): string {
  // 1. Sanitize raw text to prevent XSS (escape all HTML tags and characters)
  const escaped = raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  // 2. Safely parse trusted markdown formatting
  return escaped
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/```bash([\s\S]*?)```/g, '<div class="my-2 p-2.5 rounded bg-black/80 font-mono text-emerald-400 text-xs border border-zinc-800 overflow-x-auto">$1</div>')
    .replace(/```([\s\S]*?)```/g, '<div class="my-2 p-2.5 rounded bg-black/80 font-mono text-zinc-200 text-xs border border-zinc-800 overflow-x-auto">$1</div>')
    .replace(/`([^`]+)`/g, '<code class="bg-zinc-800/90 text-emerald-300 px-1 py-0.5 rounded font-mono text-xs">$1</code>')
    .replace(/\n/g, "<br/>");
}

export function CopilotDrawer({
  initialOpen = false,
  scanId: initialScanId,
  target: initialTarget,
  findingId: initialFindingId,
}: CopilotDrawerProps) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "👋 **Welcome to SageAI Security Copilot.**\n\nI am your autonomous cyber defense analyst backed by live **CISA Known Exploited Vulnerabilities (KEV)** threat intelligence and tenant-scoped security tooling.\n\nAsk me anything, or try one of the quick actions below.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Active investigation context
  const [activeScanId, setActiveScanId] = useState<string | undefined>(initialScanId);
  const [activeTarget, setActiveTarget] = useState<string | undefined>(initialTarget);
  const [activeFindingId, setActiveFindingId] = useState<string | undefined>(initialFindingId);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  // Global keyboard shortcut: Cmd+K / Ctrl+K to toggle, Esc to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Focus input when drawer opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleCopyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: "cleared",
        role: "assistant",
        content: "🧹 Conversation cleared. How can I assist your security team next?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  const executeSend = useCallback(
    async (textToSend: string) => {
      const trimmed = textToSend.trim();
      if (!trimmed || isStreaming) return;

      const userMsgId = `user-${Date.now()}`;
      const assistantMsgId = `assistant-${Date.now()}`;
      const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      const newMessages: Message[] = [
        ...messages,
        {
          id: userMsgId,
          role: "user",
          content: trimmed,
          timestamp: timeStr,
        },
        {
          id: assistantMsgId,
          role: "assistant",
          content: "",
          timestamp: timeStr,
        },
      ];

      setMessages(newMessages);
      setInput("");
      setIsStreaming(true);

      const contextObj: Record<string, any> = {};
      if (activeScanId) contextObj.scan_id = activeScanId;
      if (activeTarget) contextObj.target = activeTarget;
      if (activeFindingId) contextObj.finding_id = activeFindingId;

      try {
        const response = await fetch("/api/copilot/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: trimmed,
            context: Object.keys(contextObj).length > 0 ? contextObj : undefined,
            stream: true,
            history: messages.slice(-4).map((m) => ({ role: m.role, content: m.content })),
          }),
        });

        if (!response.ok || !response.body) {
          throw new Error(`HTTP error ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedReply = "";
        let finalSources: Array<{ title: string; type?: string }> = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const parsed = JSON.parse(line.replace("data: ", ""));
                if (parsed.token) {
                  accumulatedReply += parsed.token;
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMsgId ? { ...msg, content: accumulatedReply } : msg
                    )
                  );
                }
                if (parsed.done && parsed.sources) {
                  finalSources = parsed.sources;
                }
              } catch {
                // Ignore SSE framing artifacts
              }
            }
          }
        }

        // Apply final sources
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? {
                  ...msg,
                  content: accumulatedReply || "No response received.",
                  sources: finalSources,
                }
              : msg
          )
        );
      } catch (err) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? {
                  ...msg,
                  content:
                    "⚠️ **Copilot Connection Error**: Unable to reach backend. Verify that the FastAPI backend is running and you have an authenticated session.",
                }
              : msg
          )
        );
      } finally {
        setIsStreaming(false);
      }
    },
    [messages, isStreaming, activeScanId, activeTarget, activeFindingId]
  );

  return (
    <>
      {/* ── Floating Activator Pill ── */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-r from-emerald-950 via-zinc-900 to-zinc-950 text-white border border-emerald-500/40 rounded-full shadow-2xl hover:shadow-emerald-900/40 hover:border-emerald-400 transition-all group backdrop-blur-md"
        title="Open SageAI Copilot (Cmd+K)"
      >
        <div className="relative flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>
        <span className="text-xs font-bold tracking-wide text-zinc-100">SageAI Copilot</span>
        <span className="px-1.5 py-0.5 text-[10px] font-mono bg-zinc-800/80 text-emerald-400 rounded border border-zinc-700/60">
          ⌘K
        </span>
      </button>

      {/* ── Slide-over Drawer Backdrop ── */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* ── Copilot Drawer Container ── */}
      <aside
        className={`fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[500px] lg:w-[560px] bg-zinc-950 border-l border-zinc-800/90 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800/80 bg-zinc-900/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center">
              <Terminal className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-tight">SageAI Security Copilot</h2>
                <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-800/50 rounded">
                  Live KEV RAG
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">Autonomous SecOps Analyst & Exploit Verifier</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleClearHistory}
              className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 rounded-md transition-colors"
              title="Clear conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800/60 rounded-md transition-colors"
              title="Close Copilot (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Investigation Context Pill (if attached) */}
        {(activeScanId || activeTarget) && (
          <div className="px-5 py-2 bg-emerald-950/20 border-b border-emerald-900/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-zinc-300 font-mono">
              <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Target:</span>
              <span className="text-emerald-400 font-bold truncate max-w-[240px]">
                {activeTarget || activeScanId}
              </span>
            </div>
            <button
              onClick={() => {
                setActiveScanId(undefined);
                setActiveTarget(undefined);
                setActiveFindingId(undefined);
              }}
              className="text-[10px] text-zinc-500 hover:text-zinc-300 hover:underline"
            >
              Clear Context
            </button>
          </div>
        )}

        {/* Message Stream */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 font-sans">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 text-sm ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.role === "assistant" && (
                <div className="w-7 h-7 rounded-md bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4 text-emerald-400" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-xl px-4 py-3 leading-relaxed shadow-sm ${
                  m.role === "user"
                    ? "bg-emerald-600/20 border border-emerald-500/30 text-emerald-50"
                    : "bg-zinc-900/70 border border-zinc-800 text-zinc-200"
                }`}
              >
                {/* Content formatting */}
                <div
                  className="whitespace-pre-wrap break-words prose prose-invert prose-xs"
                  dangerouslySetInnerHTML={{
                    __html: renderSafeMarkdown(m.content),
                  }}
                />

                {/* Sources badge display */}
                {m.sources && m.sources.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex flex-wrap gap-1.5 items-center">
                    <span className="text-[10px] text-zinc-500 font-mono uppercase">Verified Sources:</span>
                    {m.sources.map((s, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-zinc-800 text-emerald-400 border border-zinc-700/60"
                      >
                        <Shield className="w-2.5 h-2.5" />
                        {s.title}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-1 text-[10px] text-zinc-500 text-right font-mono">
                  {m.timestamp}
                </div>
              </div>

              {m.role === "user" && (
                <div className="w-7 h-7 rounded-md bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-zinc-400" />
                </div>
              )}
            </div>
          ))}

          {isStreaming && (
            <div className="flex gap-3 items-center text-xs text-emerald-400 font-mono">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
              <span>Copilot synthesizing threat intelligence & analyzing context...</span>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-5 py-2.5 bg-zinc-900/30 border-t border-zinc-800/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => executeSend("Explain CVE-2024-21887 and check CISA KEV exploitation")}
            className="px-2.5 py-1 rounded-full text-[11px] bg-zinc-900 text-zinc-300 border border-zinc-700 hover:border-emerald-500/50 hover:text-white shrink-0 transition-colors"
          >
            🚨 CISA KEV Exploits
          </button>
          <button
            onClick={() => executeSend("Generate safe non-destructive curl command to check for missing security headers")}
            className="px-2.5 py-1 rounded-full text-[11px] bg-zinc-900 text-zinc-300 border border-zinc-700 hover:border-emerald-500/50 hover:text-white shrink-0 transition-colors"
          >
            🛡️ Safe PoC Curl
          </button>
          <button
            onClick={() => executeSend("Summarize the latest scan results and high severity findings")}
            className="px-2.5 py-1 rounded-full text-[11px] bg-zinc-900 text-zinc-300 border border-zinc-700 hover:border-emerald-500/50 hover:text-white shrink-0 transition-colors"
          >
            🔍 Scan Summary
          </button>
          <button
            onClick={() => executeSend("How do I fix Server-Side Request Forgery (SSRF) in Python FastAPI?")}
            className="px-2.5 py-1 rounded-full text-[11px] bg-zinc-900 text-zinc-300 border border-zinc-700 hover:border-emerald-500/50 hover:text-white shrink-0 transition-colors"
          >
            💡 Remediate SSRF
          </button>
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/60">
          <div className="relative flex items-end bg-zinc-950 border border-zinc-800 rounded-xl focus-within:border-emerald-500/60 transition-colors p-2 shadow-inner">
            <textarea
              ref={inputRef}
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  executeSend(input);
                }
              }}
              placeholder="Ask Copilot (e.g. explain CVE-2024-3400, test curl PoC, remediation)..."
              className="flex-1 bg-transparent text-sm text-zinc-100 placeholder-zinc-500 outline-none resize-none px-2 py-1 max-h-32"
            />
            <button
              onClick={() => executeSend(input)}
              disabled={!input.trim() || isStreaming}
              className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white transition-all shrink-0"
              title="Send message (Enter)"
            >
              {isStreaming ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
          <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-zinc-500 font-mono">
            <span>Press Enter to send, Shift+Enter for new line</span>
            <span>Tenant-Isolated • Safe Verification Guardrails</span>
          </div>
        </div>
      </aside>
    </>
  );
}
