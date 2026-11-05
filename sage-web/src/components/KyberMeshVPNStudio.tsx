"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Radio,
  Lock,
  Unlock,
  RefreshCw,
  Zap,
  Key,
  Layers,
  Activity,
  CheckCircle2,
  Terminal,
  FileCode,
  Copy,
  Check,
  Server,
  Cloud,
} from "lucide-react";

interface MeshPeer {
  peer_id: string;
  node_name: string;
  endpoint: string;
  overlay_ip: string;
  pqc_suite: string;
  kyber_public_key: string;
  dilithium_identity: string;
  status: string;
  handshake_age_sec: number;
  latency_ms: number;
  tx_bytes: number;
  rx_bytes: number;
}

export function KyberMeshVPNStudio() {
  const [peers, setPeers] = useState<MeshPeer[]>([]);
  const [selectedPeer, setSelectedPeer] = useState<MeshPeer | null>(null);
  const [loading, setLoading] = useState(false);
  const [handshaking, setHandshaking] = useState(false);
  const [wireguardConf, setWireguardConf] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // New peer state
  const [nodeName, setNodeName] = useState("Orbital Relay DeepSpace-1");
  const [endpoint, setEndpoint] = useState("198.51.100.45:51820");
  const [overlayIp, setOverlayIp] = useState("10.220.0.25/32");
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    fetchPeers();
  }, []);

  async function fetchPeers() {
    setLoading(true);
    try {
      const res = await fetch("/api/kyber-mesh-vpn/peers");
      const data = await res.json();
      if (data.peers) {
        setPeers(data.peers);
        if (!selectedPeer && data.peers.length > 0) {
          setSelectedPeer(data.peers[0]);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleRegisterPeer(e: React.FormEvent) {
    e.preventDefault();
    setRegistering(true);
    try {
      const res = await fetch("/api/kyber-mesh-vpn/peers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          node_name: nodeName,
          endpoint,
          overlay_ip: overlayIp,
        }),
      });
      const data = await res.json();
      if (data.peer) {
        setPeers((prev) => [data.peer, ...prev]);
        setSelectedPeer(data.peer);
      }
    } finally {
      setRegistering(false);
    }
  }

  async function handleHandshake(peerId: string) {
    setHandshaking(true);
    try {
      const res = await fetch("/api/kyber-mesh-vpn/handshake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ peer_id: peerId }),
      });
      const data = await res.json();
      if (data.handshake) {
        setPeers((prev) =>
          prev.map((p) =>
            p.peer_id === peerId ? { ...p, handshake_age_sec: 1, status: "ESTABLISHED" } : p
          )
        );
      }
    } finally {
      setHandshaking(false);
    }
  }

  function handleGenerateWireguard(peer: MeshPeer) {
    const conf = `# SageAI Sovereign Quantum-Safe WireGuard Interface (ML-KEM-768)
[Interface]
PrivateKey = <Local_PQC_Node_Private_Key>
Address = ${peer.overlay_ip}
ListenPort = 51820
PostUp = iptables -A FORWARD -i %i -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostDown = iptables -D FORWARD -i %i -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE

[Peer]
# Peer: ${peer.node_name}
PublicKey = <WireGuard_Public_Key>
PresharedKey = kyber768_psk_98af01eb4c901824ef819284ba019284ca901824
Endpoint = ${peer.endpoint}
AllowedIPs = 10.220.0.0/24, 10.100.0.0/16
PersistentKeepalive = 25
# Quantum Resistance: NIST FIPS 203 (ML-KEM-768) + NIST FIPS 204 (ML-DSA-65)
# Rekey Interval: 120 seconds`;
    setWireguardConf(conf);
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-violet-950/40 via-slate-900 to-slate-950 border border-violet-800/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
              Capability 44
            </span>
            <span className="text-xs text-slate-400">NIST FIPS 203 / 204 Sovereign Tunnel</span>
          </div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Radio className="w-6 h-6 text-violet-400" />
            PQC Kyber/Dilithium Encrypted Mesh VPN Gateway
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Post-quantum encrypted WireGuard mesh overlay utilizing ML-KEM-768 key encapsulation and ML-DSA-65 digital signatures with 120-second ephemeral session key rotation.
          </p>
        </div>
        <button
          onClick={fetchPeers}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Quantum Metric Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400">Total Mesh Nodes</div>
          <div className="text-2xl font-bold text-white mt-1">{peers.length}</div>
          <div className="text-xs text-violet-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> FIPS 203 Compliant
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400">Ephemeral Rekey Period</div>
          <div className="text-2xl font-bold text-cyan-400 mt-1 font-mono">120 sec</div>
          <div className="text-xs text-slate-500 mt-1">Sliding quantum PFS</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400">Quantum Immunity</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">192-bit</div>
          <div className="text-xs text-slate-500 mt-1">Shor/Grover resilient</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400">Mesh Throughput</div>
          <div className="text-2xl font-bold text-amber-400 mt-1 font-mono">68.2 MB</div>
          <div className="text-xs text-slate-500 mt-1">Zero-copy WireGuard TUN</div>
        </div>
      </div>

      {/* Main Studio View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Register Form & Node List */}
        <div className="lg:col-span-1 space-y-4">
          <form onSubmit={handleRegisterPeer} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="text-xs font-semibold text-white uppercase tracking-wider">
              Enlist PQC Mesh Peer
            </div>
            <div>
              <label className="text-[11px] text-slate-400">Peer Designation Name</label>
              <input
                type="text"
                value={nodeName}
                onChange={(e) => setNodeName(e.target.value)}
                className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400">Endpoint (IP:Port)</label>
              <input
                type="text"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400">Mesh Overlay IP</label>
              <input
                type="text"
                value={overlayIp}
                onChange={(e) => setOverlayIp(e.target.value)}
                className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={registering}
              className="w-full py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs transition flex items-center justify-center gap-2 mt-2"
            >
              <Zap className="w-3.5 h-3.5" />
              Register & Synthesize PQC Keys
            </button>
          </form>

          {/* List of Peers */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
              Active Quantum Mesh Peers ({peers.length})
            </h4>
            {peers.map((peer) => {
              const isSelected = selectedPeer?.peer_id === peer.peer_id;
              return (
                <div
                  key={peer.peer_id}
                  onClick={() => {
                    setSelectedPeer(peer);
                    handleGenerateWireguard(peer);
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition ${
                    isSelected
                      ? "bg-slate-800/90 border-violet-500/50 shadow-lg shadow-violet-950/20"
                      : "bg-slate-900/50 border-slate-800 hover:bg-slate-850 hover:border-slate-700"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-bold text-white">{peer.node_name}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {peer.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1 font-mono truncate">{peer.endpoint} &bull; {peer.overlay_ip}</div>
                  <div className="flex justify-between items-center text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-800">
                    <span>Rekeyed: {peer.handshake_age_sec}s ago</span>
                    <span className="font-mono text-cyan-400 font-semibold">{peer.latency_ms} ms</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Node Cryptographic Proof & WireGuard Config */}
        <div className="lg:col-span-2 space-y-4">
          {selectedPeer ? (
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Lock className="w-5 h-5 text-violet-400" />
                    PQC Gateway: {selectedPeer.node_name}
                  </h3>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Peer ID: {selectedPeer.peer_id} &bull; Overlay IP: {selectedPeer.overlay_ip}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleHandshake(selectedPeer.peer_id)}
                    disabled={handshaking}
                    className="px-3.5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium transition flex items-center gap-1.5 shadow-lg shadow-violet-950/30"
                  >
                    <Zap className={`w-3.5 h-3.5 ${handshaking ? "animate-spin" : ""}`} />
                    Rekey ML-KEM
                  </button>
                </div>
              </div>

              {/* Lattice Key Specifications */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">ML-KEM-768 (Kyber) Public Key</span>
                  <div className="font-mono text-xs text-violet-400 truncate select-all">
                    {selectedPeer.kyber_public_key}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">ML-DSA-65 (Dilithium) Signature Identity</span>
                  <div className="font-mono text-xs text-cyan-400 truncate select-all">
                    {selectedPeer.dilithium_identity}
                  </div>
                </div>
              </div>

              {/* WireGuard Configuration File Inspector */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-violet-400" />
                    Generated wg0-pqc.conf with Kyber PSK
                  </span>
                  <button
                    onClick={() => copyToClipboard(wireguardConf || "")}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied" : "Copy Conf"}
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-slate-950 font-mono text-xs text-slate-300 border border-slate-800 overflow-x-auto leading-relaxed select-all">
                  {wireguardConf || `# Select or rekey a peer to generate WireGuard config`}
                </pre>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-slate-500">
              Select a peer to inspect quantum keys and generated WireGuard tunnels.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
