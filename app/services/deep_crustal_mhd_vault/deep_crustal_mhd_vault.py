"""
Option B: Sovereign Subterranean Deep-Crustal Magnetohydrodynamic (MHD) Geothermal Power & Kinetic Vault.

Harnesses supercritical deep geothermal brine (450°C - 620°C, 25-35 MPa) at 4.5 - 8.0 km depths,
driving conductive ionized flow through transverse 8.5 Tesla superconducting magnetic channels
to generate continuous turbine-free direct DC electricity (850 MW - 1.8 GW), powering
ultra-hardened deep-crustal subterranean data vaults isolated by acoustic phononic metamaterials,
Faradaic EMP seals, and sub-nanosecond optical air-gap interfaces.
"""

from dataclasses import dataclass, field
from datetime import datetime, timezone
import math
import random
from typing import Any, Dict, List, Optional


@dataclass
class MHDGeothermalNode:
    vault_id: str
    vault_name: str
    depth_kilometers: float
    geothermal_brine_temp_celsius: float
    brine_pressure_mpa: float
    superconducting_b_field_tesla: float
    brine_conductivity_siemens_m: float
    rated_mhd_output_mw: float
    vault_hardening_rating: str  # "EMP_FARADAIC_CLASS_IV", "DEEP_BATHOLITH_CLASS_V"
    status: str = "MHD_BASELOAD_GENERATING"


@dataclass
class MHDPowerDischargeResult:
    discharge_id: str
    vault_id: str
    brine_flow_velocity_m_s: float
    generated_mhd_power_mw: float
    hall_parameter_beta: float
    mhd_generator_efficiency_pct: float
    vault_internal_power_allocated_mw: float
    sovereign_grid_export_mw: float
    subterranean_isolation_confirmed: bool
    status: str
    timestamp: str


class DeepCrustalMHDVault:
    """
    Sovereign Subterranean Deep-Crustal Magnetohydrodynamic (MHD) Geothermal Power & Kinetic Vault.
    """

    def __init__(self):
        self.vaults: Dict[str, MHDGeothermalNode] = {}
        self.discharges: List[MHDPowerDischargeResult] = []
        self._initialize_default_vaults()

    def _initialize_default_vaults(self):
        default_vaults = [
            MHDGeothermalNode(
                vault_id="MHD-VAULT-ICELAND-01",
                vault_name="Reykjanes Deep-Crustal Supercritical MHD Vault",
                depth_kilometers=4.8,
                geothermal_brine_temp_celsius=520.0,
                brine_pressure_mpa=28.5,
                superconducting_b_field_tesla=8.5,
                brine_conductivity_siemens_m=42.0,
                rated_mhd_output_mw=950.0,
                vault_hardening_rating="DEEP_BATHOLITH_CLASS_V",
            ),
            MHDGeothermalNode(
                vault_id="MHD-VAULT-NEVADA-02",
                vault_name="Great Basin Granitic Batholith Kinetic Vault & Generator",
                depth_kilometers=6.2,
                geothermal_brine_temp_celsius=485.0,
                brine_pressure_mpa=31.0,
                superconducting_b_field_tesla=9.0,
                brine_conductivity_siemens_m=38.5,
                rated_mhd_output_mw=1250.0,
                vault_hardening_rating="DEEP_BATHOLITH_CLASS_V",
            ),
            MHDGeothermalNode(
                vault_id="MHD-VAULT-NEW-ZEALAND-03",
                vault_name="Taupo Volcanic Subduction Zone MHD Array",
                depth_kilometers=5.5,
                geothermal_brine_temp_celsius=580.0,
                brine_pressure_mpa=34.0,
                superconducting_b_field_tesla=8.8,
                brine_conductivity_siemens_m=46.2,
                rated_mhd_output_mw=1650.0,
                vault_hardening_rating="DEEP_BATHOLITH_CLASS_V",
            ),
        ]
        for v in default_vaults:
            self.vaults[v.vault_id] = v

    def list_vaults(self) -> List[Dict[str, Any]]:
        return [
            {
                "vault_id": v.vault_id,
                "vault_name": v.vault_name,
                "depth_kilometers": v.depth_kilometers,
                "geothermal_brine_temp_celsius": v.geothermal_brine_temp_celsius,
                "brine_pressure_mpa": v.brine_pressure_mpa,
                "superconducting_b_field_tesla": v.superconducting_b_field_tesla,
                "brine_conductivity_siemens_m": v.brine_conductivity_siemens_m,
                "rated_mhd_output_mw": v.rated_mhd_output_mw,
                "vault_hardening_rating": v.vault_hardening_rating,
                "status": v.status,
            }
            for v in self.vaults.values()
        ]

    def generate_mhd_baseload(
        self,
        vault_id: str,
        brine_velocity_factor: float = 1.0,
        load_factor: float = 0.85,
    ) -> Dict[str, Any]:
        """
        Engages the superconducting magnetohydrodynamic transverse channel,
        extracting direct continuous DC power from high-pressure supercritical brine.
        """
        vault = self.vaults.get(vault_id)
        if not vault:
            raise ValueError(f"Deep crustal vault {vault_id} not registered.")

        velocity = round(18.5 * brine_velocity_factor, 2)
        # Power P = sigma * u^2 * B^2 * K * (1-K) * Volume
        generated = round(vault.rated_mhd_output_mw * brine_velocity_factor * load_factor * random.uniform(0.98, 1.02), 1)
        vault_internal = round(min(120.0, generated * 0.1), 1)
        grid_export = round(generated - vault_internal, 1)

        hall_param = round(0.42 * (vault.superconducting_b_field_tesla / 8.5), 3)

        discharge_id = f"MHD-POWER-{int(datetime.now(timezone.utc).timestamp())}-{random.randint(100, 999)}"
        res = MHDPowerDischargeResult(
            discharge_id=discharge_id,
            vault_id=vault_id,
            brine_flow_velocity_m_s=velocity,
            generated_mhd_power_mw=generated,
            hall_parameter_beta=hall_param,
            mhd_generator_efficiency_pct=88.4,
            vault_internal_power_allocated_mw=vault_internal,
            sovereign_grid_export_mw=grid_export,
            subterranean_isolation_confirmed=True,
            status="MHD_SUPERCRITICAL_BASELOAD_ACTIVE",
            timestamp=datetime.now(timezone.utc).isoformat(),
        )
        self.discharges.append(res)

        return {
            "discharge_id": res.discharge_id,
            "vault_id": res.vault_id,
            "brine_flow_velocity_m_s": res.brine_flow_velocity_m_s,
            "generated_mhd_power_mw": res.generated_mhd_power_mw,
            "hall_parameter_beta": res.hall_parameter_beta,
            "mhd_generator_efficiency_pct": res.mhd_generator_efficiency_pct,
            "vault_internal_power_allocated_mw": res.vault_internal_power_allocated_mw,
            "sovereign_grid_export_mw": res.sovereign_grid_export_mw,
            "subterranean_isolation_confirmed": res.subterranean_isolation_confirmed,
            "status": res.status,
            "timestamp": res.timestamp,
        }

    def get_vault_metrics(self) -> Dict[str, Any]:
        total_mw = sum([v.rated_mhd_output_mw for v in self.vaults.values()])
        return {
            "active_mhd_vaults": len(self.vaults),
            "aggregate_rated_mhd_capacity_mw": round(total_mw, 1),
            "completed_power_discharges": len(self.discharges),
            "primary_working_fluid": "SUPERCRITICAL_GEOTHERMAL_BRINE",
            "magnetic_confinement": "TRANSVERSE_SUPERCONDUCTING_MAGNETIC_CHANNEL",
            "vault_emp_faradaic_isolation": "CLASS_V_SUB_NANOSECOND_AIRGAP",
            "status": "OPERATIONAL",
        }


deep_crustal_mhd_vault = DeepCrustalMHDVault()
