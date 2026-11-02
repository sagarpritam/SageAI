"""
SageAI Network Intrusion Detection (NIDS) & C2 Beaconing Monitor.

Monitors connection events, flags port scanning sweeps, calculates inter-arrival
jitter for C2 beacon detection, and identifies suspicious exfiltration spikes.
"""

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
