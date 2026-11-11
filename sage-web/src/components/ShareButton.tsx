"use client";

import { Share2, Check, AlertTriangle } from "lucide-react";
import { useState } from "react";
import posthog from "posthog-js";

interface ShareButtonProps {
  scanId: string;
}

export function ShareButton({ scanId }: ShareButtonProps) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleShare = async () => {
    setLoading(true);
    setErrorMsg(null);
    posthog.capture("viral_share_clicked", { scanId });
    try {
      const res = await fetch(`/api/scan/${scanId}/share`, { method: "POST" });
      if (!res.ok) {
        const errData = (await res.json().catch(() => ({}))) as { error?: string; detail?: string };
        throw new Error(errData.error || errData.detail || "Share link generation failed");
      }

      const { share_token } = (await res.json()) as { share_token: string };
      const shareUrl = `${window.location.origin}/report/${share_token}`;

      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (e) {
      setErrorMsg(
        e instanceof Error ? e.message : "Failed to generate share link. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inline-flex flex-col items-start gap-2">
      <button
        onClick={handleShare}
        disabled={loading}
        className={`group flex items-center gap-2 px-6 py-3 rounded-lg font-mono font-bold text-sm border transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
          ${
            copied
              ? "bg-emerald-500 text-black border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
              : "bg-emerald-900/30 border-emerald-500/40 text-emerald-400 hover:bg-emerald-800/40 hover:border-emerald-400/60 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]"
          }`}
      >
        {copied ? (
          <>
            <Check className="w-4 h-4" />
            Link Copied!
          </>
        ) : (
          <>
            <Share2
              className={`w-4 h-4 ${
                loading ? "animate-spin" : "group-hover:-translate-y-0.5"
              } transition-transform`}
            />
            {loading ? "Generating..." : "Share Report"}
          </>
        )}
      </button>
      {errorMsg && (
        <div
          role="alert"
          className="text-xs font-mono text-red-300 bg-red-950/40 border border-red-700/50 rounded-lg px-3 py-1.5 flex items-center gap-1.5"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
