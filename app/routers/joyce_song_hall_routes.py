from fastapi import APIRouter
from pydantic import BaseModel
from app.services.joyce_song_motivic_dt_invariants_firewall import (
    get_joyce_song_motivic_dt_invariants_firewall_service,
)

router = APIRouter(prefix="/api/joyce-song-hall", tags=["Wave 71 Joyce-Song Hall"])


class JoyceSongRequest(BaseModel):
    invariant_id: str = "JOYCE-SONG-HALL-ALGEBRA-01"
    chern_rank: int = 2
    behrend_weight: int = 1
    firewall_gain: float = 1.25


@router.get("/invariants")
async def list_invariants():
    return get_joyce_song_motivic_dt_invariants_firewall_service().list_invariants()


@router.post("/evaluate-joyce-song")
async def evaluate_joyce_song(req: JoyceSongRequest):
    return get_joyce_song_motivic_dt_invariants_firewall_service().evaluate_joyce_song(
        invariant_id=req.invariant_id,
        chern_rank=req.chern_rank,
        behrend_weight=req.behrend_weight,
        firewall_gain=req.firewall_gain,
    )


@router.get("/metrics")
async def get_metrics():
    return get_joyce_song_motivic_dt_invariants_firewall_service().get_metrics()
