"""
Capability 76: Autonomous Penning-Trap Superconducting Antimatter Containment Matrix.

Manages ultra-cold antiproton/positron non-neutral plasma confinement within cryogenic
multi-ring Penning-Malmberg traps. Employs superconducting HTS solenoids (B = 9-12 Tesla),
rotating wall electric fields to suppress diocotron plasma instabilities, and millisecond
fail-safe divertor quench dump protocols to prevent uncontrolled annihilation blowouts.
"""

import math
import random
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Dict, List


@dataclass
class PenningTrapContainmentCell:
    cell_id: str
    facility_name: str
    magnetic_field_tesla: float = 10.5  # HTS REBCO solenoid
    cryogenic_temp_kelvin: float = 3.8
    vacuum_pressure_mbar: float = 4.2e-15
    axial_well_voltage_volts: float = 350.0
    antiproton_count: int = 450_000_000  # 4.5 * 10^8 antiprotons
    plasma_radius_mm: float = 1.85
    diocotron_mode_frequency_khz: float = 42.8
    rotating_wall_amplitude_v: float = 2.4
    confinement_time_margin_hours: float = 720.0  # 30 days
    containment_status: str = "CRYOGENIC_STABLE_CONFINED"


@dataclass
class AntimatterPlasmaTelemetry:
    telemetry_id: str
    cell_id: str
    stored_antiprotons: int
    plasma_density_cm3: float
    magnetic_drift_velocity_m_s: float
    annihilation_loss_rate_per_sec: float
    quench_dump_readiness_pct: float
    stability_margin_sigma: float
    status: str
    timestamp: str


class SuperconductingAntimatterContainment:
    """
    Sovereign antimatter storage and plasma stabilization controller.
    """

    MASS_ANTIPROTON_KG = 1.67262192369e-27
    SPEED_OF_LIGHT = 299792458.0  # m/s

    def __init__(self):
        self.cells: Dict[str, PenningTrapContainmentCell] = {}
        self.telemetry_history: List[AntimatterPlasmaTelemetry] = []
        self._initialize_default_cells()

    def _initialize_default_cells(self):
        default_cells = [
            PenningTrapContainmentCell(
                cell_id="CELL-ALPHA-PENNING-01",
                facility_name="Underground Cryo-Vault Geneva",
                magnetic_field_tesla=11.2,
                cryogenic_temp_kelvin=3.6,
                vacuum_pressure_mbar=3.8e-15,
                antiproton_count=850_000_000,
                plasma_radius_mm=1.65,
                diocotron_mode_frequency_khz=44.1,
            ),
            PenningTrapContainmentCell(
                cell_id="CELL-BETA-PENNING-02",
                facility_name="Subterranean Redoubt Cheyenne",
                magnetic_field_tesla=10.8,
                cryogenic_temp_kelvin=3.9,
                vacuum_pressure_mbar=4.5e-15,
                antiproton_count=620_000_000,
                plasma_radius_mm=1.92,
                diocotron_mode_frequency_khz=41.5,
            ),
            PenningTrapContainmentCell(
                cell_id="CELL-GAMMA-ORBITAL-03",
                facility_name="Orbital Platform Aegis-3",
                magnetic_field_tesla=12.0,
                cryogenic_temp_kelvin=2.7,
                vacuum_pressure_mbar=1.2e-15,
                antiproton_count=1_200_000_000,
                plasma_radius_mm=1.40,
                diocotron_mode_frequency_khz=48.2,
            ),
        ]
        for cell in default_cells:
            self.cells[cell.cell_id] = cell

    def list_cells(self) -> List[Dict[str, Any]]:
        return [
            {
                "cell_id": c.cell_id,
                "facility_name": c.facility_name,
                "magnetic_field_tesla": c.magnetic_field_tesla,
                "cryogenic_temp_kelvin": c.cryogenic_temp_kelvin,
                "vacuum_pressure_mbar": c.vacuum_pressure_mbar,
                "axial_well_voltage_volts": c.axial_well_voltage_volts,
                "antiproton_count": c.antiproton_count,
                "plasma_radius_mm": c.plasma_radius_mm,
                "diocotron_mode_frequency_khz": c.diocotron_mode_frequency_khz,
                "rotating_wall_amplitude_v": c.rotating_wall_amplitude_v,
                "confinement_time_margin_hours": c.confinement_time_margin_hours,
                "containment_status": c.containment_status,
            }
            for c in self.cells.values()
        ]

    def monitor_plasma_dynamics(self, cell_id: str) -> Dict[str, Any]:
        """
        Polls non-neutral plasma drift velocity, background gas scattering loss rate,
        and diocotron instability margins.
        """
        cell = self.cells.get(cell_id)
        if not cell:
            raise ValueError(f"Containment cell {cell_id} not found.")

        # Plasma volume (cylinder of length 50mm)
        trap_length_cm = 5.0
        plasma_radius_cm = cell.plasma_radius_mm / 10.0
        volume_cm3 = math.pi * (plasma_radius_cm**2) * trap_length_cm
        plasma_density = round(cell.antiproton_count / max(0.01, volume_cm3), 2)

        # ExB drift velocity
        drift_v = round(
            (cell.axial_well_voltage_volts / (cell.plasma_radius_mm * 1e-3))
            / cell.magnetic_field_tesla,
            2,
        )

        # Residual gas annihilation loss rate based on vacuum pressure
        # P = 4e-15 mbar -> ~10^2 molecules/cm^3
        loss_rate_per_sec = round(
            cell.antiproton_count * (cell.vacuum_pressure_mbar / 1e-15) * 1.8e-8, 4
        )

        stability_sigma = round(5.8 + random.uniform(-0.3, 0.4), 2)

        telemetry_id = f"AP-TEL-{int(datetime.now(timezone.utc).timestamp())}-{random.randint(100, 999)}"
        telem = AntimatterPlasmaTelemetry(
            telemetry_id=telemetry_id,
            cell_id=cell_id,
            stored_antiprotons=cell.antiproton_count,
            plasma_density_cm3=plasma_density,
            magnetic_drift_velocity_m_s=drift_v,
            annihilation_loss_rate_per_sec=loss_rate_per_sec,
            quench_dump_readiness_pct=99.98,
            stability_margin_sigma=stability_sigma,
            status="NOMINAL_CONFINED",
            timestamp=datetime.now(timezone.utc).isoformat(),
        )
        self.telemetry_history.append(telem)

        return {
            "telemetry_id": telem.telemetry_id,
            "cell_id": telem.cell_id,
            "stored_antiprotons": telem.stored_antiprotons,
            "plasma_density_cm3": telem.plasma_density_cm3,
            "magnetic_drift_velocity_m_s": telem.magnetic_drift_velocity_m_s,
            "annihilation_loss_rate_per_sec": telem.annihilation_loss_rate_per_sec,
            "quench_dump_readiness_pct": telem.quench_dump_readiness_pct,
            "stability_margin_sigma": telem.stability_margin_sigma,
            "status": telem.status,
            "timestamp": telem.timestamp,
        }

    def trigger_rotating_wall_compression(
        self, cell_id: str, delta_voltage_v: float = 0.5, target_radius_mm: float = 1.45
    ) -> Dict[str, Any]:
        """
        Applies quadrupolar rotating wall electric field to counter radial plasma expansion,
        compressing the antiproton cloud.
        """
        cell = self.cells.get(cell_id)
        if not cell:
            raise ValueError(f"Cell {cell_id} not found.")

        old_radius = cell.plasma_radius_mm
        new_radius = round(max(target_radius_mm, cell.plasma_radius_mm - 0.25), 3)
        cell.plasma_radius_mm = new_radius
        cell.rotating_wall_amplitude_v = round(
            cell.rotating_wall_amplitude_v + delta_voltage_v, 2
        )

        return {
            "cell_id": cell_id,
            "previous_radius_mm": old_radius,
            "compressed_plasma_radius_mm": new_radius,
            "rotating_wall_amplitude_v": cell.rotating_wall_amplitude_v,
            "diocotron_suppression_ratio_db": -24.8,
            "containment_integrity": "EXCELLENT",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    def execute_fail_safe_quench_divert(
        self, cell_id: str, reason: str = "SIMULATED_SAFETY_DRILL"
    ) -> Dict[str, Any]:
        """
        Fast magnetic quench diversion protocol: safely redirects antiprotons into
        high-density beryllium/tungsten moderator dump target with zero explosive rupture.
        """
        cell = self.cells.get(cell_id)
        if not cell:
            raise ValueError(f"Cell {cell_id} not found.")

        antiprotons = cell.antiproton_count
        annihilation_energy_joules = (
            antiprotons * 2.0 * self.MASS_ANTIPROTON_KG * (self.SPEED_OF_LIGHT**2)
        )

        # Moderator thermalizes energy over cooling fluid (absorbed in < 1 ms)
        dump_time_us = round(random.uniform(420.0, 780.0), 1)

        return {
            "cell_id": cell_id,
            "reason": reason,
            "diverted_antiproton_count": antiprotons,
            "total_annihilation_energy_joules": round(annihilation_energy_joules, 6),
            "moderator_absorption_target": "Tungsten-Beryllium Heavy Core Baffle",
            "quench_diversion_duration_us": dump_time_us,
            "breach_probability": 0.0,
            "cell_state": "PURGED_SAFE_NEUTRALIZED",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    def get_matrix_metrics(self) -> Dict[str, Any]:
        total_pbar = sum([c.antiproton_count for c in self.cells.values()])
        total_energy_j = (
            total_pbar * 2.0 * self.MASS_ANTIPROTON_KG * (self.SPEED_OF_LIGHT**2)
        )
        return {
            "active_containment_cells": len(self.cells),
            "total_antiprotons_stored": total_pbar,
            "equivalent_annihilation_energy_joules": round(total_energy_j, 4),
            "mean_magnetic_field_tesla": round(
                sum([c.magnetic_field_tesla for c in self.cells.values()])
                / len(self.cells),
                2,
            ),
            "mean_cryogenic_temp_k": round(
                sum([c.cryogenic_temp_kelvin for c in self.cells.values()])
                / len(self.cells),
                2,
            ),
            "plasma_mode": "PENNING_MALMBERG_ROTATING_WALL",
            "status": "NOMINAL_STABLE",
        }


superconducting_antimatter_containment = SuperconductingAntimatterContainment()
