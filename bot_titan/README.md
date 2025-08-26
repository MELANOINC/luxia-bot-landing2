# Titan Bot\u2122 Backend (FastAPI + DL + Quantum-inspired)

Deep-learning signal engine with optional quantum-inspired optimizer, weekly auto-training, Supabase embeddings, and WhatsApp notifications.

## Stack
- FastAPI + Uvicorn
- PyTorch LSTM (price/returns features)
- PennyLane (optional) for quantum-inspired optimizer
- CCXT (Kraken) OHLCV ingest
- Supabase + OpenAI embeddings (pgvector)
- APScheduler weekly jobs
- WhatsApp Cloud API alerts

## Setup
1. Python 3.11
2. Create env file:
```
cp .env.example .env
```
3. Install deps:
```
pip install -r requirements.txt
```
4. Run dev:
```
uvicorn main:app --reload --port 8080
```

## Endpoints
- GET /health: liveness
- POST /train: fetch data, train model, store metrics, upsert embeddings
- POST /signals: generate signal for current market snapshot
- POST /notify: send WhatsApp test message

## Scheduler
Starts weekly training job (Sunday 03:00 UTC). Disable by removing scheduler startup in `main.py`.

## Supabase Table
Create a table `titan_embeddings`:
```sql
create table if not exists titan_embeddings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  symbol text,
  timeframe text,
  text text,
  embedding vector(1536)
);
```
Adjust vector dims to your embedding model.

## Docker
```
docker build -t titan-bot:latest .
docker run -p 8080:8080 --env-file .env titan-bot:latest
```

## Notes
- Quantum optimizer is optional; set ENABLE_QUANTUM_OPTIMIZER=false to skip.
- Exchange market access is public for OHLCV; add API keys if needed.