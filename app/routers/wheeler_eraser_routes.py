from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

from app.services.security.wheeler_eraser_sentinel import wheeler_eraser_sentinel

router = APIRouter(
    prefix="/api/security/wheeler-eraser-sentinel", tags=["Wheeler Eraser Sentinel"]
)


class EraseWhichWayRequest(BaseModel):
    sector_id: Optional[str] = "WHEELER-DELAYED-CHOICE-CORE"
    optical_delay_ns: Optional[float] = 0.5


@router.get("/posture")
async def get_posture():
    return wheeler_eraser_sentinel.get_posture()


@router.get("/sectors")
async def get_sectors():
    return wheeler_eraser_sentinel.get_sectors()


@router.post("/erase-which-way")
async def erase_which_way(req: EraseWhichWayRequest):
    return wheeler_eraser_sentinel.erase_which_way(
        sector_id=req.sector_id, optical_delay_ns=req.optical_delay_ns
    )
