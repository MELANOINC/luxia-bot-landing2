import os
from fastapi import FastAPI
from dotenv import load_dotenv
from app.routers import health, train, signals, webhooks
from app.scheduler import start_scheduler

load_dotenv()

app = FastAPI(title="Titan Bot Backend", version="1.0.0")

app.include_router(health.router)
app.include_router(train.router)
app.include_router(signals.router)
app.include_router(webhooks.router)

@app.on_event("startup")
def on_startup():
    if os.getenv("ENV", "development") != "test":
        start_scheduler(app)