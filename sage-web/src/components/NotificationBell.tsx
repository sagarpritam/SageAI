"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, X, Shield, Scan, AlertTriangle, CheckCircle } from "lucide-react";
import axios from "axios";

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const typeIcons: Record<string, typeof Shield> = {
  scan_completed: CheckCircle,
  scan_failed: AlertTriangle,
  security_alert: Shield,
  autofix: Scan,
};

const typeColors: Record<string, string> = {
  scan_completed: "text-emerald-400",
  scan_failed: "text-red-400",
  security_alert: "text-amber-400",
  autofix: "text-blue-400",
};

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    axios
      .get("/api/notifications")
      .then((r) => setNotifications(Array.isArray(r.data) ? r.data : []))
      .catch(() => {});
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unread = notifications.filter((n) => !n.is_read).length;

  const markRead = async (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    try {
      await axios.post(`/api/notifications?action=read&id=${id}`);
    } catch {}
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
            <h4 className="text-sm font-bold text-white">Notifications</h4>
            <button onClick={() => setOpen(false)} className="text-zinc-500 hover:text-zinc-300" aria-label="Close notifications">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-zinc-500 text-sm">No notifications</div>
            ) : (
              notifications.slice(0, 15).map((n) => {
                const Icon = typeIcons[n.type] || Bell;
                const color = typeColors[n.type] || "text-zinc-400";
                return (
                  <div
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className={`px-4 py-3 border-b border-zinc-800/50 hover:bg-zinc-800/40 cursor-pointer transition-colors ${
                      !n.is_read ? "bg-emerald-950/10" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${color}`} />
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-medium ${n.is_read ? "text-zinc-400" : "text-white"}`}>
                          {n.title}
                        </p>
                        <p className="text-xs text-zinc-500 mt-0.5 truncate">{n.message}</p>
                        <p className="text-[10px] text-zinc-600 mt-1">
                          {new Date(n.created_at).toLocaleString()}
                        </p>
                      </div>
                      {!n.is_read && <span className="w-2 h-2 bg-emerald-400 rounded-full shrink-0 mt-1.5" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
