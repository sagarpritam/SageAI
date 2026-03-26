"use client";

import { useEffect } from "react";
import { AlertOctagon, RotateCcw } from "lucide-react";
import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-2xl bg-red-900/30 flex items-center justify-center mb-6">
        <AlertOctagon className="w-10 h-10 text-red-500" />
      </div>
      <h1 className="text-3xl font-black text-white mb-3">Something went wrong!</h1>
      <p className="text-zinc-400 max-w-md mx-auto mb-8">
        We encountered an unexpected error while rendering this page. The issue has been automatically logged for our team.
      </p>
      
      <div className="flex items-center gap-4">
        <button
          onClick={reset}
          className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold transition-colors"
        >
          <RotateCcw className="w-4 h-4" /> Try again
        </button>
        <Link 
          href="/dashboard"
          className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-bold transition-colors"
        >
          Return to Dashboard
        </Link>
      </div>

      {process.env.NODE_ENV === "development" && (
        <div className="mt-12 p-4 bg-black border border-red-900/50 rounded-lg text-left max-w-2xl w-full mx-auto overflow-x-auto">
          <p className="text-red-400 font-mono text-sm mb-2 font-bold">Developer Details:</p>
          <pre className="text-xs text-red-300 font-mono whitespace-pre-wrap">{error.message}</pre>
          {error.stack && (
            <pre className="text-[10px] text-zinc-500 font-mono mt-4 whitespace-pre-wrap">{error.stack}</pre>
          )}
        </div>
      )}
    </div>
  );
}
