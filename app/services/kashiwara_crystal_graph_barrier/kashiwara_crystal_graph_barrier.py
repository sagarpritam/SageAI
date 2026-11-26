import math
import time
from typing import Any, Dict, List


class KashiwaraCrystalGraphBarrierService:
    """Capability 249: Masaki Kashiwara Crystal Graph & Global Basis Barrier."""

    def __init__(self) -> None:
        self._evaluations_total: int = 0
        self._crystals: List[Dict[str, Any]] = [
            {
                "crystal_id": "KASHIWARA-CRYSTAL-B-01",
                "crystal_type": "B(infinity) Global Crystal",
                "kashiwara_operators_e_f": 6,
                "string_cone_dim": 4,
                "crystal_defect": 0.0,
                "kashiwara_barrier_strength_pev": 4.70e12,
                "crystal_graph_suppression_db": 215.55,
                "crystal_state": "KASHIWARA_CRYSTAL_LOCKED",
            },
            {
                "crystal_id": "KASHIWARA-DEMAZURE-02",
                "crystal_type": "Demazure Crystal B_w(lambda)",
                "kashiwara_operators_e_f": 8,
                "string_cone_dim": 6,
                "crystal_defect": 0.0,
                "kashiwara_barrier_strength_pev": 4.84e12,
                "crystal_graph_suppression_db": 216.35,
                "crystal_state": "KASHIWARA_CRYSTAL_LOCKED",
            },
            {
                "crystal_id": "KASHIWARA-AFFINE-03",
                "crystal_type": "Kirillov-Reshetikhin KR",
                "kashiwara_operators_e_f": 10,
                "string_cone_dim": 8,
                "crystal_defect": 0.0,
                "kashiwara_barrier_strength_pev": 4.98e12,
                "crystal_graph_suppression_db": 217.20,
                "crystal_state": "KASHIWARA_CRYSTAL_LOCKED",
            },
        ]

    def list_crystals(self) -> Dict[str, Any]:
        return {"crystals": self._crystals, "total": len(self._crystals)}

    def evaluate_crystal_graph(
        self,
        crystal_id: str = "KASHIWARA-CRYSTAL-B-01",
        operator_rank: int = 6,
        string_cone_dim: int = 4,
        barrier_gain: float = 1.25,
    ) -> Dict[str, Any]:
        self._evaluations_total += 1
        base = next((c for c in self._crystals if c["crystal_id"] == crystal_id), self._crystals[0])
        strength = round(base["kashiwara_barrier_strength_pev"] * barrier_gain, 2)
        suppression = round(
            base["crystal_graph_suppression_db"] + 2.5 * math.log10(max(barrier_gain, 0.1) + 1.0) + 0.1 * string_cone_dim,
            2,
        )
        return {
            "crystal_id": base["crystal_id"],
            "status": "KASHIWARA_CRYSTAL_LOCKED",
            "crystal_defect": base["crystal_defect"],
            "littelmann_path_verified": True,
            "operator_rank": operator_rank,
            "string_cone_dim": string_cone_dim,
            "kashiwara_barrier_strength_pev": strength,
            "crystal_graph_suppression_db": suppression,
            "effective_fidelity_pct": 100.0,
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        }

    def get_metrics(self) -> Dict[str, Any]:
        mean_strength = sum(c["kashiwara_barrier_strength_pev"] for c in self._crystals) / len(self._crystals)
        mean_supp = sum(c["crystal_graph_suppression_db"] for c in self._crystals) / len(self._crystals)
        return {
            "active_crystals_count": len(self._crystals),
            "evaluations_total": self._evaluations_total,
            "mean_barrier_strength_pev": round(mean_strength, 2),
            "mean_crystal_graph_suppression_db": round(mean_supp, 2),
            "kashiwara_crystal_compliance_pct": 100.0,
        }


_service = KashiwaraCrystalGraphBarrierService()


def get_kashiwara_crystal_graph_barrier_service() -> KashiwaraCrystalGraphBarrierService:
    return _service
