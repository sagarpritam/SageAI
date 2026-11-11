"use client";

import { useState, useEffect } from "react";
import { Clock, Plus, Trash2, RefreshCw, AlertCircle } from "lucide-react";
import axios from "axios";

interface Schedule {
  id: string;
  target: string;
  frequency: string;
  is_active: boolean;
  run_count?: number;
  last_run_at?: string;
  next_run_at?: string;
}

export function ScheduleManager() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTarget, setNewTarget] = useState("");
  const [newFreq, setNewFreq] = useState("weekly");
  const [creating, setCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchSchedules = () => {
    setLoading(true);
    axios
      .get("/api/schedules")
      .then((r) => setSchedules(Array.isArray(r.data) ? r.data : []))
      .catch(() => setSchedules([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSchedules(); }, []);

  const handleCreate = async () => {
    if (!newTarget.trim()) return;
    setCreating(true);
    setErrorMsg(null);
    try {
      await axios.post("/api/schedules", { target: newTarget, frequency: newFreq });
      setNewTarget("");
      fetchSchedules();
    } catch (e: unknown) {
      const msg = axios.isAxiosError(e)
        ? e.response?.data?.detail || e.response?.data?.error || e.message
        : e instanceof Error
        ? e.message
        : "Failed to create schedule";
      setErrorMsg(msg);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    setErrorMsg(null);
    try {
      await axios.delete(`/api/schedules?id=${id}`);
      fetchSchedules();
    } catch (e: unknown) {
      const msg = axios.isAxiosError(e)
        ? e.response?.data?.detail || e.response?.data?.error || "Failed to delete schedule"
        : "Failed to delete schedule";
      setErrorMsg(msg);
    }
  };

  const freqColors: Record<string, string> = {
    daily: "bg-red-900/40 text-red-400",
    weekly: "bg-amber-900/40 text-amber-400",
    monthly: "bg-blue-900/40 text-blue-400",
  };

  return (
    <div className="space-y-6">
      {/* Create Form */}
      <div className="bg-zinc-900/60 border border-emerald-900/30 rounded-xl p-5">
        <h3 className="text-sm font-bold text-emerald-400 mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Schedule Recurring Scan
        </h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={newTarget}
            onChange={(e) => setNewTarget(e.target.value)}
            placeholder="example.com"
            className="flex-1 bg-black/50 border border-zinc-700 rounded-lg px-4 py-2 text-white font-mono text-sm placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
          />
          <select aria-label="Filter schedules"
            value={newFreq}
            onChange={(e) => setNewFreq(e.target.value)}
            className="bg-black/50 border border-zinc-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <button
            onClick={handleCreate}
            disabled={creating || !newTarget.trim()}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 text-white font-bold px-5 py-2 rounded-lg transition-colors text-sm"
          >
            {creating ? "Creating..." : "Add"}
          </button>
        </div>
        {errorMsg && (
          <div
            role="alert"
            className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-red-500/40 bg-red-950/50 px-3 py-2 text-xs text-red-300"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMsg(null)}
              className="text-red-300/80 hover:text-red-200 font-semibold shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* Schedule List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-zinc-400 flex items-center gap-2">
            <Clock className="w-4 h-4" /> Active Schedules
          </h3>
          <button onClick={fetchSchedules} className="text-zinc-500 hover:text-emerald-400 transition-colors" aria-label="Refresh schedules">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        {loading ? (
          <p className="text-zinc-500 font-mono text-sm animate-pulse">Loading schedules...</p>
        ) : schedules.length === 0 ? (
          <p className="text-zinc-600 font-mono text-sm">No scheduled scans yet. Add one above.</p>
        ) : (
          <div className="space-y-2">
            {schedules.map((s) => (
              <div key={s.id} className="flex items-center justify-between bg-zinc-900/40 border border-zinc-800 rounded-lg px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-white font-mono text-sm truncate">{s.target}</p>
                  <p className="text-xs text-zinc-500">
                    Runs: {s.run_count || 0} · Last: {s.last_run_at ? new Date(s.last_run_at).toLocaleDateString() : "never"}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span className={`text-xs font-bold px-2 py-1 rounded ${freqColors[s.frequency] || "bg-zinc-800 text-zinc-400"}`}>
                    {s.frequency}
                  </span>
                  <button onClick={() => handleDelete(s.id)} className="text-zinc-600 hover:text-red-400 transition-colors" aria-label="Delete schedule">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
