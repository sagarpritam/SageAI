import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center">
      <div className="p-4 bg-emerald-900/10 rounded-2xl border border-emerald-900/30 relative">
        <div className="absolute inset-0 bg-emerald-500/10 blur-xl rounded-full" />
        <Loader2 className="w-10 h-10 text-emerald-400 animate-spin relative z-10" />
      </div>
      <p className="mt-4 text-sm font-mono text-emerald-500/70 animate-pulse">
        Initializing Secure Connection...
      </p>
    </div>
  );
}
