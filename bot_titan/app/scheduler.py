import logging
from apscheduler.schedulers.background import BackgroundScheduler
from fastapi import FastAPI
from .services.training import train_pipeline

logger = logging.getLogger(__name__)

scheduler = BackgroundScheduler(timezone="UTC")


def start_scheduler(app: FastAPI):
    if scheduler.running:
        return
    # Weekly at Sunday 03:00 UTC
    scheduler.add_job(lambda: train_pipeline(), trigger="cron", day_of_week="sun", hour=3, minute=0)
    scheduler.start()
    logger.info("Scheduler started with weekly training job")