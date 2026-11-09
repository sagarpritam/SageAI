"""
Test Suite for Wave 9: Autonomous Cyber Kinetic Defense & Firmware Attestation (v4.2 Milestone):
1. Capability 47: UEFI Secure Boot & SPI Flash Hash Attestor (firmware_integrity_guard)
2. Capability 48: Autonomous ICS/SCADA Modbus/DNP3 Micro-Firewall (industrial_kinetic_shield)
3. Capability 49: Multi-Agent AI Incident Commander & Regulatory Disclosure (regulatory_incident_commander)
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.firmware_attestation.firmware_integrity_guard import (
    firmware_integrity_guard,
)
from app.services.industrial_scada.industrial_kinetic_shield import (
    industrial_kinetic_shield,
)
from app.services.regulatory_commander.regulatory_commander_service import (
    regulatory_incident_commander,
)


@pytest.fixture
def client():
    return TestClient(app)


# ----------------------------------------------------
# 1. Firmware Integrity Guard Tests
# ----------------------------------------------------
def test_firmware_integrity_guard_service():
    devices = firmware_integrity_guard.list_devices()
    assert len(devices) >= 2
    dev_ids = [d["device_id"] for d in devices]
    assert "node-dell-prod-01" in dev_ids

    # Attest valid node matching Dell golden reference
    valid_res = firmware_integrity_guard.attest_firmware(
        device_id="node-dell-prod-01",
        pcr0_sha256="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        pcr2_sha256="4a982f1b4c901824ef819284ba019284ca901824ef819284ba019284ca901824",
        spi_flash_sha256="b7a77e51a44c980b1e3e7f43c3938cfd40be4889c0953a7b973ef4cf7131767e",
        secure_boot_enabled=True,
    )
    assert valid_res["attestation_verdict"] == "VERIFIED_TRUSTED_BOOT"
    assert valid_res["tamper_detected"] is False

    # Attest tampered node (SPI flash mismatch)
    tampered_res = firmware_integrity_guard.attest_firmware(
        device_id="node-dell-prod-01",
        pcr0_sha256="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        pcr2_sha256="4a982f1b4c901824ef819284ba019284ca901824ef819284ba019284ca901824",
        spi_flash_sha256="bad_tampered_spi_flash_hash_value_9999999999999999999999999999",
        secure_boot_enabled=True,
    )
    assert tampered_res["attestation_verdict"] == "TAMPERED_FIRMWARE_DETECTED"
    assert tampered_res["tamper_detected"] is True

    # Scan SPI Dump
    scan = firmware_integrity_guard.scan_spi_dump(
        image_data_hash="b7a77e51a44c980b1e3e7f43c3938cfd40be4889c0953a7b973ef4cf7131767e",
        hardware_model="DELL_POWEREDGE_R750",
    )
    assert scan["status"] == "CLEAN_OEM_CERTIFIED"

    # Quarantine node
    q = firmware_integrity_guard.quarantine_device("node-dell-prod-01")
    assert q["status"] == "DEVICE_HARDWARE_QUARANTINED"

    # Metrics
    metrics = firmware_integrity_guard.get_metrics()
    assert metrics["total_monitored_hosts"] >= 2


# ----------------------------------------------------
# 2. Industrial Kinetic Shield Tests
# ----------------------------------------------------
def test_industrial_kinetic_shield_service():
    plcs = industrial_kinetic_shield.list_plcs()
    assert len(plcs) >= 3
    plc_ids = [p["plc_id"] for p in plcs]
    assert "plc-turbine-nv-01" in plc_ids
    assert "plc-water-pumping-03" in plc_ids

    # Inspect safe packet (RPM 3400 within safe range 1200-3600)
    res_safe = industrial_kinetic_shield.inspect_scada_packet(
        plc_id="plc-turbine-nv-01",
        function_code=16,
        target_register=40001,
        requested_value=3400.0,
        protocol="MODBUS_TCP",
    )
    assert res_safe["verdict"] == "ALLOW_PASSTHROUGH"
    assert res_safe["clamped"] is False

    # Inspect dangerous runaway packet (RPM 4500 exceeds safe max 3600)
    res_danger = industrial_kinetic_shield.inspect_scada_packet(
        plc_id="plc-turbine-nv-01",
        function_code=16,
        target_register=40001,
        requested_value=4500.0,
        protocol="MODBUS_TCP",
    )
    assert res_danger["verdict"] == "BLOCKED_AND_CLAMPED"
    assert res_danger["clamped"] is True
    assert res_danger["clamped_value"] == 3600.0
    assert res_danger["severity"] == "CRITICAL"

    # Inspect toxic water chemical lye dosage (pH 11.5 exceeds safe max 7.8)
    res_lye = industrial_kinetic_shield.inspect_scada_packet(
        plc_id="plc-water-pumping-03",
        function_code=6,
        target_register=200,
        requested_value=11.5,
        protocol="MODBUS_TCP",
    )
    assert res_lye["verdict"] == "BLOCKED_AND_CLAMPED"
    assert res_lye["clamped_value"] == 7.8

    # Metrics
    metrics = industrial_kinetic_shield.get_metrics()
    assert metrics["kinetic_attacks_neutralized"] >= 2


# ----------------------------------------------------
# 3. Regulatory Incident Commander Tests
# ----------------------------------------------------
def test_regulatory_incident_commander_service():
    incidents = regulatory_incident_commander.list_incidents()
    assert len(incidents) >= 1
    inc = incidents[0]
    assert "INC-SEC-" in inc["incident_id"]

    # Declare new major incident
    new_inc = regulatory_incident_commander.declare_incident(
        title="Unauthorized Database Exfiltration & Ransom Demand",
        severity="CRITICAL",
        impacted_systems=["SAP Production ERP", "Customer Payments Vault"],
        records_compromised=250000,
    )
    assert new_inc["materiality_verdict"] == "MATERIAL_CYBERSECURITY_INCIDENT"
    inc_id = new_inc["incident_id"]

    # Generate SEC Form 8-K Item 1.05 Filing
    sec_8k = regulatory_incident_commander.generate_sec_8k_filing(
        incident_id=inc_id,
        registrant_name="SageAI Sovereign Defense Grid Corp",
        cik_number="0001999999",
    )
    assert sec_8k["filing_type"] == "SEC_FORM_8K_ITEM_105"
    assert "FORM 8-K" in sec_8k["filing_body"]
    assert "Item 1.05 Material Cybersecurity Incidents" in sec_8k["filing_body"]
    assert "250,000 records" in sec_8k["filing_body"]

    # Generate NIS2 Article 23 Early Warning Notice
    nis2 = regulatory_incident_commander.generate_nis2_early_warning(inc_id)
    assert nis2["notice_type"] == "EU_NIS2_ARTICLE_23_EARLY_WARNING"
    assert nis2["deadline_compliance"] == "COMPLIANT_WITHIN_24_HOURS"

    # Generate CISO executive brief
    brief = regulatory_incident_commander.get_ciso_executive_brief(inc_id)
    assert "ATTORNEY-CLIENT PRIVILEGED" in brief["legal_privilege_marking"]
    assert "USD" in brief["estimated_financial_exposure"]

    # Metrics
    metrics = regulatory_incident_commander.get_commander_metrics()
    assert metrics["total_incidents_managed"] >= 2
    assert metrics["sec_8k_disclosures_drafted"] >= 1


# ----------------------------------------------------
# 4. Wave 9 FastAPI Routers TestClient Tests
# ----------------------------------------------------
def test_wave9_fastapi_routers(client):
    from app.core.security import get_current_user

    app.dependency_overrides[get_current_user] = lambda: {
        "sub": "KineticCommanderAdmin",
        "org": "enterprise",
        "email": "commander@sageai.internal",
    }

    try:
        # Firmware Attestation routes
        res = client.get("/firmware-attestation/devices")
        assert res.status_code == 200
        assert len(res.json()["devices"]) >= 2

        res_attest = client.post(
            "/firmware-attestation/attest",
            json={
                "device_id": "node-supermicro-db-02",
                "pcr0_sha256": "819284ba019284ca901824ef819284ba4a982f1b4c901824ef819284ca901824",
                "pcr2_sha256": "9934fc182ab91024ef819284ba019284ca901824ef819284ba019284ca901824",
                "spi_flash_sha256": "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
                "secure_boot_enabled": True,
            },
        )
        assert res_attest.status_code == 200
        assert (
            res_attest.json()["attestation"]["attestation_verdict"]
            == "VERIFIED_TRUSTED_BOOT"
        )

        res_firm_met = client.get("/firmware-attestation/metrics")
        assert res_firm_met.status_code == 200

        # Industrial SCADA routes
        res = client.get("/industrial-scada/plcs")
        assert res.status_code == 200
        assert len(res.json()["plcs"]) >= 3

        res_scada = client.post(
            "/industrial-scada/inspect-packet",
            json={
                "plc_id": "plc-turbine-nv-01",
                "function_code": 16,
                "target_register": 40001,
                "requested_value": 4100.0,
                "protocol": "MODBUS_TCP",
            },
        )
        assert res_scada.status_code == 200
        assert res_scada.json()["inspection"]["verdict"] == "BLOCKED_AND_CLAMPED"
        assert res_scada.json()["inspection"]["clamped_value"] == 3600.0

        res_scada_met = client.get("/industrial-scada/metrics")
        assert res_scada_met.status_code == 200

        # Regulatory Commander routes
        res = client.get("/regulatory-commander/incidents")
        assert res.status_code == 200
        assert len(res.json()["incidents"]) >= 1
        res.json()["incidents"][0]["incident_id"]

        res_dec = client.post(
            "/regulatory-commander/declare-incident",
            json={
                "title": "Substation SCADA Breaker Manipulation Incident",
                "severity": "CRITICAL",
                "impacted_systems": [
                    "Substation RTU 88",
                    "Grid Energy Management System",
                ],
                "records_compromised": 0,
            },
        )
        assert res_dec.status_code == 200
        new_inc_id = res_dec.json()["incident"]["incident_id"]

        res_8k = client.post(
            "/regulatory-commander/generate-sec-8k",
            json={
                "incident_id": new_inc_id,
                "registrant_name": "PowerGrid Sovereign Systems",
                "cik_number": "0001234567",
            },
        )
        assert res_8k.status_code == 200
        assert "FORM 8-K" in res_8k.json()["filing"]["filing_body"]

        res_brief = client.get(f"/regulatory-commander/ciso-brief/{new_inc_id}")
        assert res_brief.status_code == 200
        assert "brief" in res_brief.json()

        res_reg_met = client.get("/regulatory-commander/metrics")
        assert res_reg_met.status_code == 200

    finally:
        app.dependency_overrides.clear()
