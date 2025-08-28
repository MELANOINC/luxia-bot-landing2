from fastapi import APIRouter
from pydantic import BaseModel
from ..services.whatsapp import send_whatsapp_message

router = APIRouter(prefix="", tags=["notify"])

class NotifyRequest(BaseModel):
    text: str

@router.post("/notify")
def notify(req: NotifyRequest):
    ok = send_whatsapp_message(req.text)
    return {"ok": ok}