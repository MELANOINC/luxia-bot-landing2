import httpx
from ..config import settings


def send_whatsapp_message(text: str) -> bool:
    if not settings.whatsapp_token or not settings.whatsapp_phone_id or not settings.whatsapp_to:
        return False
    url = f"https://graph.facebook.com/v18.0/{settings.whatsapp_phone_id}/messages"
    headers = {
        "Authorization": f"Bearer {settings.whatsapp_token}",
        "Content-Type": "application/json",
    }
    payload = {
        "messaging_product": "whatsapp",
        "to": settings.whatsapp_to,
        "type": "text",
        "text": {"body": text},
    }
    try:
        with httpx.Client(timeout=10) as client:
            r = client.post(url, headers=headers, json=payload)
            return r.status_code in (200, 201)
    except Exception:
        return False