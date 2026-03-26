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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (target.trim() && !isLoading) {
      onStartScan(target.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-2xl items-center space-x-2">
      <Input 
        type="text" 
        placeholder="Enter domain (e.g. example.com)" 
        value={target}
        onChange={(e) => setTarget(e.target.value)}
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
  );
}
