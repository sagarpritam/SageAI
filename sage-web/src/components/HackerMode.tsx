"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";

interface HackerModeProps {
  logs: string[];
  isScanning: boolean;
}

export function HackerMode({ logs, isScanning }: HackerModeProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [displayedLogs, setDisplayedLogs] = useState<string[]>([]);

  useEffect(() => {
    // Reveal logs one by one for a hacking effect
    if (logs.length > displayedLogs.length) {
      const timer = setTimeout(() => {
        setDisplayedLogs(logs.slice(0, displayedLogs.length + 1));
      }, 150); // 150ms delay per new log line
      return () => clearTimeout(timer);
    }
  }, [logs, displayedLogs]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [displayedLogs]);

  return (
    <div className="w-full max-w-4xl mx-auto rounded-lg border border-emerald-900/50 bg-black overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.15)]">
      <div className="flex items-center px-4 py-2 border-b border-emerald-900/50 bg-zinc-950/50">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
        </div>
        <div className="mx-auto text-xs font-mono text-emerald-500/50">root@sage-ai:~# pentest</div>
      </div>
      
      <ScrollArea className="h-[400px] w-full p-4 font-mono text-sm text-emerald-400 bg-black/90">
        <div ref={scrollRef} className="space-y-1">
          {displayedLogs.map((log, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="break-all"
            >
              {log.includes("[!]") ? (
                <span className="text-red-400">{log}</span>
              ) : log.includes("[+]") ? (
                <span className="text-emerald-400">{log}</span>
              ) : (
                <span className="text-emerald-500/80">{log}</span>
              )}
            </motion.div>
          ))}
          {isScanning && (
            <motion.div 
              animate={{ opacity: [1, 0, 1] }} 
              transition={{ repeat: Infinity, duration: 1 }}
              className="h-4 w-2 bg-emerald-400 inline-block mt-2"
            />
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
