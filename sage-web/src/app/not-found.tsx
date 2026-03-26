import Link from "next/link";
import { SearchX, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 rounded-full border border-zinc-800 bg-zinc-900/50 flex items-center justify-center mb-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent" />
        <SearchX className="w-10 h-10 text-zinc-400 relative z-10" />
      </div>
      
      <h1 className="text-4xl font-black tracking-tight text-white mb-4">404 - Page Not Found</h1>
      <p className="text-zinc-400 max-w-md mx-auto mb-8 leading-relaxed">
        The requested resource could not be found. It may have been moved, deleted, or you might not have access to view it.
      </p>
      
      <Link 
        href="/dashboard"
        className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Safety
      </Link>
    </div>
  );
}
