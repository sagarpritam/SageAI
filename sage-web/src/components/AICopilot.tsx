"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, User, Send, Loader2, Sparkles } from "lucide-react";
import axios from "axios";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function AICopilot({ scanId }: { scanId?: string }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "I'm your **AI Security Copilot**. Ask me about vulnerabilities, remediation strategies, or paste any scan context for analysis." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const msg = input.trim();
    if (!msg || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setLoading(true);

    try {
      const r = await axios.post("/api/ai/chat", {
        message: msg,
        context: scanId ? { scan_id: scanId } : undefined,
      });
      setMessages((prev) => [...prev, { role: "assistant", content: r.data.reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ AI unavailable. Check that the backend is running and NVIDIA_API_KEY is configured." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-zinc-950/60 border border-emerald-900/30 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-emerald-400" />
        <span className="text-sm font-bold text-white">SageAI Copilot</span>
        {scanId && <span className="text-[10px] text-zinc-500 font-mono ml-auto">Scan: {scanId.substring(0, 8)}…</span>}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
            {m.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-emerald-900/50 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4 text-emerald-400" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
              m.role === "user"
                ? "bg-emerald-600/20 border border-emerald-700/40 text-emerald-100"
                : "bg-zinc-900/60 border border-zinc-800 text-zinc-200"
            }`}>
              <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{
                __html: m.content
                  .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
                  .replace(/`(.*?)`/g, '<code class="bg-zinc-800 px-1 rounded text-emerald-300 text-xs">$1</code>')
                  .replace(/\n/g, "<br/>")
              }} />
            </div>
            {m.role === "user" && (
              <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4 text-zinc-400" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-emerald-900/50 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-emerald-400 animate-pulse" />
            </div>
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3">
              <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-zinc-800">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Ask about vulnerabilities, remediation, OWASP..."
            className="flex-1 bg-black/50 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-white font-mono placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            aria-label="Send message"
            className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
