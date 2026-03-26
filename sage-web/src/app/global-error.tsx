"use client";

import { AlertOctagon, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error("Global Layout Error:", error);
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-black text-emerald-50 min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <div className="w-20 h-20 rounded-2xl bg-red-900/30 flex items-center justify-center mx-auto mb-6">
            <AlertOctagon className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-3xl font-black text-white mb-3">Critical Error</h1>
          <p className="text-zinc-400 max-w-md mx-auto mb-8">
            A fatal error occurred at the layout level. 
          </p>
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Recover Application
          </button>
        </div>
      </body>
    </html>
  );
}
