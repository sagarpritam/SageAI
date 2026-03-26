"use client";

import { useState } from "react";
import { ShieldCheck, Loader2, Key } from "lucide-react";
import axios from "axios";

interface MFASetup {
  secret: string;
  qr_code: string;
  backup_codes: string[];
}

export function MFASettings() {
  const [setupData, setSetupData] = useState<MFASetup | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSetup = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.post("/api/mfa?action=setup");
      setSetupData(data);
    } catch {
      setError("Failed to initiate MFA setup.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    setError("");
    try {
      await axios.post("/api/mfa?action=verify", { code });
      setMfaEnabled(true);
      setSetupData(null);
      setMessage("MFA activated successfully.");
      setCode("");
    } catch {
      setError("Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    if (!code) {
      setError("Enter a TOTP code to disable MFA.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await axios.post("/api/mfa?action=disable", { code });
      setMfaEnabled(false);
      setMessage("MFA has been disabled.");
      setCode("");
    } catch {
      setError("Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900/60 border border-emerald-900/30 rounded-xl p-6">
      <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2 mb-4">
        <ShieldCheck className="w-4 h-4" /> Multi-Factor Authentication
      </h3>

      {!mfaEnabled && !setupData && (
        <div className="space-y-4">
          <p className="text-sm text-zinc-400">
            Secure your account with 2FA. You will need an authenticator app (e.g., Google Authenticator, Authy).
          </p>
          <button onClick={handleSetup} disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 text-white font-bold px-5 py-2 rounded-lg transition-colors text-sm flex items-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />} Enable MFA
          </button>
        </div>
      )}

      {setupData && !mfaEnabled && (
        <div className="space-y-4">
          <p className="text-sm text-zinc-400">1. Scan this QR code with your authenticator app:</p>
          <div className="bg-white p-4 rounded-xl inline-block mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`data:image/png;base64,${setupData.qr_code}`} alt="MFA QR Code" className="w-40 h-40" />
          </div>

          <p className="text-sm text-zinc-400">2. Save these backup codes in a secure place:</p>
          <div className="bg-black/50 border border-amber-900/50 rounded-lg p-3">
            <code className="text-amber-400 font-mono text-xs whitespace-pre-wrap leading-relaxed tracking-widest">
              {setupData.backup_codes.join("   ")}
            </code>
          </div>

          <p className="text-sm text-zinc-400">3. Enter the 6-digit code from your app to verify setup:</p>
          <div className="flex gap-3 max-w-sm">
            <input type="text" value={code} onChange={e => setCode(e.target.value)} placeholder="000000"
              className="flex-1 bg-black/50 border border-zinc-700 rounded-lg px-4 py-2 text-white font-mono text-sm tracking-widest placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors" />
            <button onClick={handleVerify} disabled={loading || code.length < 6}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 text-white font-bold px-5 py-2 rounded-lg transition-colors text-sm">
              {loading ? "Verifying..." : "Verify"}
            </button>
          </div>
        </div>
      )}

      {mfaEnabled && (
        <div className="space-y-4">
          <div className="bg-emerald-900/20 border border-emerald-800/40 rounded-lg p-3 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <p className="text-sm text-emerald-400 font-bold">MFA is active</p>
          </div>
          <p className="text-sm text-zinc-400">Enter a code from your authenticator app to disable MFA.</p>
          <div className="flex gap-3 max-w-sm">
            <input type="text" value={code} onChange={e => setCode(e.target.value)} placeholder="000000"
              className="flex-1 bg-black/50 border border-zinc-700 rounded-lg px-4 py-2 text-white font-mono text-sm tracking-widest placeholder:text-zinc-600 focus:outline-none focus:border-red-500 transition-colors" />
            <button onClick={handleDisable} disabled={loading || code.length < 6}
              className="bg-red-600/80 hover:bg-red-500 disabled:bg-zinc-700 text-white font-bold px-5 py-2 rounded-lg transition-colors text-sm">
              {loading ? "Disabling..." : "Disable"}
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-400 mt-4">{error}</p>}
      {message && <p className="text-sm text-emerald-400 mt-4">{message}</p>}
    </div>
  );
}
