"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface ScanInputProps {
  onStartScan: (target: string) => void;
  isLoading: boolean;
}

export function ScanInput({ onStartScan, isLoading }: ScanInputProps) {
  const [target, setTarget] = useState("");

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleaned = target.trim();
    if (!cleaned || isLoading) return;

    // Sanitize input: reject malicious script injections, control chars, or oversized strings
    if (/[<>'"`;\(\)\{\}\[\]\\]/.test(cleaned) || /[\x00-\x1F\x7F]/.test(cleaned)) {
      setError("Invalid characters detected. Please enter a valid domain or URL.");
      return;
    }
    if (cleaned.length > 253) {
      setError("Target exceeds maximum allowed length (253 characters).");
      return;
    }

    onStartScan(cleaned);
  };

  return (
    <div className="flex flex-col w-full max-w-2xl space-y-2">
      <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
        <Input 
          type="text" 
          placeholder="Enter domain (e.g. example.com)" 
          value={target}
          onChange={(e) => {
            setTarget(e.target.value);
            if (error) setError(null);
          }}
          disabled={isLoading}
          className="font-mono bg-black/50 border-emerald-500/30 text-emerald-50 placeholder:text-emerald-500/50 py-6 focus-visible:ring-emerald-500/50"
        />
        <Button 
          type="submit" 
          disabled={isLoading || !target.trim()} 
          className="py-6 px-8 bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all"
        >
          {isLoading ? (
            <span className="animate-pulse">Scanning...</span>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" /> Start Scan
            </>
          )}
        </Button>
      </form>
      {error && (
        <div
          role="alert"
          className="text-rose-400 text-xs font-mono px-1 flex items-center gap-1.5 animate-in fade-in duration-200"
        >
          <span>⚠️</span> {error}
        </div>
      )}
    </div>
  );
}
