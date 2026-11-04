"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import axios from "axios";
import { MFASettings } from "./MFASettings";
import { RBACMatrix } from "./RBACMatrix";
import { EmailReportSettings } from "./EmailReportSettings";
import { SSOConfigPanel } from "./SSOConfigPanel";

export function SecuritySettings() {
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = async () => {
    setError(""); setMessage("");
    if (newPw !== confirmPw) { setError("Passwords don't match"); return; }
    if (newPw.length < 8) { setError("Password must be at least 8 characters"); return; }

    setSaving(true);
    try {
      await axios.post("/api/auth/change-password", {
        current_password: currentPw,
        new_password: newPw,
      });
      setMessage("Password updated successfully.");
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    } catch {
      setError("Failed to update password. Check your current password.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="max-w-md space-y-6">
        <div className="bg-zinc-900/60 border border-emerald-900/30 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
            <Lock className="w-4 h-4" /> Change Password
          </h3>

          <div className="space-y-3">
            <input type={showPw ? "text" : "password"} value={currentPw} onChange={e => setCurrentPw(e.target.value)}
              placeholder="Current password"
              className="w-full bg-black/50 border border-zinc-700 rounded-lg px-4 py-2 text-white font-mono text-sm placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors" />
            <input type={showPw ? "text" : "password"} value={newPw} onChange={e => setNewPw(e.target.value)}
              placeholder="New password"
              className="w-full bg-black/50 border border-zinc-700 rounded-lg px-4 py-2 text-white font-mono text-sm placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors" />
            <input type={showPw ? "text" : "password"} value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
              placeholder="Confirm new password"
              className="w-full bg-black/50 border border-zinc-700 rounded-lg px-4 py-2 text-white font-mono text-sm placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors" />
          </div>

          <div className="flex items-center justify-between">
            <button onClick={() => setShowPw(!showPw)} className="text-zinc-500 hover:text-zinc-300 text-xs flex items-center gap-1 transition-colors">
              {showPw ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              {showPw ? "Hide" : "Show"}
            </button>
            <button onClick={handleChange} disabled={saving || !currentPw || !newPw || !confirmPw}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 text-white font-bold px-5 py-2 rounded-lg transition-colors text-sm flex items-center gap-2">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</> : "Update Password"}
            </button>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}
          {message && <p className="text-sm text-emerald-400">{message}</p>}
        </div>

        <MFASettings />
        <EmailReportSettings />
      </div>

      <SSOConfigPanel />
      <RBACMatrix />
    </div>
  );
}
