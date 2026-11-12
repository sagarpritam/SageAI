"""
FastAPI Router for Capability 146: Chromatic Homotopy Theory & Morava E-Theory Firewall.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.chromatic_homotopy_morava.chromatic_homotopy_morava import (
    get_chromatic_morava_firewall,
)

router = APIRouter(
    prefix="/api/chromatic-homotopy-morava",
    tags=["Capability 146: Chromatic Homotopy & Morava E-Theory"],
)


class SealChromaticRequest(BaseModel):
    spectrum_id: str = Field(..., description="ID of the chromatic Morava spectrum")
    morava_height: int = Field(
        default=4, ge=1, le=16, description="Morava K(n) chromatic height stratum"
    )
    formal_group_rank: int = Field(
        default=8, ge=2, le=64, description="Lubin-Tate formal group deformation rank"
    )
    stabilizer_orbifold_nodes: int = Field(
        default=16, ge=4, le=128, description="Morava stabilizer orbifold nodes"
    )
    chromatic_gain: float = Field(
        default=1.6,
        ge=0.85,
        le=2.5,
        description="Bousfield localization coherence gain",
    )


@router.get("/spectra")
async def list_chromatic_spectra():
    """List registered Chromatic Homotopy & Morava E-Theory spectra."""
    fw = get_chromatic_morava_firewall()
    return {"spectra": fw.get_spectra()}


@router.post("/seal-chromatic")
async def seal_chromatic_stratum_route(request: SealChromaticRequest):
    """Seal chromatic fracture square and lock Lubin-Tate deformation bounds."""
    fw = get_chromatic_morava_firewall()
    try:
        return fw.seal_chromatic_stratum(
            spectrum_id=request.spectrum_id,
            morava_height=request.morava_height,
            formal_group_rank=request.formal_group_rank,
            stabilizer_orbifold_nodes=request.stabilizer_orbifold_nodes,
            chromatic_gain=request.chromatic_gain,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/metrics")
async def get_chromatic_metrics():
    """Retrieve aggregate Chromatic Homotopy & Morava E-Theory Firewall metrics."""
    fw = get_chromatic_morava_firewall()
    return fw.get_chromatic_metrics()
