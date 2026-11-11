"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  ComposableMap, 
  Geographies, 
  Geography, 
  Graticule, 
  Marker 
} from "react-simple-maps";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, 
  Zap, 
  AlertTriangle, 
  Target, 
  Activity, 
  Info,
  Maximize2,
  Minimize2,
  Terminal,
  Globe,
  Wifi,
  CloudLightning,
  Loader2,
  CheckCircle,
  XCircle,
  Radio
} from "lucide-react";
import axios from "axios";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

/* ──────────────────────────────────────── Types ──── */

interface GeoCoord {
  lat: number;
  lng: number;
  city?: string;
  country?: string;
}

interface WarRoomEvent {
  id: string;
  type: string;
  source: string;
  timestamp: string;
  priority: number;
  payload: {
    geo?: GeoCoord;
    message?: string;
    description?: string;
    [key: string]: any;
  };
  target?: string;
}

/* ──────────────────────────────────────── Helpers ──── */

const getPriorityColor = (p: number) => {
  switch (p) {
    case 4: return "text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]";
    case 3: return "text-orange-500";
    case 2: return "text-blue-500";
    default: return "text-zinc-500";
  }
};

const getEventIcon = (type: string) => {
  switch (type) {
    case "exploit.success": return <Zap className="w-4 h-4 text-amber-500" />;
    case "exploit.attempt": return <Target className="w-4 h-4 text-red-500/70" />;
    case "finding.discovered": return <AlertTriangle className="w-4 h-4 text-orange-400" />;
    case "scan.started": return <Wifi className="w-4 h-4 text-blue-400" />;
    case "scan.completed": return <Shield className="w-4 h-4 text-emerald-400" />;
    default: return <Info className="w-4 h-4 text-zinc-500" />;
  }
};

/* ──────────────────────────────────────── Main Component ──── */

export function WarRoom() {
  const [events, setEvents] = useState<WarRoomEvent[]>([]);
  const [pulses, setPulses] = useState<{ from: [number, number], to: [number, number], id: string }[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [healingEvents, setHealingEvents] = useState<Record<string, 'running' | 'success' | 'error'>>({});
  const [simulating, setSimulating] = useState(false);
  const [pulseError, setPulseError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pulseTimersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  const handleHealNow = async (event: WarRoomEvent) => {
    if (!event.target) return;
    setHealingEvents(prev => ({ ...prev, [event.id]: 'running' }));
    try {
      await axios.post("/api/autofix", {
        repository: event.target,
        branch: "main",
        max_fixes: 1,
      });
      setHealingEvents(prev => ({ ...prev, [event.id]: 'success' }));
    } catch {
      setHealingEvents(prev => ({ ...prev, [event.id]: 'error' }));
    }
  };

  const handleNewEvent = (event: WarRoomEvent) => {
    setEvents(prev => [event, ...prev.filter(e => e.id !== event.id)].slice(0, 50));

    // If it's an exploit or critical finding, pulse it on the map
    if (event.payload?.geo) {
      const newPulse = {
        from: [0, 0] as [number, number],
        to: [event.payload.geo.lng, event.payload.geo.lat] as [number, number],
        id: Math.random().toString(36).substring(7)
      };
      setPulses(prev => [...prev, newPulse]);
      const timer = setTimeout(() => {
        pulseTimersRef.current.delete(timer);
        setPulses(prev => prev.filter(p => p.id !== newPulse.id));
      }, 5000);
      pulseTimersRef.current.add(timer);
    }
  };

  const handleSimulatePulse = async () => {
    setSimulating(true);
    setPulseError(null);
    try {
      await axios.post("/api/warroom", {
        type: "exploit.attempt",
        source: "AutonomousRedTeam",
        target: "perimeter-gateway.range.io",
        priority: 4,
        payload: {
          message: "Simulated APT Threat Drill: Cloud IMDS & OAuth Hijack probe dispatched.",
          description: "High-intensity adversarial probe packet broadcasted to telemetry grid.",
        },
      });
      const res = await axios.get("/api/warroom");
      const list = res.data?.events || [];
      if (Array.isArray(list) && list.length > 0) {
        setEvents(list.slice(0, 50));
        handleNewEvent(list[0]);
      }
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data as { error?: string; detail?: string } | undefined)?.error ||
          (err.response?.data as { error?: string; detail?: string } | undefined)?.detail ||
          err.message
        : err instanceof Error
        ? err.message
        : "Failed to dispatch simulated telemetry pulse.";
      setPulseError(msg || "Failed to dispatch simulated telemetry pulse.");
    } finally {
      setSimulating(false);
    }
  };

  // Hybrid WebSocket + HTTP Polling Connection
  useEffect(() => {
    let pollInterval: NodeJS.Timeout | null = null;
    let unmounted = false;
    const pulseTimers = pulseTimersRef.current;

    const fetchHttpEvents = async () => {
      try {
        const res = await axios.get("/api/warroom");
        if (unmounted) return;
        const list = res.data?.events || [];
        if (Array.isArray(list) && list.length > 0) {
          setEvents(list.slice(0, 50));
          setIsConnected(true);
        }
      } catch {
        // Fallback polling error
      }
    };

    fetchHttpEvents();

    const connectWs = () => {
      if (unmounted) return;
      try {
        const wsHost = process.env.NEXT_PUBLIC_WS_URL || 
          `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}/ws/warroom`;
        const ws = new WebSocket(wsHost);
        wsRef.current = ws;

        ws.onopen = () => {
          if (unmounted) {
            ws.close();
            return;
          }
          setIsConnected(true);
          if (pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
          }
        };

        ws.onmessage = (e) => {
          if (unmounted) return;
          try {
            const data = JSON.parse(e.data);
            if (data.type === "rehydration") {
              setEvents(data.data.slice(-50));
            } else {
              handleNewEvent(data);
            }
          } catch {}
        };

        ws.onclose = () => {
          if (unmounted) return;
          if (!pollInterval) {
            pollInterval = setInterval(fetchHttpEvents, 4000);
          }
          if (reconnectTimerRef.current) {
            clearTimeout(reconnectTimerRef.current);
          }
          reconnectTimerRef.current = setTimeout(connectWs, 8000);
        };

        ws.onerror = () => {
          if (unmounted) return;
          if (!pollInterval) {
            pollInterval = setInterval(fetchHttpEvents, 4000);
          }
        };
      } catch {
        if (!unmounted && !pollInterval) {
          pollInterval = setInterval(fetchHttpEvents, 4000);
        }
      }
    };

    connectWs();

    return () => {
      unmounted = true;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      if (pollInterval) {
        clearInterval(pollInterval);
      }
      pulseTimers.forEach((timer) => clearTimeout(timer));
      pulseTimers.clear();
      if (wsRef.current) {
        wsRef.current.onopen = null;
        wsRef.current.onmessage = null;
        wsRef.current.onclose = null;
        wsRef.current.onerror = null;
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  return (
    <div className={`relative flex flex-col bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden transition-all duration-500 ${isFullScreen ? "fixed inset-4 z-50 shadow-2xl" : "h-[600px]"}`}>
      
      {/* Header Bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-zinc-900/50 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="relative">
             <Globe className={`w-5 h-5 ${isConnected ? "text-emerald-500" : "text-amber-500"}`} />
             {isConnected && (
               <motion.span 
                 className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full"
                 animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                 transition={{ repeat: Infinity, duration: 2 }}
               />
             )}
          </div>
          <div>
            <h2 className="text-lg font-black text-white tracking-tight uppercase flex items-center gap-2">
              War Room: Global Telemetry
            </h2>
            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest leading-none">
              {isConnected ? "Live Telemetry Feed [TX/RX Connected]" : "Connecting to Event Mesh..."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex gap-6">
            <Metric title="PULSES" value={pulses.length} icon={<CloudLightning className="w-3 h-3 text-amber-500" />} />
            <Metric title="TOTAL" value={events.length} icon={<Activity className="w-3 h-3 text-blue-500" />} />
          </div>

          <button
            type="button"
            onClick={handleSimulatePulse}
            disabled={simulating}
            className="px-3 py-1.5 rounded-lg text-xs font-bold font-mono bg-red-950/70 hover:bg-red-900/70 text-red-300 border border-red-700/60 transition-all flex items-center gap-1.5 shadow-sm"
          >
            {simulating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Radio className="w-3.5 h-3.5 text-red-400" />}
            Simulate Pulse
          </button>

          <button 
            type="button"
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors"
            aria-label={isFullScreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {pulseError && (
        <div
          role="alert"
          className="px-6 py-2.5 bg-red-950/40 border-b border-red-800/60 text-xs font-mono text-red-300 flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{pulseError}</span>
          </div>
          <button
            type="button"
            onClick={() => setPulseError(null)}
            className="text-red-400 hover:text-red-200 underline text-[11px]"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Main Map Area */}
        <div className="flex-[3] relative bg-[#09090b] overflow-hidden">
          {/* Legend Overlay */}
          <div className="absolute top-6 left-6 p-4 bg-black/60 backdrop-blur-md rounded-xl border border-zinc-800 z-10 space-y-2">
             <LegendItem label="Exploit Success" color="bg-amber-500" />
             <LegendItem label="Critical Discovery" color="bg-red-500" />
             <LegendItem label="Active Scanning" color="bg-blue-500" />
          </div>

          {/* Grid Background */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none grid-bg" />

          <ComposableMap 
            projectionConfig={{ rotate: [-10, 0, 0], scale: 147 }} 
            className="w-full h-full"
          >
            <Graticule stroke="#18181b" strokeWidth={0.5} />
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#18181b"
                    stroke="#27272a"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none" },
                      hover: { fill: "#27272a", outline: "none" },
                      pressed: { outline: "none" },
                    }}
                  />
                ))
              }
            </Geographies>

            {/* Map Markers for Events */}
            {events.map((e) => {
              if (!e.payload?.geo?.lng || !e.payload?.geo?.lat) return null;
              return (
                <Marker key={e.id} coordinates={[e.payload.geo.lng, e.payload.geo.lat]}>
                  <g>
                    <circle
                      r={e.priority === 4 ? 6 : 4}
                      className={
                        e.type === "exploit.success"
                          ? "fill-amber-500"
                          : e.priority === 4
                          ? "fill-red-500"
                          : "fill-blue-500"
                      }
                      opacity={0.8}
                    />
                    <motion.circle
                      r={14}
                      className={
                        e.priority === 4 ? "stroke-red-500" : "stroke-amber-500"
                      }
                      fill="none"
                      strokeWidth={1.5}
                      initial={{ scale: 0.5, opacity: 1 }}
                      animate={{ scale: 2, opacity: 0 }}
                      transition={{ repeat: Infinity, duration: 2.5, ease: "easeOut" }}
                    />
                  </g>
                </Marker>
              );
            })}
          </ComposableMap>
        </div>

        {/* Live Attack Ticker Sidebar */}
        <div className="flex-[1.4] flex flex-col bg-zinc-950/80 border-t lg:border-t-0 lg:border-l border-zinc-800 overflow-hidden">
          <div className="px-4 py-3 bg-zinc-900/40 border-b border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-zinc-400 flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              THREAT_FEED.STREAM
            </span>
            <span className="text-[10px] font-mono text-zinc-500 uppercase">
              {events.length} EVENTS BUFFERED
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
            <AnimatePresence initial={false}>
              {events.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-600 font-mono text-xs">
                  <Activity className="w-8 h-8 mb-2 opacity-20" />
                  WAITING FOR TELEMETRY...
                </div>
              ) : (
                events.map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-3 bg-zinc-900/40 hover:bg-zinc-900/70 rounded-xl border border-zinc-800/80 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                       <div className="mt-0.5 p-1 bg-black/40 rounded-lg border border-zinc-800">
                          {getEventIcon(event.type)}
                       </div>
                       <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                             <span className="text-[10px] font-mono text-zinc-500 uppercase">
                                {event.source}
                             </span>
                             <span className="text-[9px] text-zinc-600 font-mono">
                                {new Date(event.timestamp).toLocaleTimeString([], { hour12: false })}
                             </span>
                          </div>
                          <p className={`text-xs font-bold leading-tight line-clamp-2 ${getPriorityColor(event.priority)}`}>
                             {event.payload?.message || event.type.replace(/\./g, ' ').toUpperCase()}
                          </p>
                          {event.target && (
                             <div className="mt-2 flex items-center justify-between">
                               <p className="text-[10px] text-zinc-500 flex items-center gap-1 font-mono truncate max-w-[150px]">
                                  <Target className="w-2.5 h-2.5 shrink-0" /> {event.target}
                                </p>
                                {event.type === "finding.discovered" && (
                                  <button
                                    type="button"
                                    onClick={() => handleHealNow(event)}
                                    disabled={healingEvents[event.id] === 'running' || healingEvents[event.id] === 'success'}
                                    className={`text-[9px] px-2 py-1 rounded uppercase font-bold tracking-widest transition-colors flex items-center gap-1
                                      ${healingEvents[event.id] === 'success' ? 'bg-emerald-500/20 text-emerald-400' 
                                      : healingEvents[event.id] === 'error' ? 'bg-red-500/20 text-red-400'
                                      : healingEvents[event.id] === 'running' ? 'bg-zinc-800 text-zinc-500'
                                      : 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40 border border-emerald-500/30'}`}
                                  >
                                    {healingEvents[event.id] === 'running' ? (
                                      <><Loader2 className="w-2 h-2 animate-spin" /> Healing</>
                                    ) : healingEvents[event.id] === 'success' ? (
                                      <><CheckCircle className="w-2 h-2" /> Healed</>
                                    ) : healingEvents[event.id] === 'error' ? (
                                      <><XCircle className="w-2 h-2" /> Failed</>
                                    ) : (
                                      <><Shield className="w-2 h-2" /> Heal Now</>
                                    )}
                                  </button>
                                )}
                             </div>
                          )}
                       </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3f3f46;
        }
        .grid-bg {
          background-image: radial-gradient(#fff 1px, transparent 1px);
          background-size: 32px 32px;
        }
      `}</style>
    </div>
  );
}

function Metric({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[9px] text-zinc-500 font-bold tracking-tighter flex items-center gap-1">
        {icon} {title}
      </span>
      <span className="text-sm font-black text-white leading-none mt-0.5">{value}</span>
    </div>
  );
}

function LegendItem({ label, color }: { label: string, color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-1.5 h-1.5 rounded-full ${color}`} />
      <span className="text-[10px] text-zinc-400 font-mono font-bold uppercase tracking-tight">{label}</span>
    </div>
  );
}
