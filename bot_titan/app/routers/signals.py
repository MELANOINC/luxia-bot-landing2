from fastapi import APIRouter
from pydantic import BaseModel
from ..services.training import generate_live_signal

router = APIRouter(prefix="", tags=["signals"])

class SignalRequest(BaseModel):
    symbol: str | None = None
    timeframe: str | None = None

@router.post("/signals")
def signals(req: SignalRequest):
    signal, meta = generate_live_signal(symbol=req.symbol, timeframe=req.timeframe)
    return {"signal": signal, "meta": meta}