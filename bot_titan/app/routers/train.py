from fastapi import APIRouter
from ..services.training import train_pipeline

router = APIRouter(prefix="", tags=["train"])

@router.post("/train")
def trigger_train():
    metrics = train_pipeline()
    return {"ok": True, "metrics": metrics}