from fastapi import FastAPI, Request, HTTPException
from pydantic import BaseModel
import httpx
import os
import json

app = FastAPI()

class LeadIntake(BaseModel):
    name: str | None = None
    email: str | None = None
    phone: str | None = None
    country: str | None = None
    interest: str
    message: str | None = None
    turnstile_token: str

class ChatRequest(BaseModel):
    lead_id: str
    message: str

class PDFRequest(BaseModel):
    lead_id: str
    product: str
    language: str = "es"

class PaymentRequest(BaseModel):
    lead_id: str
    product: str

async def call_llm(system: str, user: str) -> str:
    """Placeholder for LLM provider call."""
    # TODO: integrate with real LLM provider
    return '{}'

async def verify_turnstile(token: str, ip: str) -> bool:
    secret = os.environ.get("TURNSTILE_SECRET", "")
    async with httpx.AsyncClient() as client:
        r = await client.post(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            data={"secret": secret, "response": token, "remoteip": ip},
            timeout=10,
        )
    data = r.json()
    return data.get("success", False)

@app.post("/api/lead/intake")
async def intake(payload: LeadIntake, request: Request):
    if not await verify_turnstile(payload.turnstile_token, request.client.host):
        raise HTTPException(status_code=400, detail="turnstile_failed")
    prompt_sys = "Eres un analista comercial de MELANO INC. Devuelves JSON."
    prompt_user = json.dumps({
        "name": payload.name,
        "email": payload.email,
        "phone": payload.phone,
        "country": payload.country,
        "interest": payload.interest,
        "message": payload.message or "",
    })
    out = await call_llm(prompt_sys, prompt_user)
    # TODO: parse JSON, store in Supabase, compute next actions
    return {"lead_id": "placeholder", "score": 0, "next_actions": []}

@app.post("/api/chat")
async def chat(payload: ChatRequest):
    # TODO: implement chat logic with LLM and RAG
    return {"reply": "", "suggested_next": [], "logs_id": None}

@app.post("/api/pdf/proposal")
async def pdf_proposal(payload: PDFRequest):
    # TODO: render proposal and upload to Supabase Storage
    return {"pdf_url": ""}

@app.post("/api/payment/create")
async def payment_create(payload: PaymentRequest):
    # TODO: integrate with MercadoPago to create checkout
    return {"checkout_url": "", "order_id": ""}

@app.post("/webhooks/whatsapp")
async def whatsapp_webhook(request: Request):
    payload = await request.json()
    # TODO: handle WhatsApp webhook, route via AI, log conversation
    return {"ok": True}

@app.post("/webhooks/mercadopago")
async def mercadopago_webhook(request: Request):
    payload = await request.json()
    # TODO: update order status and trigger fulfilment workflow
    return {"ok": True}

