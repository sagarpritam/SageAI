"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, Shield, UserCog, Lock } from "lucide-react";
import axios from "axios";

interface TeamUser {
  id: string;
  email: string;
  role: string;
  created_at?: string;
}

export function TeamManager() {
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<string | null>(null);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    axios.get("/api/org?action=users")
      .then(r => setUsers(Array.isArray(r.data) ? r.data : []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    axios.get("/api/org?action=plan")
      .then(r => {
        const p = r.data?.plan || "free";
        setPlan(p);
        if (p !== "free") fetchUsers();
        else setLoading(false);
      })
      .catch(() => {
        setPlan("free");
        setLoading(false);
      });
  }, [fetchUsers]);

  const updateRole = async (userId: string, newRole: string) => {
    try {
      await axios.patch("/api/org", { user_id: userId, role: newRole });
      fetchUsers();
    } catch {
      alert("Failed to update role");
    }
  };

  // Upgrade wall for free users
  if (plan === "free") {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
          <Lock className="w-8 h-8 text-zinc-500" />
        </div>
        <h3 className="text-xl font-black text-white">Team Management is a Pro Feature</h3>
        <p className="text-sm text-zinc-400 max-w-md">
          Invite team members, assign roles, and collaborate on security scans — available on the Pro and Enterprise plans.
        </p>
        <a
          href="/pricing"
          className="inline-block px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 rounded-lg font-bold text-white transition-all"
        >
          Upgrade Now →
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-zinc-400 flex items-center gap-2">
        <Users className="w-4 h-4 text-emerald-400" /> Team Members
      </h3>
      {loading ? (
        <p className="text-zinc-500 font-mono text-sm animate-pulse">Loading team...</p>
      ) : users.length === 0 ? (
        <p className="text-zinc-600 font-mono text-sm">No team members found.</p>
      ) : (
        <div className="space-y-2">
          {users.map(u => (
            <div key={u.id} className="flex items-center justify-between bg-zinc-900/40 border border-zinc-800 rounded-lg px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-900/40 flex items-center justify-center">
                  {u.role === "admin" ? <Shield className="w-4 h-4 text-amber-400" /> : <UserCog className="w-4 h-4 text-zinc-400" />}
                </div>
                <div>
                  <p className="text-sm text-white font-mono">{u.email}</p>
                  <p className="text-[10px] text-zinc-500">Joined {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}</p>
                </div>
              </div>
              <select aria-label="Role"
                value={u.role}
                onChange={e => updateRole(u.id, e.target.value)}
                className="bg-black/50 border border-zinc-700 rounded px-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              >
                <option value="admin">Admin</option>
                <option value="member">Member</option>
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

