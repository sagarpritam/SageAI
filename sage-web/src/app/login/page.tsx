"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, Key, Mail, ShieldAlert, Zap, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMfa, setShowMfa] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    mfa_code: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Authentication failed");

      // Success!
      router.push("/dashboard");
      router.refresh(); // Force middleware check
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err.message === "mfa_required") {
        setShowMfa(true);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06080F] flex flex-col items-center justify-center p-6 bg-[url('/grid-pattern.svg')] relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
            <ShieldAlert className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Sage<span className="text-emerald-400">AI</span>
          </h1>
          <p className="text-slate-400 text-sm mt-2 font-medium">
            Autonomous Threat Intelligence
          </p>
        </div>

        {/* Auth Box */}
        <div className="bg-[#0D111C]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle gradient border effect */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

          <h2 className="text-xl font-semibold text-white mb-6">
            {isLogin ? "Welcome Back" : "Initialize Access"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!showMfa ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Operator Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono text-sm"
                      placeholder="admin@sageai.internal"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                    <Mail className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Decryption Key
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono text-sm"
                      placeholder="••••••••••••"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                    />
                    <Key className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  MFA Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    className="w-full bg-black/40 border border-emerald-900/50 rounded-xl py-3 px-4 text-white text-center font-mono text-xl tracking-[0.5em] placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                    placeholder="000000"
                    value={formData.mfa_code}
                    onChange={(e) =>
                      setFormData({ ...formData, mfa_code: e.target.value })
                    }
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                {error === "mfa_required" ? "Please enter your multi-factor authentication code." : error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold py-3 rounded-xl transition-all duration-200 shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : showMfa ? (
                <>
                  <ShieldAlert className="w-5 h-5" /> Verify Identity
                </>
              ) : isLogin ? (
                <>
                  <LogIn className="w-5 h-5" /> Authenticate
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" /> Generate Keypair
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-white/5 pt-6">
            <p className="text-slate-400 text-sm">
              {isLogin ? "No active clearance?" : "Already cleared?"}{" "}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                }}
                className="text-emerald-400 hover:text-emerald-300 font-medium hover:underline transition-colors"
              >
                {isLogin ? "Request Access" : "Authenticate Here"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
