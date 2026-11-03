"""
SageAI Network Intrusion Detection (NIDS) & C2 Beaconing Monitor.

Monitors connection events, flags port scanning sweeps, calculates inter-arrival
jitter for C2 beacon detection, and identifies suspicious exfiltration spikes.
"""

import math
import statistics
import time
from collections import defaultdict
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional


class NIDSMonitor:
    """
    Network intrusion detection system engine.
    Detects port scans, horizontal sweeping, and periodic C2 heartbeat beacons.
    """

    def __init__(self, port_scan_threshold: int = 5, scan_window_seconds: int = 15):
        self.port_scan_threshold = port_scan_threshold
        self.scan_window_seconds = scan_window_seconds
        # source_ip -> list of (port, timestamp)
        self._port_probes: Dict[str, List[tuple[int, float]]] = defaultdict(list)
        # (src_ip, dst_ip) -> list of connection timestamps
        self._c2_streams: Dict[tuple[str, str], List[float]] = defaultdict(list)

    def record_connection_probe(
        self, source_ip: str, destination_port: int, destination_ip: str = "internal_host"
    ) -> Optional[Dict[str, Any]]:
        """
        Records an inbound connection attempt and checks for port scanning.
        """
        now = time.time()
        probes = [
            (p, t) for (p, t) in self._port_probes[source_ip]
            if now - t <= self.scan_window_seconds
        ]
        probes.append((destination_port, now))
        self._port_probes[source_ip] = probes

        distinct_ports = {p for (p, t) in probes}
        if len(distinct_ports) >= self.port_scan_threshold:
            return {
                "alert_type": "NIDS_PORT_SCAN_DETECTED",
                "severity": "MEDIUM",
                "source_ip": source_ip,
                "distinct_ports_scanned": sorted(distinct_ports),
                "port_count": len(distinct_ports),
                "window_seconds": self.scan_window_seconds,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "recommendation": f"Block or rate-limit aggressive port scanner {source_ip}.",
            }
        return None

    def record_outbound_connection(
        self, internal_host: str, external_ip: str, timestamp: Optional[float] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Records outbound traffic and analyzes connection intervals for C2 beaconing behavior.
        """
        t = timestamp or time.time()
        stream_key = (internal_host, external_ip)
        self._c2_streams[stream_key].append(t)

        timestamps = self._c2_streams[stream_key]
        if len(timestamps) < 5:
            return None

        # Keep last 15 timestamps
        recent = timestamps[-15:]
        intervals = [recent[i] - recent[i-1] for i in range(1, len(recent))]

        mean_interval = statistics.mean(intervals)
        std_dev = statistics.stdev(intervals) if len(intervals) > 1 else 0.0

        # Coefficient of variation (CV = std_dev / mean)
        # Automated C2 implants (Cobalt Strike, Mythic) typically have very low jitter (CV < 0.25)
        cv = (std_dev / mean_interval) if mean_interval > 0 else 1.0

        if len(intervals) >= 4 and mean_interval > 1.0 and cv < 0.25:
            return {
                "alert_type": "NIDS_C2_BEACONING_SUSPECTED",
                "severity": "CRITICAL",
                "internal_host": internal_host,
                "c2_server_ip": external_ip,
                "observed_interval_seconds": round(mean_interval, 2),
                "jitter_coefficient": round(cv, 4),
                "connections_analyzed": len(recent),
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "recommendation": f"Isolate internal host {internal_host} and investigate process initiating connections to {external_ip}.",
            }
        return None

    def analyze_dns_query(
        self, query_name: str, query_type: str = "A", client_ip: str = "unknown"
    ) -> Optional[Dict[str, Any]]:
        """
        Detects DNS tunneling, exfiltration, and C2 domain generation algorithms (DGA).
        Analyzes label length, character entropy, and anomalous query types.
        """
        labels = [l for l in query_name.strip(".").split(".") if l]
        if not labels:
            return None

        # Check largest subdomain label
        subdomain_label = labels[0]
        label_len = len(subdomain_label)

        # Calculate Shannon entropy of the label
        prob = [float(subdomain_label.count(c)) / label_len for c in set(subdomain_label)]
        entropy = -sum(p * math.log2(p) for p in prob) if label_len > 0 else 0.0

        is_tunneling = False
        reason = ""

        if label_len > 32 and entropy > 3.5:
            is_tunneling = True
            reason = f"High-entropy ({entropy:.2f}) long subdomain label ({label_len} chars) indicates encoded exfiltration."
        elif query_type in ["TXT", "NULL"] and label_len > 24:
            is_tunneling = True
            reason = f"Anomalous query type '{query_type}' with elongated payload label ({label_len} chars)."

        if is_tunneling:
            return {
                "alert_type": "NIDS_DNS_TUNNELING_DETECTED",
                "severity": "CRITICAL",
                "client_ip": client_ip,
                "queried_domain": query_name,
                "subdomain_label_length": label_len,
                "entropy": round(entropy, 2),
                "query_type": query_type,
                "reason": reason,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "recommendation": f"Sinkhole DNS domain '{query_name}' and inspect network socket of client {client_ip}.",
            }
        return None
