import os
from dataclasses import dataclass

@dataclass
class Settings:
    exchange: str = os.getenv("EXCHANGE", "kraken")
    symbol: str = os.getenv("SYMBOL", "BTC/USDT")
    timeframe: str = os.getenv("TIMEFRAME", "1h")
    lookback_hours: int = int(os.getenv("LOOKBACK_HOURS", "720"))

    train_epochs: int = int(os.getenv("TRAIN_EPOCHS", "3"))
    train_batch_size: int = int(os.getenv("TRAIN_BATCH_SIZE", "32"))
    learning_rate: float = float(os.getenv("LEARNING_RATE", "0.0007"))

    supabase_url: str = os.getenv("SUPABASE_URL", "")
    supabase_anon_key: str = os.getenv("SUPABASE_ANON_KEY", "")
    supabase_service_role: str = os.getenv("SUPABASE_SERVICE_ROLE", "")
    supabase_embeddings_table: str = os.getenv("SUPABASE_EMBEDDINGS_TABLE", "titan_embeddings")

    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    openai_embedding_model: str = os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")

    whatsapp_token: str = os.getenv("WHATSAPP_TOKEN", "")
    whatsapp_phone_id: str = os.getenv("WHATSAPP_PHONE_ID", "")
    whatsapp_to: str = os.getenv("WHATSAPP_TO", "")

    enable_quantum_optimizer: bool = os.getenv("ENABLE_QUANTUM_OPTIMIZER", "true").lower() == "true"

settings = Settings()