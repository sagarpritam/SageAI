"""
Live Server Integration Verification for Wave 14 Endpoints.
Verifies all newly deployed FastAPI endpoints using valid JWT authorization tokens.
"""

import os
import sys

import requests

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.security import create_access_token

CYAN = "\033[96m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
BOLD = "\033[1m"
RESET = "\033[0m"

BASE_URL = os.environ.get("FASTAPI_URL", "http://127.0.0.1:8000")


def verify_live_endpoints():
    print(f"\n{CYAN}{BOLD}{'=' * 80}{RESET}")
    print(
        f"{CYAN}{BOLD} 🌐 SAGEAI WAVE 14 LIVE SERVER INTEGRATION VERIFICATION{RESET}".center(
            78
        )
    )
    print(f"{CYAN}{BOLD}{'=' * 80}{RESET}\n")

    # Generate valid JWT token
    token = create_access_token({"sub": "live-admin-verifier", "role": "admin"})
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }

    # 1. Photonic Quantum Endpoints
    print(
        f"{BOLD}[1/3] Testing Photonic Quantum Cryptanalytic Firewall Endpoints...{RESET}"
    )
    r1 = requests.get(
        f"{BASE_URL}/photonic-quantum/coprocessors", headers=headers, timeout=5
    )
    assert r1.status_code == 200, f"Expected 200, got {r1.status_code}"
    print(
        f"  {GREEN}✓ GET /photonic-quantum/coprocessors:{RESET} {len(r1.json()['coprocessors'])} QPUs online"
    )

    r2 = requests.post(
        f"{BASE_URL}/photonic-quantum/evaluate-lattice",
        headers=headers,
        json={
            "coprocessor_id": "photonic-borealis-cvq-01",
            "lattice_dimension": 1024,
            "target_pqc_scheme": "ML-KEM-1024",
            "root_hermite_factor": 1.0045,
            "photon_loss_rate_pct": 1.2,
        },
        timeout=5,
    )
    assert r2.status_code == 200, f"Expected 200, got {r2.status_code}"
    print(
        f"  {GREEN}✓ POST /photonic-quantum/evaluate-lattice:{RESET} Hardness verified ({r2.json()['evaluation']['estimated_classical_bit_security']}-bit)"
    )

    r3 = requests.post(
        f"{BASE_URL}/photonic-quantum/engage-firewall",
        headers=headers,
        json={
            "coprocessor_id": "photonic-borealis-cvq-01",
            "defense_mode": "OPTICAL_NOISE_INJECTION_BARRIER",
        },
        timeout=5,
    )
    assert r3.status_code == 200, f"Expected 200, got {r3.status_code}"
    print(
        f"  {GREEN}✓ POST /photonic-quantum/engage-firewall:{RESET} Firewall engaged in {r3.json()['firewall_event']['optical_response_latency_fs']} fs"
    )

    r4 = requests.get(
        f"{BASE_URL}/photonic-quantum/metrics", headers=headers, timeout=5
    )
    assert r4.status_code == 200, f"Expected 200, got {r4.status_code}"
    print(
        f"  {GREEN}✓ GET /photonic-quantum/metrics:{RESET} Total optical modes = {r4.json()['metrics']['total_optical_modes_monitored']}"
    )

    # 2. Geomagnetic CME Power Grid Shield Endpoints
    print(f"\n{BOLD}[2/3] Testing Geomagnetic Solar CME Shield Endpoints...{RESET}")
    r5 = requests.get(
        f"{BASE_URL}/geomagnetic-shield/substations", headers=headers, timeout=5
    )
    assert r5.status_code == 200, f"Expected 200, got {r5.status_code}"
    print(
        f"  {GREEN}✓ GET /geomagnetic-shield/substations:{RESET} {len(r5.json()['substations'])} substations monitored"
    )

    r6 = requests.post(
        f"{BASE_URL}/geomagnetic-shield/evaluate-storm",
        headers=headers,
        json={
            "substation_id": "substation-quebec-hydro-01",
            "kp_index": 9.0,
            "db_dt_nt_per_min": 1250.0,
            "measured_gic_amps": 148.0,
        },
        timeout=5,
    )
    assert r6.status_code == 200, f"Expected 200, got {r6.status_code}"
    print(
        f"  {GREEN}✓ POST /geomagnetic-shield/evaluate-storm:{RESET} CME Saturation flagged ({r6.json()['evaluation']['reactive_power_loss_mvar']} MVAR loss)"
    )

    r7 = requests.post(
        f"{BASE_URL}/geomagnetic-shield/trigger-blocking",
        headers=headers,
        json={
            "substation_id": "substation-quebec-hydro-01",
            "damping_resistance_ohms": 15.0,
            "tripping_latency_ms": 8.9,
        },
        timeout=5,
    )
    assert r7.status_code == 200, f"Expected 200, got {r7.status_code}"
    print(
        f"  {GREEN}✓ POST /geomagnetic-shield/trigger-blocking:{RESET} Series capacitor tripped in {r7.json()['blocking_event']['tripping_speed_ms']} ms"
    )

    r8 = requests.get(
        f"{BASE_URL}/geomagnetic-shield/metrics", headers=headers, timeout=5
    )
    assert r8.status_code == 200, f"Expected 200, got {r8.status_code}"
    print(
        f"  {GREEN}✓ GET /geomagnetic-shield/metrics:{RESET} Shielded transformers = {r8.json()['metrics']['total_ehv_transformers_shielded']}"
    )

    # 3. HAPS Stratospheric Persistent Swarm Endpoints
    print(
        f"\n{BOLD}[3/3] Testing HAPS Stratospheric Persistent Swarm Endpoints...{RESET}"
    )
    r9 = requests.get(f"{BASE_URL}/haps-stratosphere/nodes", headers=headers, timeout=5)
    assert r9.status_code == 200, f"Expected 200, got {r9.status_code}"
    print(
        f"  {GREEN}✓ GET /haps-stratosphere/nodes:{RESET} {len(r9.json()['nodes'])} HAPS nodes active"
    )

    r10 = requests.post(
        f"{BASE_URL}/haps-stratosphere/monitor-flight",
        headers=headers,
        json={
            "node_id": "haps-zephyr-norfolk-01",
            "wind_velocity_mps": 42.5,
            "battery_soc_pct": 75.0,
            "sar_clutter_ratio_db": 7.5,
            "optical_link_jitter_urad": 4.1,
        },
        timeout=5,
    )
    assert r10.status_code == 200, f"Expected 200, got {r10.status_code}"
    print(
        f"  {GREEN}✓ POST /haps-stratosphere/monitor-flight:{RESET} Jet stream compensation evaluated ({r10.json()['flight_monitor']['station_keeping_efficiency_pct']}%)"
    )

    r11 = requests.post(
        f"{BASE_URL}/haps-stratosphere/relay-sar",
        headers=headers,
        json={
            "node_id": "haps-zephyr-norfolk-01",
            "frame_resolution_meters": 0.15,
            "pqc_cipher": "ML-DSA-87_AES256GCM",
        },
        timeout=5,
    )
    assert r11.status_code == 200, f"Expected 200, got {r11.status_code}"
    print(
        f"  {GREEN}✓ POST /haps-stratosphere/relay-sar:{RESET} SAR ground telemetry downlinked ({r11.json()['telemetry_event']['sar_resolution_meters']}m resolution)"
    )

    r12 = requests.get(
        f"{BASE_URL}/haps-stratosphere/metrics", headers=headers, timeout=5
    )
    assert r12.status_code == 200, f"Expected 200, got {r12.status_code}"
    print(
        f"  {GREEN}✓ GET /haps-stratosphere/metrics:{RESET} Persistent uptime = {r12.json()['metrics']['persistent_surveillance_uptime_pct']}%"
    )

    print(
        f"\n{GREEN}{BOLD}🎯 ALL 12 LIVE FASTAPI ENDPOINTS VERIFIED OPERATIONAL (100% SUCCESS){RESET}\n"
    )


if __name__ == "__main__":
    verify_live_endpoints()
