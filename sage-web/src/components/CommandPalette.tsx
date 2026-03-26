"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  Scan,
  History,
  Settings,
  Shield,
  FileCheck,
  HeartPulse,
  Rss,
} from "lucide-react";

interface Command {
  id: string;
  label: string;
  icon: typeof Search;
  action: string;
  category: string;
}

const commands: Command[] = [
  { id: "dashboard", label: "Go to Dashboard", icon: LayoutDashboard, action: "/dashboard", category: "Navigation" },
  { id: "scan", label: "Run a Scan", icon: Scan, action: "/scan", category: "Navigation" },
  { id: "history", label: "View Scan History", icon: History, action: "/history", category: "Navigation" },
  { id: "settings", label: "Open Settings", icon: Settings, action: "/settings", category: "Navigation" },
  { id: "compliance", label: "Compliance Reports", icon: FileCheck, action: "/dashboard?tab=compliance", category: "Tools" },
  { id: "health", label: "System Health", icon: HeartPulse, action: "/dashboard?tab=health", category: "Tools" },
  { id: "threats", label: "Threat Feed", icon: Rss, action: "/dashboard?tab=threats", category: "Tools" },
  { id: "security", label: "Security Settings", icon: Shield, action: "/settings", category: "Settings" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        setQuery("");
        inputRef.current?.focus();
      }, 50);
    }
  }, [open]);

  const filtered = query
    ? commands.filter(
        (c) =>
          c.label.toLowerCase().includes(query.toLowerCase()) ||
          c.category.toLowerCase().includes(query.toLowerCase())
      )
    : commands;

  const runCommand = (cmd: Command) => {
    setOpen(false);
    router.push(cmd.action);
  };

  if (!open) return null;

  const categories = [...new Set(filtered.map((c) => c.category))];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl w-[520px] max-w-[95vw] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
          <Search className="w-5 h-5 text-zinc-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search commands..."
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-zinc-600"
          />
          <kbd className="text-[10px] text-zinc-600 border border-zinc-700 rounded px-1.5 py-0.5 font-mono">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-64 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-6">No matching commands</p>
          ) : (
            categories.map((cat) => (
              <div key={cat}>
                <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-wider px-3 pt-2 pb-1">{cat}</p>
                {filtered
                  .filter((c) => c.category === cat)
                  .map((cmd) => (
                    <button
                      key={cmd.id}
                      onClick={() => runCommand(cmd)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-300 hover:bg-emerald-900/20 hover:text-emerald-400 transition-colors"
                    >
                      <cmd.icon className="w-4 h-4 shrink-0" />
                      {cmd.label}
                    </button>
                  ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
