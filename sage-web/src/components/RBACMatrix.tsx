"use client";

import { Shield, Eye, Pencil, Trash2, UserPlus, Key, Scan, Settings, Bell } from "lucide-react";

interface Permission {
  label: string;
  icon: typeof Shield;
  admin: boolean;
  manager: boolean;
  analyst: boolean;
  viewer: boolean;
}

const permissions: Permission[] = [
  { label: "Run Scans", icon: Scan, admin: true, manager: true, analyst: true, viewer: false },
  { label: "View Reports", icon: Eye, admin: true, manager: true, analyst: true, viewer: true },
  { label: "Download Reports", icon: Pencil, admin: true, manager: true, analyst: true, viewer: false },
  { label: "Manage API Keys", icon: Key, admin: true, manager: true, analyst: false, viewer: false },
  { label: "Invite Members", icon: UserPlus, admin: true, manager: true, analyst: false, viewer: false },
  { label: "Change Roles", icon: Shield, admin: true, manager: false, analyst: false, viewer: false },
  { label: "Delete Scans", icon: Trash2, admin: true, manager: true, analyst: false, viewer: false },
  { label: "Org Settings", icon: Settings, admin: true, manager: false, analyst: false, viewer: false },
  { label: "Configure Webhooks", icon: Bell, admin: true, manager: true, analyst: false, viewer: false },
  { label: "View Audit Log", icon: Eye, admin: true, manager: true, analyst: false, viewer: false },
];

const roles = ["admin", "manager", "analyst", "viewer"] as const;
type Role = (typeof roles)[number];

const roleColors: Record<Role, string> = {
  admin: "text-red-400 bg-red-400/10",
  manager: "text-amber-400 bg-amber-400/10",
  analyst: "text-emerald-400 bg-emerald-400/10",
  viewer: "text-blue-400 bg-blue-400/10",
};

export function RBACMatrix() {
  return (
    <div className="bg-zinc-900/60 border border-emerald-900/30 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-800 flex items-center gap-2">
        <Shield className="w-5 h-5 text-emerald-400" />
        <h3 className="text-sm font-bold text-white">Role-Based Access Control</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left px-6 py-3 text-xs text-zinc-500 font-mono uppercase tracking-wider w-48">
                Permission
              </th>
              {roles.map((role) => (
                <th key={role} className="px-4 py-3 text-center">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold capitalize ${roleColors[role]}`}
                  >
                    {role}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {permissions.map((perm, i) => (
              <tr
                key={perm.label}
                className={`border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors ${
                  i % 2 === 0 ? "" : "bg-zinc-900/30"
                }`}
              >
                <td className="px-6 py-3 flex items-center gap-2 text-zinc-300">
                  <perm.icon className="w-4 h-4 text-zinc-500" />
                  {perm.label}
                </td>
                {roles.map((role) => {
                  const allowed = perm[role];
                  return (
                    <td key={role} className="px-4 py-3 text-center">
                      {allowed ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                          ✓
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800/50 text-zinc-600 text-xs">
                          —
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
