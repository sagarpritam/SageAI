from fastapi import APIRouter
from pydantic import BaseModel
from app.services.iwasawa_main_conjecture_cyclotomic_firewall import (
    get_iwasawa_main_conjecture_cyclotomic_firewall_service,
)

router = APIRouter(prefix="/api/iwasawa-main-conjecture", tags=["Wave 66 Iwasawa Main Conjecture"])


class IwasawaRequest(BaseModel):
    extension_id: str = "IWASAWA-ZP-CYCLOTOMIC-01"
    prime_p: int = 5
    lambda_invariant: int = 1
    firewall_gain: float = 1.25


@router.get("/extensions")
async def list_extensions():
    return get_iwasawa_main_conjecture_cyclotomic_firewall_service().list_extensions()


@router.post("/evaluate-iwasawa-ideal")
async def evaluate_iwasawa_ideal(req: IwasawaRequest):
    return get_iwasawa_main_conjecture_cyclotomic_firewall_service().evaluate_iwasawa_ideal(
        extension_id=req.extension_id,
        prime_p=req.prime_p,
        lambda_invariant=req.lambda_invariant,
        firewall_gain=req.firewall_gain,
    )


@router.get("/metrics")
async def get_metrics():
    return get_iwasawa_main_conjecture_cyclotomic_firewall_service().get_metrics()
