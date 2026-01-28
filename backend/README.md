# FastAPI Backend Skeleton

This directory contains a minimal FastAPI application implementing the core endpoints described in the generative AI specification.

## Endpoints
- `POST /api/lead/intake`
- `POST /api/chat`
- `POST /api/pdf/proposal`
- `POST /api/payment/create`
- `POST /webhooks/whatsapp`
- `POST /webhooks/mercadopago`

All handlers are placeholders and require implementation for production use.

## Development
Install dependencies:
```bash
pip install -r requirements.txt
```
Run the server:
```bash
uvicorn main:app --reload
```
