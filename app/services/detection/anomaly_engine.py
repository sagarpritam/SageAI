"""
SageAI Behavioral Anomaly & UEBA Engine.

Establishes continuous statistical baselines for API traffic, request payload volumes,
latency distributions, and endpoint call frequencies. Detects zero-day anomalies,
credential stuffing spikes, and unauthorized data exfiltration via Z-score analysis.
Fulfills Pillar VI and Capability 6 of the Enterprise Security Roadmap.
"""

import statistics
import time
from collections import defaultdict
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional


class BehavioralAnomalyEngine:
    """
    User and Entity Behavior Analytics (UEBA) engine.
    Maintains sliding window metrics and flags statistical deviations (Z-score > 3.0).
    """

    def __init__(self, z_score_threshold: float = 3.0, window_size: int = 50):
        self.z_score_threshold = z_score_threshold
        self.window_size = window_size
        # metric_key -> list of float values (e.g. payload_size, response_time, req_rate)
        self._baselines: Dict[str, List[float]] = defaultdict(list)
        # ip_address -> list of timestamps for rate calculation
        self._ip_request_history: Dict[str, List[float]] = defaultdict(list)
        self._anomaly_events: List[Dict[str, Any]] = []

    def record_metric(self, metric_key: str, value: float) -> Optional[Dict[str, Any]]:
        """
        Records a numerical observation, updates baseline statistics, and evaluates Z-score.
        If value deviates significantly (Z > threshold) from historical baseline, triggers an alert.
        """
        history = self._baselines[metric_key]

        anomaly_alert = None
        if len(history) >= 10:
            mean = statistics.mean(history)
            stdev = statistics.stdev(history)

            if stdev > 0:
                z_score = (value - mean) / stdev
                if abs(z_score) >= self.z_score_threshold:
                    anomaly_alert = {
                        "alert_id": f"UEBA-{int(time.time() * 1000)}",
                        "type": "BEHAVIORAL_STATISTICAL_ANOMALY",
                        "severity": "HIGH" if z_score > 4.5 else "MEDIUM",
                        "metric_key": metric_key,
                        "observed_value": round(value, 2),
                        "baseline_mean": round(mean, 2),
                        "baseline_stdev": round(stdev, 2),
                        "z_score": round(z_score, 2),
                        "threshold": self.z_score_threshold,
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                        "confidence": "High (Statistical Sigma Deviation)",
                        "threat_indicator": (
                            f"Metric '{metric_key}' observed at {value:.2f}, deviating by {z_score:.2f} standard deviations "
                            f"from baseline mean of {mean:.2f}."
                        ),
                    }
                    self._anomaly_events.append(anomaly_alert)

        # Append to sliding window
        history.append(value)
        if len(history) > self.window_size:
            history.pop(0)

        return anomaly_alert

    def track_request_frequency(
        self, client_ip: str, endpoint: str, payload_bytes: int = 0
    ) -> List[Dict[str, Any]]:
        """
        Tracks per-IP traffic frequency and data volume, evaluating both rate and volume anomalies.
        """
        now = time.time()
        ip_history = self._ip_request_history[client_ip]
        # Keep last 60 seconds
        ip_history = [t for t in ip_history if now - t <= 60]
        ip_history.append(now)
        self._ip_request_history[client_ip] = ip_history

        alerts = []

        # 1. Evaluate rate anomaly
        rate_key = f"rate:{endpoint}"
        rate_alert = self.record_metric(rate_key, float(len(ip_history)))
        if rate_alert:
            alerts.append(rate_alert)

        # 2. Evaluate payload size anomaly (e.g. data exfiltration or massive payload upload)
        if payload_bytes > 0:
            size_key = f"payload_size:{endpoint}"
            size_alert = self.record_metric(size_key, float(payload_bytes))
            if size_alert:
                alerts.append(size_alert)

        return alerts

    def get_recent_anomalies(self, limit: int = 20) -> List[Dict[str, Any]]:
        """Returns the most recent behavioral anomalies."""
        return self._anomaly_events[-limit:]

    def get_baseline_stats(self) -> Dict[str, Any]:
        """Returns statistical overview of active monitored metrics."""
        stats = {}
        for key, vals in self._baselines.items():
            if len(vals) >= 2:
                stats[key] = {
                    "samples": len(vals),
                    "mean": round(statistics.mean(vals), 2),
                    "stdev": round(statistics.stdev(vals), 2),
                    "min": round(min(vals), 2),
                    "max": round(max(vals), 2),
                }
        return {
            "total_monitored_metrics": len(self._baselines),
            "metrics": stats,
            "total_anomalies_flagged": len(self._anomaly_events),
        }


# Global singleton UEBA engine
anomaly_engine = BehavioralAnomalyEngine()
